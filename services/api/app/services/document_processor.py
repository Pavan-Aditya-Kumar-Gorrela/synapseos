# app/services/document_processor.py

"""
Text extraction layer.
Each extractor returns plain UTF-8 text or raises RuntimeError on failure.
"""

import io
from pathlib import Path


class DocumentProcessor:

    @staticmethod
    def extract_text(storage_path: str, file_type: str) -> str:
        """
        Dispatch to the right extractor by MIME type.
        Raises RuntimeError if extraction fails so the caller can set FAILED status.
        """
        path = Path(storage_path)
        if not path.exists():
            raise RuntimeError(f"File not found: {storage_path}")

        mime = file_type.lower()

        if mime == "application/pdf":
            return DocumentProcessor._extract_pdf(path)
        elif mime in (
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
        ):
            return DocumentProcessor._extract_docx(path)
        elif mime in ("text/plain", "text/csv", "application/csv"):
            return DocumentProcessor._extract_text_or_csv(path, mime)
        else:
            raise RuntimeError(f"Unsupported file type: {file_type}")

    # ── Extractors ────────────────────────────────────────────────

    @staticmethod
    def _extract_pdf(path: Path) -> str:
        try:
            import fitz  # PyMuPDF
        except ImportError:
            raise RuntimeError("PyMuPDF not installed. Run: pip install pymupdf")
        doc = fitz.open(str(path))
        return "\n".join(page.get_text() for page in doc).strip()

    @staticmethod
    def _extract_docx(path: Path) -> str:
        try:
            from docx import Document as DocxDocument
        except ImportError:
            raise RuntimeError("python-docx not installed. Run: pip install python-docx")
        doc = DocxDocument(str(path))
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip()).strip()

    @staticmethod
    def _extract_text_or_csv(path: Path, mime: str) -> str:
        if "csv" in mime:
            try:
                import pandas as pd
            except ImportError:
                raise RuntimeError("pandas not installed. Run: pip install pandas")
            df = pd.read_csv(str(path))
            return df.to_string(index=False)
        else:
            return path.read_text(encoding="utf-8", errors="replace").strip()