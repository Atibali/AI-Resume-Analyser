import os

import pdfplumber
from pdf2image import convert_from_path


class PDFService:
    @staticmethod
    def extract_text(pdf_path: str) -> str:
        """Extract text from a PDF file."""
        text = []
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text.append(page_text)
            return "\n".join(text)
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")

    @staticmethod
    def convert_to_image(pdf_path: str, output_dir: str, resume_id: str) -> str:
        """Convert the first page of a PDF to a preview image."""
        try:
            images = convert_from_path(pdf_path, first_page=1, last_page=1)
            if not images:
                raise Exception("No images generated from PDF")

            image_path = os.path.join(output_dir, f"{resume_id}_preview.png")
            images[0].save(image_path, "PNG")
            return image_path
        except Exception as e:
            raise Exception(f"Error converting PDF to image: {str(e)}")
