import json
import logging
from decimal import Decimal
from typing import List, Dict, Any, Optional
from botocore.exceptions import ClientError
from backend.services.aws_config import aws_config

logger = logging.getLogger("ripple.dynamodb")


def _json_to_dynamo(data: Any) -> Any:
    """Recursively converts Python float values to Decimal for DynamoDB serialization."""
    if isinstance(data, float):
        return Decimal(str(data))
    elif isinstance(data, dict):
        return {k: _json_to_dynamo(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [_json_to_dynamo(v) for v in data]
    return data


def _dynamo_to_json(data: Any) -> Any:
    """Recursively converts Decimal values back to float/int for JSON serialization."""
    if isinstance(data, Decimal):
        return int(data) if data % 1 == 0 else float(data)
    elif isinstance(data, dict):
        return {k: _dynamo_to_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [_dynamo_to_json(v) for v in data]
    return data


class DynamoDBService:
    """
    Manages persistent storage in Amazon DynamoDB for Ripple.
    Provides table creation, seeding, batch writes, and CRUD operations.
    """

    def __init__(self):
        self.prefix = aws_config.table_prefix
        self.students_table_name = f"{self.prefix}students"
        self.policies_table_name = f"{self.prefix}policies"
        self.rules_table_name = f"{self.prefix}rules"
        self.audit_table_name = f"{self.prefix}audit-ledger"
        self.analyses_table_name = f"{self.prefix}analyses"

    def get_resource(self):
        session = aws_config.get_session()
        return session.resource("dynamodb", region_name=aws_config.region)

    def get_client(self):
        session = aws_config.get_session()
        return session.client("dynamodb", region_name=aws_config.region)

    def is_available(self) -> bool:
        """Quick check whether DynamoDB tables can be accessed."""
        try:
            client = self.get_client()
            client.describe_table(TableName=self.students_table_name)
            return True
        except Exception:
            return False

    def create_tables(self) -> Dict[str, str]:
        """Creates all required DynamoDB tables if they don't already exist."""
        client = self.get_client()
        status = {}

        tables_spec = [
            {
                "TableName": self.students_table_name,
                "KeySchema": [{"AttributeName": "student_id", "KeyType": "HASH"}],
                "AttributeDefinitions": [
                    {"AttributeName": "student_id", "AttributeType": "S"},
                    {"AttributeName": "course_id", "AttributeType": "S"}
                ],
                "GlobalSecondaryIndexes": [
                    {
                        "IndexName": "CourseIndex",
                        "KeySchema": [{"AttributeName": "course_id", "KeyType": "HASH"}],
                        "Projection": {"ProjectionType": "ALL"}
                    }
                ],
                "BillingMode": "PAY_PER_REQUEST"
            },
            {
                "TableName": self.policies_table_name,
                "KeySchema": [{"AttributeName": "sample_key", "KeyType": "HASH"}],
                "AttributeDefinitions": [{"AttributeName": "sample_key", "AttributeType": "S"}],
                "BillingMode": "PAY_PER_REQUEST"
            },
            {
                "TableName": self.rules_table_name,
                "KeySchema": [{"AttributeName": "rule_id", "KeyType": "HASH"}],
                "AttributeDefinitions": [{"AttributeName": "rule_id", "AttributeType": "S"}],
                "BillingMode": "PAY_PER_REQUEST"
            },
            {
                "TableName": self.audit_table_name,
                "KeySchema": [
                    {"AttributeName": "id", "KeyType": "HASH"},
                    {"AttributeName": "timestamp", "KeyType": "RANGE"}
                ],
                "AttributeDefinitions": [
                    {"AttributeName": "id", "AttributeType": "S"},
                    {"AttributeName": "timestamp", "AttributeType": "S"}
                ],
                "BillingMode": "PAY_PER_REQUEST"
            },
            {
                "TableName": self.analyses_table_name,
                "KeySchema": [{"AttributeName": "analysis_id", "KeyType": "HASH"}],
                "AttributeDefinitions": [{"AttributeName": "analysis_id", "AttributeType": "S"}],
                "BillingMode": "PAY_PER_REQUEST"
            }
        ]

        for spec in tables_spec:
            tname = spec["TableName"]
            try:
                client.create_table(**spec)
                status[tname] = "CREATING"
            except ClientError as e:
                if e.response["Error"]["Code"] == "ResourceInUseException":
                    status[tname] = "EXISTS"
                else:
                    status[tname] = f"ERROR: {e.response['Error']['Message']}"
            except Exception as ex:
                status[tname] = f"ERROR: {str(ex)}"

        return status

    # --- Student Operations ---

    def batch_put_students(self, students: List[Dict[str, Any]]) -> int:
        """Batches student cohort records into DynamoDB."""
        try:
            dynamo = self.get_resource()
            table = dynamo.Table(self.students_table_name)
            count = 0
            with table.batch_writer() as batch:
                for s in students:
                    batch.put_item(Item=_json_to_dynamo(s))
                    count += 1
            return count
        except Exception as e:
            logger.warning(f"DynamoDB batch_put_students error: {e}")
            return 0

    def get_all_students(self) -> Optional[List[Dict[str, Any]]]:
        """Fetches all students from DynamoDB table."""
        try:
            dynamo = self.get_resource()
            table = dynamo.Table(self.students_table_name)
            items = []
            response = table.scan()
            items.extend(response.get("Items", []))
            while "LastEvaluatedKey" in response:
                response = table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
                items.extend(response.get("Items", []))
            return [_dynamo_to_json(item) for item in items]
        except Exception as e:
            logger.warning(f"DynamoDB get_all_students error: {e}")
            return None

    def get_student(self, student_id: str) -> Optional[Dict[str, Any]]:
        try:
            dynamo = self.get_resource()
            table = dynamo.Table(self.students_table_name)
            response = table.get_item(Key={"student_id": student_id})
            item = response.get("Item")
            return _dynamo_to_json(item) if item else None
        except Exception as e:
            logger.warning(f"DynamoDB get_student error: {e}")
            return None

    # --- Rule Operations ---

    def put_rule(self, rule: Dict[str, Any]) -> bool:
        try:
            dynamo = self.get_resource()
            table = dynamo.Table(self.rules_table_name)
            table.put_item(Item=_json_to_dynamo(rule))
            return True
        except Exception as e:
            logger.warning(f"DynamoDB put_rule error: {e}")
            return False

    def get_rule(self, rule_id: str) -> Optional[Dict[str, Any]]:
        try:
            dynamo = self.get_resource()
            table = dynamo.Table(self.rules_table_name)
            response = table.get_item(Key={"rule_id": rule_id})
            item = response.get("Item")
            return _dynamo_to_json(item) if item else None
        except Exception as e:
            logger.warning(f"DynamoDB get_rule error: {e}")
            return None

    def get_all_rules(self) -> Optional[List[Dict[str, Any]]]:
        try:
            dynamo = self.get_resource()
            table = dynamo.Table(self.rules_table_name)
            response = table.scan()
            return [_dynamo_to_json(i) for i in response.get("Items", [])]
        except Exception as e:
            logger.warning(f"DynamoDB get_all_rules error: {e}")
            return None

    # --- Policy Operations ---

    def put_policy(self, policy: Dict[str, Any]) -> bool:
        try:
            dynamo = self.get_resource()
            table = dynamo.Table(self.policies_table_name)
            table.put_item(Item=_json_to_dynamo(policy))
            return True
        except Exception as e:
            logger.warning(f"DynamoDB put_policy error: {e}")
            return False

    def get_all_policies(self) -> Optional[List[Dict[str, Any]]]:
        try:
            dynamo = self.get_resource()
            table = dynamo.Table(self.policies_table_name)
            response = table.scan()
            return [_dynamo_to_json(i) for i in response.get("Items", [])]
        except Exception as e:
            logger.warning(f"DynamoDB get_all_policies error: {e}")
            return None

    # --- Audit Ledger Operations ---

    def put_audit_entry(self, entry: Dict[str, Any]) -> bool:
        try:
            dynamo = self.get_resource()
            table = dynamo.Table(self.audit_table_name)
            table.put_item(Item=_json_to_dynamo(entry))
            return True
        except Exception as e:
            logger.warning(f"DynamoDB put_audit_entry error: {e}")
            return False

    def get_audit_entries(self, limit: int = 50) -> Optional[List[Dict[str, Any]]]:
        try:
            dynamo = self.get_resource()
            table = dynamo.Table(self.audit_table_name)
            response = table.scan(Limit=limit)
            items = [_dynamo_to_json(i) for i in response.get("Items", [])]
            items.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
            return items
        except Exception as e:
            logger.warning(f"DynamoDB get_audit_entries error: {e}")
            return None

    # --- Analysis Runs ---

    def put_analysis(self, analysis: Dict[str, Any]) -> bool:
        try:
            dynamo = self.get_resource()
            table = dynamo.Table(self.analyses_table_name)
            table.put_item(Item=_json_to_dynamo(analysis))
            return True
        except Exception as e:
            logger.warning(f"DynamoDB put_analysis error: {e}")
            return False

    def get_analysis(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        try:
            dynamo = self.get_resource()
            table = dynamo.Table(self.analyses_table_name)
            response = table.get_item(Key={"analysis_id": analysis_id})
            item = response.get("Item")
            return _dynamo_to_json(item) if item else None
        except Exception as e:
            logger.warning(f"DynamoDB get_analysis error: {e}")
            return None


dynamodb_service = DynamoDBService()
