import os
import shutil

from fastapi import UploadFile

from app.config import get_settings


class StorageService:
    @staticmethod
    def save_upload_file(file: UploadFile, resume_id: str) -> str:
        """Save an uploaded file and return its path."""
        settings = get_settings()
        upload_dir = settings.upload_dir
        os.makedirs(upload_dir, exist_ok=True)

        file_path = os.path.join(upload_dir, f"{resume_id}.pdf")

        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            return file_path
        except Exception as e:
            raise Exception(f"Error saving file: {str(e)}")
        finally:
            file.file.close()

    @staticmethod
    def delete_file(file_path: str) -> bool:
        """Delete a file from disk."""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception as e:
            raise Exception(f"Error deleting file: {str(e)}")
