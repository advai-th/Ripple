import io
import uuid
from typing import Union
import pdfplumber

from backend.models.policy import ParsedDocument


def parse_document(file_content: Union[bytes, str], filename: str) -> ParsedDocument:
    """
    Extracts text from a document (PDF, TXT, or MD).
    Exposes a clean interface: parse_document(file_content, filename) -> ParsedDocument.
    The rest of Ripple does not depend directly on pdfplumber.
    """
    doc_id = f"doc_{uuid.uuid4().hex[:8]}"
    filename_lower = filename.lower()

    if filename_lower.endswith(".pdf"):
        if isinstance(file_content, str):
            raise ValueError("PDF content must be provided as bytes.")
        
        extracted_pages = []
        try:
            with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                page_count = len(pdf.pages)
                for idx, page in enumerate(pdf.pages):
                    text = page.extract_text() or ""
                    extracted_pages.append(f"--- Page {idx + 1} ---\n{text.strip()}")
            full_text = "\n\n".join(extracted_pages)
        except Exception as e:
            raise ValueError(f"Failed to extract text from PDF '{filename}': {str(e)}")

        return ParsedDocument(
            document_id=doc_id,
            filename=filename,
            content=full_text,
            page_count=page_count
        )

    elif filename_lower.endswith((".txt", ".md")):
        if isinstance(file_content, bytes):
            try:
                full_text = file_content.decode("utf-8")
            except UnicodeDecodeError:
                full_text = file_content.decode("latin-1")
        else:
            full_text = file_content

        return ParsedDocument(
            document_id=doc_id,
            filename=filename,
            content=full_text.strip(),
            page_count=1
        )
    else:
        raise ValueError(f"Unsupported file format '{filename}'. Ripple MVP supports PDF, TXT, and Markdown.")
