import os
from typing import Literal
from dotenv import load_dotenv

# Load local environment variables if available
load_dotenv()

class RippleSettings:
    """Centralized configuration for Ripple environment and AWS services."""

    # Deployment Environment: 'local' (offline zero-cloud) or 'aws' (production serverless)
    RIPPLE_ENV: Literal["local", "aws"] = os.getenv("RIPPLE_ENV", "local")

    # AWS General Configuration
    AWS_REGION: str = os.getenv("AWS_REGION", "ap-south-1")
    AWS_PROFILE: str = os.getenv("AWS_PROFILE", "")

    # Amazon Bedrock Configuration
    BEDROCK_REGION: str = os.getenv("AWS_BEDROCK_REGION", "us-east-1")
    BEDROCK_MODEL_ID: str = os.getenv(
        "AWS_BEDROCK_MODEL_ID",
        "amazon.nova-pro-v1:0"
    )

    # Amazon Cognito Configuration
    COGNITO_USER_POOL_ID: str = os.getenv("COGNITO_USER_POOL_ID", "")
    COGNITO_CLIENT_ID: str = os.getenv("COGNITO_CLIENT_ID", "")

    # Amazon DynamoDB Configuration
    DYNAMODB_PREFIX: str = os.getenv("AWS_DYNAMODB_PREFIX", "ripple-")

    # Amazon S3 Configuration
    S3_BUCKET: str = os.getenv("AWS_S3_BUCKET", "ripple-policy-circulars")

    @property
    def is_aws_mode(self) -> bool:
        """Determines if the application should use live AWS resources."""
        return self.RIPPLE_ENV.lower() == "aws" or bool(
            os.getenv("AWS_LAMBDA_FUNCTION_NAME") or os.getenv("AWS_EXECUTION_ENV")
        )


settings = RippleSettings()
