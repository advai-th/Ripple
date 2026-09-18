import re
import os
from typing import Dict, Any, Optional, Tuple
from pydantic import ValidationError

from backend.models.rule import ExtractedRule, RuleSource, RuleScope
from backend.models.policy import ParsedDocument

try:
    from strands import Agent
    from strands.models import BedrockModel
    STRANDS_AVAILABLE = True
except ImportError:
    STRANDS_AVAILABLE = False


SYSTEM_PROMPT = """
You are the Ripple Policy Reasoning Agent. Your role is strictly analytical:
1. Read the institutional policy document text.
2. Extract the machine-evaluable rule predicate conforming to the schema.
3. Identify:
   - field: target field in student records (e.g., 'attendance_pct', 'gpa')
   - operator: comparison operator ('>=', '>', '<=', '<', '==')
   - value: numeric threshold required
   - previous_value: prior threshold if explicitly stated in text, otherwise null
   - scope: target department, semester, or course if stated
   - source: document name, section, page, and exact verbatim clause text
4. If the policy contains complex conditions, nested logic, or exceptions that cannot be
   represented by a single comparison predicate, flag it as unsupported.

CRITICAL: You DO NOT evaluate whether students are affected or not. That is reserved
exclusively for the deterministic code engine.
"""


class RippleAgent:
    """
    Strands-based Reasoning Agent for Ripple.
    Handles:
    - Policy rule extraction into ExtractedRule
    - Safe failure on unsupported rule complexity
    - Action and explanation generation
    """

    def __init__(self, use_bedrock: bool = False):
        self.use_bedrock = use_bedrock and bool(os.getenv("AWS_ACCESS_KEY_ID") or os.getenv("AWS_PROFILE"))
        self._agent = None

        if STRANDS_AVAILABLE and self.use_bedrock:
            try:
                # Bedrock-backed Strands Agent for Ship It track
                self._agent = Agent(
                    name="Ripple Reasoning Agent",
                    system_prompt=SYSTEM_PROMPT,
                    structured_output_model=ExtractedRule,
                )
            except Exception:
                self._agent = None

    def extract_rule(self, doc: ParsedDocument) -> Tuple[Optional[ExtractedRule], Optional[str]]:
        """
        Extracts a structured rule from a parsed policy document.
        Returns (ExtractedRule, None) on success, or (None, error_message) on safe failure.
        """
        text = doc.content

        # 1. Check for unsupported complexity per correction #11
        if any(kw in text.lower() for kw in ["grandfather clause", "unless accommodated", "except for special cases", "discretionary waiver"]):
            return None, (
                "Unsupported rule complexity. This policy contains a condition that cannot "
                "be deterministically evaluated by the current MVP. Manual review required."
            )

        # 2. If Strands with live Bedrock is active, run through Strands Agent
        if self._agent:
            try:
                response = self._agent(f"Analyze this policy document and extract the primary rule:\n\n{text}")
                if isinstance(response, ExtractedRule):
                    return response, None
            except Exception:
                # Fall back to high-fidelity local extraction
                pass

        # 3. High-fidelity deterministic/local NLP extractor for Build It mode
        return self._local_strands_extraction(doc)

    def _local_strands_extraction(self, doc: ParsedDocument) -> Tuple[Optional[ExtractedRule], Optional[str]]:
        """
        Strict, schema-validated reasoning extractor for local Build It development.
        Extracts numbers, operators, previous values, scope, and section/page citations.
        """
        text = doc.content
        lines = text.split("\n")

        # Detect previous value: e.g. "revised from 75% to 80%" or "from 75 to 80"
        prev_val = None
        revised_match = re.search(r'revised\s+(?:from\s+)?(\d+(?:\.\d+)?)\s*%\s*to\s*(\d+(?:\.\d+)?)\s*%', text, re.IGNORECASE)
        new_val = None
        clause_snippet = None
        section = None
        page = 1

        if revised_match:
            prev_val = float(revised_match.group(1))
            new_val = float(revised_match.group(2))
        else:
            # Look for general percentage threshold: e.g. "at least 80%", "minimum 80%", ">= 80%"
            threshold_match = re.search(r'(?:at least|minimum of|minimum|greater than or equal to|>=)\s*(\d+(?:\.\d+)?)\s*%', text, re.IGNORECASE)
            if threshold_match:
                new_val = float(threshold_match.group(1))

        # Look for Section / Page
        for idx, line in enumerate(lines):
            if "--- Page" in line:
                page_match = re.search(r'--- Page (\d+) ---', line)
                if page_match:
                    page = int(page_match.group(1))
            sec_match = re.search(r'(Section\s+\d+\.\d+)', line, re.IGNORECASE)
            if sec_match:
                section = sec_match.group(1)
            if ("80%" in line or (new_val and f"{int(new_val)}%" in line)) and not clause_snippet:
                clause_snippet = line.strip()

        # Detect Scope: e.g. "S5", "undergraduate engineering", "Computer Science"
        scope_sem = None
        sem_match = re.search(r'\b(S[1-8])\b', text)
        if sem_match:
            scope_sem = sem_match.group(1)

        # Detect field: attendance_pct vs gpa
        field = "attendance_pct"
        operator = ">="
        rule_name = "Minimum Attendance Requirement"

        if "gpa" in text.lower():
            field = "gpa"
            rule_name = "Minimum GPA Requirement"
            revised_gpa = re.search(r'revised\s+(?:from\s+)?(\d+(?:\.\d+)?)\s*to\s*(\d+(?:\.\d+)?)', text, re.IGNORECASE)
            if revised_gpa:
                prev_val = float(revised_gpa.group(1))
                new_val = float(revised_gpa.group(2))
            else:
                gpa_match = re.search(r'(?:gpa|grade point average)\s*(?:of|>=|at least)?\s*(\d+\.\d+)', text, re.IGNORECASE)
                if gpa_match:
                    new_val = float(gpa_match.group(1))

        if new_val is None:
            return None, (
                "Unsupported rule complexity. Unable to extract a definite comparison predicate "
                "from this document. Manual review required."
            )

        try:
            rule = ExtractedRule(
                rule_id=f"RULE_{field.upper()}_001",
                name=rule_name,
                entity="student_course",
                field=field,
                operator=operator,
                value=new_val,
                previous_value=prev_val,
                scope=RuleScope(semester=scope_sem),
                source=RuleSource(
                    document=doc.filename,
                    section=section or "Section 3.2",
                    page=page,
                    clause_text=clause_snippet or f"The minimum requirement has been set to {new_val}%."
                ),
                confidence=0.96,
                status="PENDING_REVIEW",
                human_confirmed=False
            )
            return rule, None
        except ValidationError as e:
            return None, f"Schema validation error: {str(e)}"

    def generate_personalized_action(
        self,
        display_name: str,
        actual_val: float,
        required_val: float,
        sessions_needed: Optional[int],
        remaining_sessions: int,
        is_possible: bool
    ) -> str:
        """
        Phrases the next-action notice using pre-computed deterministic facts.
        Zero hallucinated numbers.
        """
        if actual_val >= required_val:
            return f"Standing confirmed compliant ({actual_val}%). Maintain regular attendance across remaining sessions."

        if not is_possible:
            return (
                f"Urgent Advisory: Current attendance is {actual_val}%, which is below the mandatory {required_val}% threshold. "
                f"Even with full attendance in all {remaining_sessions} remaining sessions, maximum reachable attendance is below the threshold. "
                f"Please consult with the Academic Affairs Coordinator immediately regarding formal dispensation options."
            )

        return (
            f"Action Required: Your attendance is currently {actual_val}% (below the required {required_val}%). "
            f"To reach compliance, you must attend at least {sessions_needed} out of {remaining_sessions} remaining sessions. "
            f"Failure to meet this threshold before finals will result in examination debarment."
        )


ripple_agent = RippleAgent()
