#!/usr/bin/env python3
"""
Ripple AWS Seeder Script
Initializes DynamoDB tables, creates the encrypted S3 bucket,
and synchronizes 100 synthetic student records and sample policy circulars.
"""

import sys
import os

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.services.aws_config import aws_config
from backend.services.dynamodb_service import dynamodb_service
from backend.services.s3_service import s3_service
from backend.repositories.student_repository import student_repository
from pathlib import Path


def main():
    print("==================================================")
    print("🌊 Ripple Institutional Policy Engine — AWS Seeder")
    print("==================================================")

    creds = aws_config.get_credentials_status()
    print(f"\n[1] Checking AWS Credentials:")
    print(f"    Region:  {aws_config.region}")
    print(f"    Status:  {creds.get('status')}")
    print(f"    Message: {creds.get('message')}")

    if not creds["valid"]:
        print("\n⚠️  AWS credentials are not active or have expired.")
        print("    Please run 'aws login' or set AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY.")
        print("    The application will continue operating seamlessly in Local Fallback Mode.")
        return

    print("\n[2] Creating / Verifying Amazon DynamoDB Tables:")
    table_status = dynamodb_service.create_tables()
    for tbl, stat in table_status.items():
        print(f"    • {tbl}: {stat}")

    print("\n[3] Creating / Verifying Amazon S3 Policy Bucket:")
    bucket_status = s3_service.create_bucket()
    print(f"    • Bucket '{aws_config.s3_bucket}': {bucket_status}")

    print("\n[4] Populating Student Cohort into DynamoDB:")
    count = student_repository.sync_to_dynamodb()
    print(f"    • Uploaded {count} student records to DynamoDB ({aws_config.table_prefix}students).")

    print("\n[5] Synchronizing Sample Circulars into S3:")
    sample_dir = Path("backend/data/sample_policies")
    uploaded_files = 0
    if sample_dir.exists():
        for fpath in sample_dir.glob("*"):
            if fpath.is_file():
                with open(fpath, "rb") as f:
                    content = f.read()
                ctype = "application/pdf" if fpath.name.endswith(".pdf") else "text/plain"
                res = s3_service.upload_file(content, fpath.name, content_type=ctype)
                print(f"    • {fpath.name} -> {res.get('storage_mode')}")
                uploaded_files += 1

    print(f"\n✅ AWS Seeding Complete! {count} students & {uploaded_files} circulars synced to AWS ({aws_config.region}).")


if __name__ == "__main__":
    main()
