import os
import io
import logging
from pathlib import Path
from typing import Optional, Dict, Any, List
from botocore.exceptions import ClientError
from backend.services.aws_config import aws_config

logger = logging.getLogger("ripple.s3")

# On AWS Lambda, /var/task is read-only — use /tmp for local fallback storage
_is_lambda = bool(os.environ.get("AWS_LAMBDA_FUNCTION_NAME"))
LOCAL_STORAGE_DIR = Path("/tmp/circulars") if _is_lambda else Path("backend/data/circulars")
LOCAL_STORAGE_DIR.mkdir(parents=True, exist_ok=True)


class S3Service:
    """
    Manages institutional policy document storage in Amazon S3
    with local disk fallback for offline/development operation.
    """

    def __init__(self):
        self.bucket_name = aws_config.s3_bucket
        self.region = aws_config.region

    def get_client(self):
        session = aws_config.get_session()
        return session.client("s3", region_name=self.region)

    def is_available(self) -> bool:
        try:
            client = self.get_client()
            client.head_bucket(Bucket=self.bucket_name)
            return True
        except Exception:
            return False

    def create_bucket(self) -> Dict[str, Any]:
        """Creates the S3 bucket with encryption and public access blocked."""
        client = self.get_client()
        try:
            if self.region == "us-east-1":
                client.create_bucket(Bucket=self.bucket_name)
            else:
                client.create_bucket(
                    Bucket=self.bucket_name,
                    CreateBucketConfiguration={"LocationConstraint": self.region}
                )

            # Enforce server-side encryption
            client.put_bucket_encryption(
                Bucket=self.bucket_name,
                ServerSideEncryptionConfiguration={
                    "Rules": [
                        {"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}
                    ]
                }
            )

            # Block public access per AWS Well-Architected Framework
            client.put_public_access_block(
                Bucket=self.bucket_name,
                PublicAccessBlockConfiguration={
                    "BlockPublicAcls": True,
                    "IgnorePublicAcls": True,
                    "BlockPublicPolicy": True,
                    "RestrictPublicBuckets": True
                }
            )
            return {"status": "CREATED", "bucket": self.bucket_name}
        except ClientError as e:
            code = e.response["Error"]["Code"]
            if code in ["BucketAlreadyOwnedByYou", "BucketAlreadyExists"]:
                return {"status": "EXISTS", "bucket": self.bucket_name}
            return {"status": "ERROR", "message": e.response["Error"]["Message"]}
        except Exception as ex:
            return {"status": "ERROR", "message": str(ex)}

    def upload_file(
        self,
        content: bytes,
        filename: str,
        content_type: str = "application/pdf",
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Uploads a policy document to S3 or falls back to local storage.
        """
        s3_key = f"policies/{filename}"
        s3_success = False

        # Attempt S3 Upload
        try:
            client = self.get_client()
            extra_args = {"ContentType": content_type}
            if metadata:
                extra_args["Metadata"] = metadata

            client.upload_fileobj(
                Fileobj=io.BytesIO(content),
                Bucket=self.bucket_name,
                Key=s3_key,
                ExtraArgs=extra_args
            )
            s3_success = True
        except Exception as e:
            logger.warning(f"S3 upload failed: {e}. Storing locally.")

        # Only write locally if S3 failed (Lambda /tmp fallback) or running locally
        local_path = LOCAL_STORAGE_DIR / filename
        if not s3_success:
            with open(local_path, "wb") as f:
                f.write(content)

        return {
            "filename": filename,
            "s3_key": s3_key if s3_success else None,
            "s3_bucket": self.bucket_name if s3_success else None,
            "local_path": str(local_path) if not s3_success else None,
            "storage_mode": "Amazon S3 (Encrypted)" if s3_success else "Local Storage (Fallback)",
            "size_bytes": len(content)
        }

    def get_presigned_url(self, filename: str, expiration: int = 3600) -> Optional[str]:
        """Generates a secure pre-signed download URL for a circular."""
        try:
            client = self.get_client()
            return client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": f"policies/{filename}"},
                ExpiresIn=expiration
            )
        except Exception as e:
            logger.warning(f"S3 presigned URL failed: {e}")
            return None

    def list_policy_files(self) -> List[Dict[str, Any]]:
        """Lists uploaded policy documents from S3 or local disk."""
        files = []
        try:
            client = self.get_client()
            response = client.list_objects_v2(Bucket=self.bucket_name, Prefix="policies/")
            for obj in response.get("Contents", []):
                key = obj["Key"]
                filename = key.replace("policies/", "")
                if filename:
                    files.append({
                        "filename": filename,
                        "size": obj["Size"],
                        "last_modified": obj["LastModified"].isoformat(),
                        "storage": "S3"
                    })
            if files:
                return files
        except Exception:
            pass

        # Fallback to local files
        for p in LOCAL_STORAGE_DIR.glob("*"):
            if p.is_file():
                files.append({
                    "filename": p.name,
                    "size": p.stat().st_size,
                    "last_modified": str(p.stat().st_mtime),
                    "storage": "Local"
                })
        return files


s3_service = S3Service()
