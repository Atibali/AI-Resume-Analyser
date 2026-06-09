def validate_pdf_file(filename: str) -> bool:
    """Check if file is a PDF"""
    return filename.endswith('.pdf')


def validate_job_description(description: str) -> bool:
    """Validate job description is not empty and reasonably long"""
    return bool(description and len(description.strip()) > 20)


def validate_company_name(name: str) -> bool:
    """Validate company name"""
    return bool(name and len(name.strip()) > 0)


def validate_job_title(title: str) -> bool:
    """Validate job title"""
    return bool(title and len(title.strip()) > 0)
