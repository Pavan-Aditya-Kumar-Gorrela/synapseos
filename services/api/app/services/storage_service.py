# app/services/storage_service.py

"""
Filesystem-based storage service.
Folder layout:   uploads/<org_id>/<uuid>_<filename>
Swap save_file() internals for S3 when ready — interface stays identical.
"""

import uuid
import shutil
from pathlib import Path

from fastapi import UploadFile

UPLOAD_ROOT = Path("uploads")


class StorageService:

    @staticmethod
    def _org_dir(org_id: str) -> Path:
        directory = UPLOAD_ROOT / org_id
        directory.mkdir(parents=True, exist_ok=True)
        return directory

    @staticmethod
    def save_file(file: UploadFile, org_id: str) -> tuple[str, str, int]:
        """
        Persist an uploaded file to disk.

        Returns:
            unique_filename  — stored name  (uuid prefix keeps collisions impossible)
            storage_path     — relative path string persisted in DB
            file_size        — bytes written
        """
        ext              = Path(file.filename or "file").suffix.lower()
        unique_filename  = f"{uuid.uuid4().hex}{ext}"
        org_dir          = StorageService._org_dir(org_id)
        dest             = org_dir / unique_filename

        file.file.seek(0)
        with dest.open("wb") as out:
            shutil.copyfileobj(file.file, out)

        file_size = dest.stat().st_size
        storage_path = str(dest)          # e.g. "uploads/org_abc/deadbeef.pdf"
        return unique_filename, storage_path, file_size

    @staticmethod
    def delete_file(storage_path: str) -> None:
        path = Path(storage_path)
        if path.exists():
            path.unlink()

    @staticmethod
    def get_file_path(storage_path: str) -> Path:
        return Path(storage_path)