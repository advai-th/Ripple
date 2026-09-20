import os
import uuid
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel

from backend.models.policy import PolicyMetadata, ParsedDocument
from backend.services.document_parser import parse_document
from backend.services.s3_service import s3_service
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
    Uploads a PDF/TXT policy document to Amazon S3 (or local storage fallback)
    or loads a pre-configured sample document.
    Parses document text reliably using pdfplumber/PyMuPDF.
    """
    content_type = "application/pdf"
    if sample_key:
        sample_path = os.path.join(SAMPLE_DIR, sample_key)
        if not os.path.exists(sample_path):
            raise HTTPException(status_code=404, detail=f"Sample policy '{sample_key}' not found.")
        with open(sample_path, "rb") as f:
            content_bytes = f.read()
        filename = sample_key
        content_type = "application/pdf" if filename.endswith(".pdf") else "text/plain"
    elif file:
        content_bytes = await file.read()
        filename = file.filename
        content_type = file.content_type or ("application/pdf" if filename.endswith(".pdf") else "text/plain")
    else:
        raise HTTPException(status_code=400, detail="Either file or sample_key must be provided.")

    try:
        parsed = parse_document(content_bytes, filename)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Store in Amazon S3 (with local disk fallback)
    storage_info = s3_service.upload_file(
        content=content_bytes,
        filename=filename,
        content_type=content_type,
        metadata={"filename": filename, "page_count": str(parsed.page_count)}
    )

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
            "char_count": len(parsed.content),
            "storage_mode": storage_info["storage_mode"],
            "s3_key": storage_info.get("s3_key")
        }
    )

    return {
        "policy_id": policy_id,
        "name": metadata.name,
        "filename": filename,
        "page_count": parsed.page_count,
        "content_snippet": parsed.content[:400],
        "full_content": parsed.content,
        "storage": storage_info
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


@router.get("/samples/{sample_key}")
async def get_sample_policy(sample_key: str):
    """
    Returns content and metadata for a specific sample policy.
    """
    sample_path = os.path.join(SAMPLE_DIR, sample_key)
    if not os.path.exists(sample_path):
        raise HTTPException(status_code=404, detail=f"Sample policy '{sample_key}' not found.")
    with open(sample_path, "rb") as f:
        content_bytes = f.read()
    parsed = parse_document(content_bytes, sample_key)
    return {
        "filename": sample_key,
        "title": sample_key.replace("_", " ").replace(".pdf", "").replace(".txt", "").title(),
        "content": parsed.content
    }
