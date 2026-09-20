import os
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional

from backend.services.aws_config import aws_config
from backend.services.dynamodb_service import dynamodb_service
from backend.services.s3_service import s3_service
from backend.agents.ripple_agent import ripple_agent
from backend.repositories.student_repository import student_repository
from backend.repositories.audit_repository import audit_repository

router = APIRouter(prefix="/api/aws", tags=["AWS Integration"])


@router.get("/status")
async def get_aws_status():
    """
    Returns full AWS connectivity diagnostics across Amazon Bedrock,
    Amazon DynamoDB, Amazon S3, and authentication identity.
    """
    return aws_config.get_full_diagnostics()


@router.post("/test-bedrock")
async def test_bedrock_runtime():
    """
    Tests Amazon Bedrock live inference via the Bedrock Runtime API.
    Measures latency and returns invocation status.
    """
    return ripple_agent.test_bedrock_live()


@router.post("/sync")
async def sync_aws_resources():
    """
    Initializes AWS DynamoDB tables and S3 bucket, and synchronizes
    the 100-student cohort and sample policy documents into AWS.
    """
    # 1. Check credentials
    creds = aws_config.get_credentials_status()
    if not creds["valid"]:
        return {
            "success": False,
            "status": creds["status"],
            "message": f"Cannot sync to AWS: {creds['message']}. Please configure active AWS credentials."
        }

    results: Dict[str, Any] = {
        "dynamodb": {},
        "s3": {},
        "synced_students": 0,
        "synced_policies": 0
    }

    # 2. Create DynamoDB tables
    try:
        tables_res = dynamodb_service.create_tables()
        results["dynamodb"]["tables"] = tables_res
    except Exception as e:
        results["dynamodb"]["error"] = str(e)

    # 3. Create S3 Bucket
    try:
        bucket_res = s3_service.create_bucket()
        results["s3"]["bucket"] = bucket_res
    except Exception as e:
        results["s3"]["error"] = str(e)

    # 4. Sync Students to DynamoDB
    try:
        synced_count = student_repository.sync_to_dynamodb()
        results["synced_students"] = synced_count
    except Exception as e:
        results["student_sync_error"] = str(e)

    # 5. Sync sample policies to S3
    sample_dir = Path("backend/data/sample_policies")
    if sample_dir.exists():
        policy_count = 0
        for sample_file in sample_dir.glob("*"):
            if sample_file.is_file():
                try:
                    with open(sample_file, "rb") as f:
                        data = f.read()
                    ctype = "application/pdf" if sample_file.name.endswith(".pdf") else "text/plain"
                    s3_service.upload_file(content=data, filename=sample_file.name, content_type=ctype)
                    policy_count += 1
                except Exception:
                    pass
        results["synced_policies"] = policy_count

    # 6. Audit record
    audit_repository.record_event(
        event_type="aws_sync",
        entity_id="aws_infrastructure",
        details={
            "synced_students": results["synced_students"],
            "synced_policies": results["synced_policies"],
            "region": aws_config.region
        }
    )

    results["success"] = True
    results["message"] = f"Successfully synchronized {results['synced_students']} students and {results['synced_policies']} circulars to AWS ({aws_config.region})."
    return results
