import os
import boto3
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Load optional local .env configuration
load_dotenv()

DEFAULT_REGION = os.getenv("AWS_REGION", "ap-south-1")
DEFAULT_BEDROCK_REGION = os.getenv("AWS_BEDROCK_REGION", "us-east-1")
DEFAULT_BEDROCK_MODEL = os.getenv("AWS_BEDROCK_MODEL_ID", "amazon.nova-pro-v1:0")
DYNAMODB_TABLE_PREFIX = os.getenv("AWS_DYNAMODB_PREFIX", "ripple-")
S3_BUCKET_NAME = os.getenv("AWS_S3_BUCKET", "ripple-policy-circulars")


class AWSConfigManager:
    """
    Central AWS Configuration & Diagnostics Manager for Ripple.
    Handles sessions, credential resolution, and health diagnostics
    with zero hard-crash tolerance (resilient fallback).
    """

    def __init__(self):
        self.region = os.getenv("AWS_REGION", DEFAULT_REGION)
        self.bedrock_region = os.getenv("AWS_BEDROCK_REGION", DEFAULT_BEDROCK_REGION)
        self.bedrock_model_id = os.getenv("AWS_BEDROCK_MODEL_ID", DEFAULT_BEDROCK_MODEL)
        self.table_prefix = DYNAMODB_TABLE_PREFIX
        self.s3_bucket = S3_BUCKET_NAME

    def get_session(self, region_name: Optional[str] = None) -> boto3.Session:
        """Creates a boto3 session using ambient or explicit credentials."""
        target_region = region_name or self.region
        profile = os.getenv("AWS_PROFILE")
        if profile:
            try:
                return boto3.Session(profile_name=profile, region_name=target_region)
            except Exception:
                pass
        return boto3.Session(region_name=target_region)

    def get_credentials_status(self) -> Dict[str, Any]:
        """Inspects AWS credentials without exposing secrets."""
        try:
            session = self.get_session()
            creds = session.get_credentials()
            if not creds:
                return {"valid": False, "status": "NO_CREDENTIALS", "message": "No AWS credentials detected."}
            frozen = creds.get_frozen_credentials()
            if not frozen.access_key:
                return {"valid": False, "status": "INCOMPLETE", "message": "Incomplete AWS credentials."}
            
            # Test STS identity safely
            sts = session.client("sts")
            caller = sts.get_caller_identity()
            return {
                "valid": True,
                "status": "ACTIVE",
                "account_id": caller.get("Account", "Unknown"),
                "arn": caller.get("Arn", "Unknown"),
                "user_id": caller.get("UserId", "Unknown"),
                "message": "AWS Session Authenticated"
            }
        except Exception as e:
            err_msg = str(e)
            if "expired" in err_msg.lower() or "token has expired" in err_msg.lower():
                return {"valid": False, "status": "EXPIRED", "message": "AWS Session Expired. Reauthentication required."}
            return {"valid": False, "status": "ERROR", "message": err_msg[:120]}

    def check_bedrock_status(self) -> Dict[str, Any]:
        """Tests Amazon Bedrock runtime accessibility."""
        try:
            session = self.get_session(region_name=self.bedrock_region)
            client = session.client("bedrock", region_name=self.bedrock_region)
            # List foundation models or get model info
            response = client.list_foundation_models(byProvider="Amazon")
            models = [m.get("modelId") for m in response.get("modelSummaries", [])]
            return {
                "accessible": True,
                "region": self.bedrock_region,
                "default_model": self.bedrock_model_id,
                "available_models_count": len(models),
                "mode": "Live Bedrock",
                "message": "Connected to Amazon Bedrock"
            }
        except Exception as e:
            return {
                "accessible": False,
                "region": self.bedrock_region,
                "default_model": self.bedrock_model_id,
                "mode": "Local Fallback",
                "message": f"Bedrock offline: {str(e)[:100]}"
            }

    def check_dynamodb_status(self) -> Dict[str, Any]:
        """Checks DynamoDB connectivity and table presence."""
        try:
            session = self.get_session()
            client = session.client("dynamodb", region_name=self.region)
            response = client.list_tables(Limit=20)
            all_tables = response.get("TableNames", [])
            ripple_tables = [t for t in all_tables if t.startswith(self.table_prefix)]
            return {
                "accessible": True,
                "region": self.region,
                "prefix": self.table_prefix,
                "ripple_tables": ripple_tables,
                "tables_count": len(ripple_tables),
                "mode": "Live DynamoDB" if len(ripple_tables) > 0 else "Ready (Tables Unseeded)",
                "message": f"Connected to DynamoDB ({len(ripple_tables)} tables active)"
            }
        except Exception as e:
            return {
                "accessible": False,
                "region": self.region,
                "prefix": self.table_prefix,
                "ripple_tables": [],
                "tables_count": 0,
                "mode": "Local Mock Fallback",
                "message": f"DynamoDB offline: {str(e)[:100]}"
            }

    def check_s3_status(self) -> Dict[str, Any]:
        """Checks Amazon S3 connectivity and bucket presence."""
        try:
            session = self.get_session()
            client = session.client("s3", region_name=self.region)
            response = client.list_buckets()
            buckets = [b["Name"] for b in response.get("Buckets", [])]
            bucket_exists = self.s3_bucket in buckets
            return {
                "accessible": True,
                "bucket": self.s3_bucket,
                "bucket_exists": bucket_exists,
                "total_buckets": len(buckets),
                "mode": "Live S3" if bucket_exists else "Ready (Bucket Uncreated)",
                "message": f"Connected to S3 (Bucket: {'Found' if bucket_exists else 'Not yet created'})"
            }
        except Exception as e:
            return {
                "accessible": False,
                "bucket": self.s3_bucket,
                "bucket_exists": False,
                "mode": "Local Disk Fallback",
                "message": f"S3 offline: {str(e)[:100]}"
            }

    def get_full_diagnostics(self) -> Dict[str, Any]:
        """Returns consolidated AWS diagnostics for API and UI."""
        creds = self.get_credentials_status()
        bedrock = self.check_bedrock_status() if creds["valid"] else {
            "accessible": False,
            "region": self.bedrock_region,
            "default_model": self.bedrock_model_id,
            "mode": "Local Fallback",
            "message": "Credentials inactive"
        }
        dynamo = self.check_dynamodb_status() if creds["valid"] else {
            "accessible": False,
            "region": self.region,
            "prefix": self.table_prefix,
            "ripple_tables": [],
            "mode": "Local Mock Fallback",
            "message": "Credentials inactive"
        }
        s3 = self.check_s3_status() if creds["valid"] else {
            "accessible": False,
            "bucket": self.s3_bucket,
            "mode": "Local Disk Fallback",
            "message": "Credentials inactive"
        }

        active_cloud_mode = creds["valid"] and (bedrock["accessible"] or dynamo["accessible"])

        return {
            "cloud_mode": "AWS Cloud Active" if active_cloud_mode else "Local Emulation Mode",
            "region": self.region,
            "credentials": creds,
            "bedrock": bedrock,
            "dynamodb": dynamo,
            "s3": s3,
            "architecture": {
                "framework": "FastAPI + AWS Serverless",
                "ai_reasoning": "Amazon Bedrock (Amazon Nova Pro)",
                "data_persistence": "Amazon DynamoDB (Pay-Per-Request)",
                "document_store": "Amazon S3 (Server-Side Encryption)",
                "compute": "AWS Lambda + API Gateway"
            }
        }


aws_config = AWSConfigManager()
