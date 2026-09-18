import pytest
from backend.services.document_parser import parse_document


def test_parse_text_document():
    raw_text = "Sample policy text: Students must maintain 80% attendance."
    parsed = parse_document(raw_text, "policy.txt")
    assert parsed.filename == "policy.txt"
    assert parsed.content == raw_text
    assert parsed.page_count == 1


def test_parse_markdown_document():
    raw_md = "# Academic Policy\n\nSection 3.2: Attendance requirement is 80%."
    parsed = parse_document(raw_md.encode("utf-8"), "policy.md")
    assert parsed.filename == "policy.md"
    assert "Section 3.2" in parsed.content


def test_unsupported_format_raises_error():
    with pytest.raises(ValueError, match="Unsupported file format"):
        parse_document(b"fake data", "policy.docx")
