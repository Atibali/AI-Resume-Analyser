"""Deterministic resume scoring helpers used to normalize and combine AI scores."""

from __future__ import annotations

import re
from collections import Counter

STOP_WORDS = frozenset(
    {
        "about", "above", "across", "after", "again", "against", "also", "and",
        "any", "are", "been", "before", "being", "below", "between", "both",
        "but", "can", "could", "did", "does", "doing", "each", "for", "from",
        "had", "has", "have", "having", "here", "how", "into", "its", "just",
        "like", "make", "many", "more", "most", "must", "need", "not", "now",
        "off", "once", "only", "other", "our", "out", "over", "own", "same",
        "should", "some", "such", "than", "that", "the", "their", "them",
        "then", "there", "these", "they", "this", "those", "through", "too",
        "under", "until", "very", "was", "were", "what", "when", "where",
        "which", "while", "who", "will", "with", "would", "you", "your",
        "role", "work", "team", "using", "used", "ability", "experience",
        "required", "preferred", "responsible", "including", "within",
    }
)

SCORE_WEIGHTS = {
    "skills_score": 0.30,
    "content_score": 0.25,
    "ats_score": 0.20,
    "structure_score": 0.15,
    "tone_style_score": 0.10,
}


def clamp_score(value: object, default: int = 0) -> int:
    """Clamp a score to the 0-100 range."""
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return default
    return max(0, min(100, round(numeric)))


def extract_keywords(text: str, limit: int = 35) -> list[str]:
    """Extract likely job-related keywords from text."""
    tokens = re.findall(r"\b[a-zA-Z][a-zA-Z0-9+#./-]{2,}\b", text.lower())
    filtered = [
        token.strip("./")
        for token in tokens
        if token not in STOP_WORDS and len(token) >= 3 and not token.isdigit()
    ]
    counts = Counter(filtered)
    return [word for word, _ in counts.most_common(limit)]


def keyword_match_score(resume_text: str, job_description: str) -> int:
    """Score how many job-description keywords appear in the resume."""
    keywords = extract_keywords(job_description)
    if not keywords:
        return 50

    resume_lower = resume_text.lower()
    matches = sum(1 for keyword in keywords if keyword in resume_lower)
    ratio = matches / len(keywords)
    return clamp_score(ratio * 100)


def structure_heuristic_score(resume_text: str) -> int:
    """Lightweight structure check for common resume sections."""
    resume_lower = resume_text.lower()
    sections = (
        "experience",
        "education",
        "skills",
        "summary",
        "projects",
        "certification",
    )
    found = sum(1 for section in sections if section in resume_lower)
    bullet_points = len(re.findall(r"(?m)^\s*[-•*]\s+", resume_text))
    section_score = (found / len(sections)) * 70
    bullet_score = min(30, bullet_points * 3)
    return clamp_score(section_score + bullet_score)


def blend_scores(llm_score: int, heuristic_score: int, llm_weight: float = 0.75) -> int:
    """Blend model judgment with deterministic heuristics."""
    return clamp_score(round(llm_score * llm_weight + heuristic_score * (1 - llm_weight)))


def normalize_category_scores(raw_scores: dict[str, object]) -> dict[str, int]:
    """Normalize all category scores to integers in the 0-100 range."""
    return {
        "ats_score": clamp_score(raw_scores.get("ats_score")),
        "tone_style_score": clamp_score(raw_scores.get("tone_style_score")),
        "content_score": clamp_score(raw_scores.get("content_score")),
        "structure_score": clamp_score(raw_scores.get("structure_score")),
        "skills_score": clamp_score(raw_scores.get("skills_score")),
    }


def apply_heuristic_adjustments(
    scores: dict[str, int],
    resume_text: str,
    job_description: str,
) -> dict[str, int]:
    """Adjust AI scores using keyword and structure heuristics."""
    keyword_score = keyword_match_score(resume_text, job_description)
    structure_score = structure_heuristic_score(resume_text)

    return {
        **scores,
        "skills_score": blend_scores(scores["skills_score"], keyword_score, llm_weight=0.70),
        "ats_score": blend_scores(scores["ats_score"], keyword_score, llm_weight=0.80),
        "structure_score": blend_scores(scores["structure_score"], structure_score, llm_weight=0.75),
    }


def calculate_overall_score(scores: dict[str, int]) -> int:
    """Compute a weighted overall score from category scores."""
    total = sum(scores[key] * weight for key, weight in SCORE_WEIGHTS.items())
    return clamp_score(total)


def finalize_analysis_scores(
    raw_scores: dict[str, object],
    resume_text: str,
    job_description: str,
) -> dict[str, int]:
    """Normalize, adjust, and compute the final weighted overall score."""
    normalized = normalize_category_scores(raw_scores)
    adjusted = apply_heuristic_adjustments(normalized, resume_text, job_description)
    adjusted["overall_score"] = calculate_overall_score(adjusted)
    return adjusted
