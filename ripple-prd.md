# Product Requirements Document: Ripple

**One-line pitch:** Ripple is an AI-powered change-impact engine that turns institutional policy changes into personalized, evidence-backed consequences and actions.

**Status:** Hackathon MVP (3-day build)
**Domain (v1):** Educational institutions
**Document owner:** [Team name]
**Last updated:** [date]

---

## 1. Background & Problem Statement

### 1.1 The problem
Organizations — colleges, HR departments, government agencies, insurers — regularly change policies: attendance thresholds, eligibility criteria, deadlines, benefit rules. When a policy changes, the burden of figuring out *"does this affect me, and what do I need to do about it"* falls entirely on the individual, or on an overworked administrator manually cross-referencing records.

This produces two failure modes:
- **Silent harm**: people who are affected never find out until the consequence has already landed (a student is dropped from a course, a benefit lapses, a deadline is missed).
- **Wasted institutional effort**: administrators spend hours manually reading policy text and cross-checking spreadsheets to determine who is impacted, work that is repetitive, error-prone, and doesn't scale.

### 1.2 Why now
- LLMs have made it tractable to extract structured meaning from unstructured policy text (a task that previously required manual legal/compliance review).
- Institutions increasingly hold structured operational data (student information systems, HR systems) that can, in principle, be queried programmatically.
- Research on change-impact analysis (including graph-based and, more recently, hybrid semantic+graph approaches) validates the general technical direction of linking a change to a structured impact graph. **Ripple does not claim to invent change-impact analysis as a concept.** Its contribution is the applied architecture: combining unstructured policy documents with structured organizational records, LLM reasoning, and deterministic validation to compute **person-level**, evidence-backed consequences inside a specific institutional workflow.

### 1.3 Non-goals for this document
This PRD describes the hackathon MVP and the immediate next steps beyond it. It does not attempt to fully specify a multi-tenant, cross-institution production platform — that is explicitly out of scope (see Section 10).

---

## 2. Goals & Success Criteria

### 2.1 Primary goal (hackathon)
Demonstrate, end-to-end, that given (a) a new policy document and (b) a structured dataset of individuals, Ripple can:
1. Extract the rule change as a structured, machine-evaluable predicate.
2. Identify exactly which individuals are affected, using deterministic evaluation (not LLM judgment) against real records.
3. Explain *why* each individual is affected, with a citation back to the source policy text and the specific data field(s) that triggered it.
4. Generate a concrete, individualized next action for each affected person.

### 2.2 Success metrics for the demo
| Metric | Target |
|---|---|
| End-to-end pipeline runs on a real policy doc + real (or realistic synthetic) student dataset | Yes, live |
| Precision of "affected student" list vs. ground truth | 100% on the demo dataset (deterministic validation should guarantee this) |
| Time from policy upload to affected-list output | < 30 seconds for a dataset of ~500 students |
| Evidence trail present for every flagged student | 100% — every result cites the source clause and the data field |
| Judge can ask "why is student X flagged?" and get a defensible answer live | Yes |

### 2.3 Longer-term success criteria (post-hackathon, directional only)
- A pilot institution (one department or one college) uses Ripple on a real policy change with real data and confirms the affected list matches what an administrator would have found manually, in a fraction of the time.
- The rule-extraction layer generalizes beyond simple numeric thresholds to at least one conditional/exception case (e.g., "unless the student has an approved accommodation").

---

## 3. Users & Personas

### 3.1 Primary persona: Institutional administrator ("Compliance Officer / Registrar")
- Responsible for implementing policy changes operationally.
- Currently does this via manual spreadsheet review or blanket announcements ("please check if this applies to you").
- Wants: a defensible, auditable list of affected individuals, with evidence, that they can act on or forward.
- Pain today: manual cross-referencing is slow, error-prone, and doesn't scale past a few hundred records; blanket announcements create anxiety and miss people who don't read them.

### 3.2 Secondary persona: Affected individual ("Student")
- Receives a personalized notification: *this policy change affects you, here is why, here is what you need to do.*
- Wants: clarity, not a 10-page policy PDF to interpret themselves.
- Pain today: policy announcements are broadcast, generic, and easy to miss or misjudge personal relevance.

### 3.3 Tertiary persona (future): Institution IT/Compliance leadership
- Cares about auditability — every automated determination must be traceable and defensible (e.g., for FERPA-adjacent contexts).
- This persona is why the "deterministic validation" architectural principle exists — an LLM's unverified judgment is not acceptable as the basis for an action affecting a student's academic standing.

---

## 4. Product Principles

1. **LLM reasons; deterministic code validates.** The LLM is used to extract structured meaning from unstructured text (rule extraction) and to generate natural-language explanations. It is never used as the final arbiter of *whether* a specific person is affected — that determination is made by deterministic code evaluating a structured predicate against structured records.
2. **Every output is evidence-backed.** No result is presented without a citation to (a) the specific clause in the source policy document and (b) the specific data field(s)/value(s) that triggered the determination.
3. **Narrow and correct beats broad and approximate.** The MVP handles one class of policy change (single numeric threshold rules) extremely well, rather than attempting to handle all policy language types shallowly.
4. **Auditability is a feature, not an afterthought.** Every pipeline run, extracted rule, and determination is logged and retrievable.

---

## 5. Scope

### 5.1 In scope (hackathon MVP)
- Single-document upload workflow (one policy document at a time).
- Rule extraction limited to **single numeric threshold changes** (e.g., "attendance requirement increases from 75% to 80%") and **simple categorical/deadline changes** (e.g., "scholarship X application deadline moves from March 1 to Feb 15").
- One structured dataset: a synthetic or lightly anonymized student roster with fields relevant to the demo (attendance %, enrollment status, course ID, etc.).
- Deterministic evaluation engine that evaluates the extracted rule against every record in the dataset.
- Evidence generation: for each affected student, a human-readable explanation citing the policy clause and the triggering data value.
- Action generation: a templated, LLM-personalized next-step message per affected student (e.g., "You are currently at 78% attendance. You need to attend all remaining sessions in [course] to meet the new 80% requirement by [date].").
- A simple web UI: upload policy → see processing pipeline stages → see affected-student table with evidence and action per row → drill into one student's detail view.
- Basic audit log of each pipeline run (what was uploaded, when, what rule was extracted, what output was produced).

### 5.2 Explicitly out of scope for the hackathon
- Multi-document diffing (comparing two full policy versions to auto-detect *what* changed). MVP assumes the uploaded document either *is* the change or contains a clearly statable change, and a human confirms/edits the extracted rule before evaluation.
- Conditional/exception logic beyond a single threshold (e.g., accommodations, grandfather clauses).
- Real integration with a live Student Information System (SIS). MVP uses a static or lightly synthetic dataset loaded into DynamoDB.
- Multi-tenancy / multiple institutions.
- Notification delivery via real email/SMS (MVP can simulate this in the UI; wiring to SES/SNS is a stretch goal, not a requirement).
- Authentication/authorization beyond a basic demo login, if any.
- Any true graph database or graph-traversal impact propagation (e.g., "this policy change to Course A affects Course B's prerequisite chain"). This is explicitly named as a **future direction**, not a hackathon deliverable, and the demo will not claim graph-based reasoning it does not implement.

---

## 6. User Flows

### 6.1 Primary flow: Administrator uploads a policy change
1. Administrator logs into Ripple (or opens the demo instance).
2. Administrator uploads a policy document (PDF/text) describing a change, e.g., a memo raising the attendance requirement.
3. Ripple's pipeline runs (see Section 7) and surfaces:
   - The extracted rule, shown to the administrator in structured form for confirmation ("We read this as: attendance_pct >= 80, effective [date], applies to: all undergraduate courses. Confirm?").
   - Administrator can edit the extracted predicate if it's wrong (this is a critical trust-building step — the human stays in the loop before any determination is finalized).
4. Administrator confirms. Ripple evaluates the rule deterministically against the student dataset.
5. Ripple displays a results table: affected students, their relevant data value, the evidence citation, and a generated action message.
6. Administrator can drill into any student row to see the full evidence trail and edit/approve the generated action message.
7. (Stretch) Administrator clicks "notify all" to simulate/send the action messages.

### 6.2 Secondary flow: Student views their personalized impact (stretch goal, time-permitting)
1. Student receives (or, in the demo, views) a personalized notice.
2. Notice states: what changed, why it affects them specifically (citing their own data value), and what action is required, by when.

---

## 7. Core Pipeline (Functional Requirements)

```
Upload policy
     ↓
Detect / state change
     ↓
Understand rule → extract structured predicate
     ↓
Find affected entities → deterministic query
     ↓
Validate impact → deterministic evaluation (per-record)
     ↓
Explain evidence → cite clause + data field
     ↓
Generate action → LLM-personalized next step
```

### 7.1 Upload policy
- **Input:** PDF or plain text document.
- **Requirement:** Extract raw text (OCR fallback not required for MVP; assume text-extractable PDFs).
- **Output:** Raw policy text stored in S3, referenced by a document ID.

### 7.2 Detect / state change
- **MVP behavior:** The uploaded document is treated as *containing* the change; Ripple does not diff two versions. The pipeline prompts the LLM to identify the single most salient rule change in the document.
- **Output:** A natural-language statement of the detected change, shown to the administrator for confirmation before proceeding.

### 7.3 Understand rule → extract structured predicate
- **Requirement:** The LLM (via Bedrock) extracts the change into a structured, machine-evaluable schema. Example:

```json
{
  "rule_id": "attendance_threshold_2026_v1",
  "predicate": {
    "field": "attendance_pct",
    "operator": ">=",
    "value": 80
  },
  "previous_value": 75,
  "scope": {
    "applies_to": "all_undergraduate_courses",
    "effective_date": "2026-01-15"
  },
  "source_citation": {
    "document_id": "policy-2026-001",
    "clause_text": "...students must maintain a minimum attendance of 80%...",
    "page_or_section": "Section 3.2"
  },
  "confidence": 0.94
}
```
- **Requirement:** This structured object is surfaced to the administrator for confirmation/edit before it is used in evaluation. This is the human-in-the-loop checkpoint that makes the "LLM reasons, code validates" principle credible.
- **Non-requirement (MVP):** General-purpose rule language support (nested boolean logic, exceptions). MVP supports a single comparison predicate per rule.

### 7.4 Find affected entities → deterministic query
- **Requirement:** Given the confirmed predicate and scope, deterministically query the structured dataset (DynamoDB) for all records matching the scope (e.g., all students in undergraduate courses).
- **No LLM involvement in this step.**

### 7.5 Validate impact → deterministic evaluation
- **Requirement:** For each candidate record, evaluate the predicate against the record's actual field value using plain code (no LLM):

```python
def evaluate(record, predicate):
    field_value = record[predicate["field"]]
    if predicate["operator"] == ">=":
        return field_value < predicate["value"]  # now fails the new threshold
    # ... other operators
```
- **Output:** A boolean "affected" flag per record, plus the actual field value used in the determination.
- **This is the core trust mechanism of the product** and must be implemented as literal, inspectable, deterministic code — not a second LLM call. This should be the first thing built and the most heavily tested part of the MVP.

### 7.6 Explain evidence
- **Requirement:** For each affected record, generate a citation object combining:
  - The source clause text (from 7.3).
  - The specific field and value from the record that triggered the determination (from 7.5).
- **Output example:** *"Flagged because: policy Section 3.2 now requires attendance_pct >= 80. This student's current attendance_pct is 78, which is below the new threshold (previously compliant at the old 75% threshold)."*
- **No LLM required for correctness here** — the citation is assembled from structured data. An LLM may be used only to phrase it naturally, with the underlying facts pre-computed.

### 7.7 Generate action
- **Requirement:** For each affected record, generate a personalized, actionable next step using an LLM, grounded in the record's actual values (not hallucinated).
- **Example output:** *"You need to raise your attendance from 78% to at least 80% before [effective date]. You have [N] sessions remaining in [course]; missing 0 of them would bring you to [projected %]."*
- **Requirement:** Any numeric claim in the generated action (like "projected %") must be computed deterministically and passed to the LLM as a fact to phrase, not computed by the LLM itself.

---

## 8. Data Model

### 8.1 Policy document
| Field | Type | Notes |
|---|---|---|
| document_id | string (PK) | |
| raw_text | string | stored in S3, referenced here |
| upload_timestamp | ISO datetime | |
| uploaded_by | string | |
| status | enum | uploaded / rule_extracted / confirmed / evaluated |

### 8.2 Extracted rule
| Field | Type | Notes |
|---|---|---|
| rule_id | string (PK) | |
| document_id | string (FK) | |
| predicate | JSON | field, operator, value |
| previous_value | number/string | nullable |
| scope | JSON | applies_to, effective_date |
| source_citation | JSON | clause text + location |
| confidence | float | LLM extraction confidence |
| human_confirmed | boolean | must be true before evaluation |
| human_edits | JSON | nullable, tracks admin corrections |

### 8.3 Student record (structured dataset — synthetic/demo)
| Field | Type | Notes |
|---|---|---|
| student_id | string (PK) | |
| name | string | |
| course_id | string | |
| enrollment_status | enum | |
| attendance_pct | number | |
| [other fields as needed per demo scenario] | | |

### 8.4 Evaluation result
| Field | Type | Notes |
|---|---|---|
| result_id | string (PK) | |
| rule_id | string (FK) | |
| student_id | string (FK) | |
| affected | boolean | |
| triggering_field | string | |
| triggering_value | any | |
| evidence_text | string | |
| generated_action | string | |
| created_at | ISO datetime | |

### 8.5 Audit log
| Field | Type | Notes |
|---|---|---|
| log_id | string (PK) | |
| document_id | string | |
| rule_id | string | |
| event | enum | uploaded / rule_extracted / rule_confirmed / rule_edited / evaluation_run / notification_sent |
| actor | string | |
| timestamp | ISO datetime | |
| details | JSON | |

---

## 9. Technical Architecture

### 9.1 AWS (deployed / "Ship It" track)
| Component | Service | Role |
|---|---|---|
| Frontend hosting | Amplify Hosting | Serves the admin UI |
| API layer | API Gateway | Routes requests to Lambda functions |
| Pipeline orchestration | Step Functions (stretch) / direct Lambda chaining (MVP-safe fallback) | Coordinates the 7-stage pipeline |
| Compute | Lambda | Each pipeline stage as a function, or a single orchestrating function for MVP speed |
| Document storage | S3 | Raw policy text and uploaded files |
| Structured data | DynamoDB | Student records, rules, evaluation results, audit log |
| Async triggers | EventBridge (stretch) | Optional — e.g., triggering evaluation once a rule is confirmed |
| AI reasoning | Amazon Bedrock | Rule extraction (7.3) and action-message generation (7.7) |
| Agent orchestration | Strands Agents SDK | Wraps the LLM reasoning steps as tool-using agent logic (rule extraction, evidence phrasing, action generation) |

**MVP build-order recommendation:** Get Lambda + DynamoDB + Bedrock working end-to-end first with direct function chaining. Add Step Functions/EventBridge only if time remains — they improve the architecture score but are not required for the demo to work, and are the most likely thing to eat debugging time under deadline pressure.

### 9.2 Local / open-source track (fallback or parallel build)
| Component | Tool | Role |
|---|---|---|
| Agent logic | Strands Agents SDK + local model | Same reasoning logic, runnable without an AWS account |
| Serverless simulation | SAM CLI + LocalStack | Local Lambda/DynamoDB/S3 emulation for development before deploying |

This allows development to proceed without waiting on AWS credit provisioning or account setup, and gives a safety net if live AWS deployment breaks during the demo.

### 9.3 Why deterministic validation is architecturally separate
The evaluation step (7.5) is implemented as a plain function with no model call in its critical path. This is a deliberate architectural boundary: even if the LLM extraction step degrades in quality on a given input, the evaluation step's correctness is independently verifiable and testable. This is the answer to the anticipated judge question *"how is this different from an LLM just reading the policy and guessing who's affected?"*

---

## 10. Out of Scope / Future Directions
Explicitly **not** part of this PRD's committed scope, listed to set correct expectations with judges and stakeholders:
- **Graph-based impact propagation** (e.g., a change to Course A's prerequisites rippling to Course B, Course C). This is a natural extension aligned with current research combining semantic and graph signals for impact analysis, but it is not implemented in this MVP and should not be claimed as implemented.
- **Multi-version document diffing** to auto-detect changes without a human stating them.
- **Conditional/exception rule logic** (accommodations, grandfather clauses, multi-condition rules).
- **Multi-tenant SaaS platform** supporting many institutions simultaneously.
- **Live SIS/HRIS integration.**
- **Domains beyond education** (HR compliance, government benefits, insurance) — architecturally plausible given the domain-agnostic core engine, but not built or demonstrated.

---

## 11. Risks & Mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| LLM extracts an incorrect predicate from ambiguous policy text | High — undermines the whole demo | Human-confirmation step (7.3) before evaluation; MVP scope limited to clearly-stated single-threshold rules |
| No real structured dataset available | High — validation step has nothing real to check against | Build a realistic synthetic dataset early (Day 1), don't wait for real data access |
| Over-scoped AWS architecture eats build time | Medium | Build with direct Lambda chaining first; add Step Functions/EventBridge only if time allows |
| Judges challenge "what's actually novel here" | Medium | Lead with the predicate-extraction + deterministic-validation sentence (Section 7.3–7.5) as the defensible answer; do not claim graph-based methods that aren't implemented |
| Demo-day live AWS failure | Medium | Maintain the local/LocalStack version as a fallback demo path |

---

## 12. 3-Day Build Plan (suggested)

**Day 1 — Core data + deterministic core**
- Build synthetic student dataset, load into DynamoDB (or local equivalent).
- Build the deterministic evaluation function (7.5) and test it against hand-written predicates, independent of any LLM.
- Stand up basic Lambda + API Gateway skeleton.

**Day 2 — AI reasoning layer**
- Integrate Bedrock/Strands for rule extraction (7.3) on a real sample policy document (write 2-3 realistic sample policies).
- Wire extraction output into the evaluation engine from Day 1.
- Build evidence generation (7.6) and action generation (7.7).
- Basic frontend: upload → confirm rule → see results table.

**Day 3 — Polish, edge cases, demo prep**
- Add the human-confirmation/edit step in the UI (7.3).
- Add student drill-down detail view.
- Add audit log.
- Test with 2-3 different sample policies to confirm the pipeline isn't overfit to one example.
- Prepare the live demo script and a recorded backup video in case of live failure.
- Prepare the "what's novel here" answer for Q&A (Section 1.2 / 9.3).

---

## 13. Open Questions
- What is the actual source of the demo dataset — fully synthetic, or a real (anonymized) dataset from a cooperating department? This should be resolved on Day 1, as it materially affects how convincing the demo is.
- Should the MVP support more than one rule type (e.g., both a numeric threshold and a deadline change) to show the extraction schema generalizes, or is one rule type sufficient for the weekend? (Recommendation: build the pipeline generically enough to support both, but only fully test and demo one to keep the demo script tight.)
- How much of the AWS "Ship It" stack should be visibly wired up for scoring vs. simplified for reliability? (Recommendation: prioritize a working narrow pipeline over full service coverage; mention the fuller intended architecture in the writeup even where it's simplified for the demo.)
