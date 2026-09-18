import os
import uuid
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel

from backend.models.policy import PolicyMetadata, ParsedDocument
from backend.services.document_parser import parse_document
from backend.repositories.policy_repository import policy_repository
from backend.repositories.audit_repository import audit_repository

router = APIRouter(prefix="/api/policies", tags=["Policies"])

SAMPLE_DIR = "backend/data/sample_policies"


@router.post("/upload")
async def upload_policy(
    file: Optional[UploadFile] = File(None),
    sample_key: Optional[str] = Form(None)
):
    """
    Stage 1: UPLOAD
    Uploads a PDF/TXT policy document or loads a pre-configured sample document.
    Parses document text reliably using pdfplumber.
    """
    if sample_key:
        sample_path = os.path.join(SAMPLE_DIR, sample_key)
        if not os.path.exists(sample_path):
            raise HTTPException(status_code=404, detail=f"Sample policy '{sample_key}' not found.")
        with open(sample_path, "rb") as f:
            content_bytes = f.read()
        filename = sample_key
    elif file:
        content_bytes = await file.read()
        filename = file.filename
    else:
        raise HTTPException(status_code=400, detail="Either file or sample_key must be provided.")

    try:
        parsed = parse_document(content_bytes, filename)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    policy_id = f"pol_{uuid.uuid4().hex[:8]}"
    metadata = PolicyMetadata(
        policy_id=policy_id,
        name=filename.replace("_", " ").replace(".pdf", "").replace(".txt", "").title(),
        version="2026.1",
        document_key=filename
    )

    policy_repository.save_policy(metadata, parsed)
    audit_repository.record_event(
        event_type="uploaded",
        entity_id=policy_id,
        details={
            "filename": filename,
            "page_count": parsed.page_count,
            "char_count": len(parsed.content)
        }
    )

    return {
        "policy_id": policy_id,
        "name": metadata.name,
        "filename": filename,
        "page_count": parsed.page_count,
        "content_snippet": parsed.content[:400],
        "full_content": parsed.content
    }


@router.get("/samples")
async def list_sample_policies():
    """
    Returns available pre-packaged sample policies for 1-click demo runs.
    """
    samples = []
    if os.path.exists(SAMPLE_DIR):
        for f in os.listdir(SAMPLE_DIR):
            if f.endswith((".pdf", ".txt")):
                samples.append({
                    "sample_key": f,
                    "title": f.replace("_", " ").replace(".pdf", "").replace(".txt", "").title(),
                    "format": "PDF" if f.endswith(".pdf") else "TXT"
                })
    return samples
