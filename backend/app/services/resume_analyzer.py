import json
import logging
import re
import time

from app.config import get_settings
from app.services.scoring import finalize_analysis_scores

logger = logging.getLogger(__name__)


class ResumeAnalyzer:
    """Multi-provider resume analyzer with Groq as primary and Gemini as fallback."""

    def __init__(self):
        settings = get_settings()
        self.providers = []

        # Primary: Groq (free tier - 30 req/min, 14400 req/day)
        if settings.groq_api_key:
            self.providers.append(("groq", settings.groq_api_key))
            logger.info("Groq API key configured")

        if settings.google_api_key:
            self.providers.append(("gemini", settings.google_api_key))
            logger.info("Gemini API key configured as fallback")

        if not self.providers:
            raise ValueError(
                "No API keys configured! Set GROQ_API_KEY in your .env file. "
                "Get a free key at https://console.groq.com"
            )

    def _get_analysis_prompt(self, resume_text: str, job_title: str, job_description: str) -> str:
        """Generate the analysis prompt."""
        return f"""### SYSTEM PROMPT: AI Resume Analyzer Agent
You are an intelligent AI Resume Analyzer designed to evaluate resumes against a given Job Description (JD).

---

### 🎯 Objective
Analyze the provided resume text and job description to:
- Score the resume accurately
- Identify strengths and weaknesses
- Provide actionable improvement suggestions

---

### 📥 Inputs Provided
Resume Text: {resume_text}

Job Title: {job_title}

Job Description: {job_description}

---

### ⚙️ Processing Instructions
1. Carefully read and understand the resume
2. Compare it with the job description
3. Evaluate based on:
   - ATS compatibility
   - Content relevance
   - Skills match
   - Structure & formatting
   - Tone & clarity
4. Think step-by-step before generating output

---

### 📊 Scoring Criteria (0–100)
Score each category independently using the full range. Be fair but critical — avoid giving every category 80+ unless the resume truly earns it.

**skills_score (30% of overall weight)**
- 90-100: Required and preferred skills from the JD are clearly demonstrated with evidence
- 75-89: Most required skills present; minor gaps in preferred skills
- 55-74: Some required skills missing or only listed without context
- 0-54: Major skill gaps for this role

**content_score (25% of overall weight)**
- 90-100: Strong, role-relevant achievements with metrics and impact
- 75-89: Good relevance with some quantified results
- 55-74: Generic bullets or weak alignment to the JD
- 0-54: Mostly irrelevant or empty content

**ats_score (20% of overall weight)**
- 90-100: Standard headings, strong JD keyword coverage, ATS-friendly formatting
- 75-89: Good keyword alignment with minor ATS risks
- 55-74: Missing important JD keywords or formatting issues
- 0-54: Poor parseability, heavy graphics/tables, or very weak keyword match

**structure_score (15% of overall weight)**
- 90-100: Clear sections, consistent formatting, scannable layout
- 75-89: Mostly well organized with small inconsistencies
- 55-74: Hard to scan or missing key sections
- 0-54: Disorganized or confusing structure

**tone_style_score (10% of overall weight)**
- 90-100: Professional, concise, confident, and easy to read
- 75-89: Generally professional with minor wording issues
- 55-74: Wordy, vague, or inconsistent tone
- 0-54: Unprofessional or unclear writing

Set `overallScore` to the rounded average of the five category scores above.

---

### 🧠 Analysis Requirements
- Identify missing keywords from JD
- Highlight irrelevant or weak sections
- Detect formatting issues
- Suggest improvements for each section
- Be precise and professional
- Provide 2-3 tips per category (mix of "good" and "improve")

---

### 📤 Output Format (STRICT JSON)
Return ONLY valid JSON (no markdown, no explanations):
{{
  "overallScore": <number>,
  "ats": {{
    "score": <number>,
    "tips": [
      {{"type": "good", "tip": "..."}},
      {{"type": "improve", "tip": "..."}}
    ],
    "explanation": "brief explanation"
  }},
  "toneAndStyle": {{
    "score": <number>,
    "tips": [
      {{"type": "good", "tip": "..."}},
      {{"type": "improve", "tip": "..."}}
    ],
    "explanation": "brief explanation"
  }},
  "content": {{
    "score": <number>,
    "tips": [
      {{"type": "good", "tip": "..."}},
      {{"type": "improve", "tip": "..."}}
    ],
    "explanation": "brief explanation"
  }},
  "structure": {{
    "score": <number>,
    "tips": [
      {{"type": "good", "tip": "..."}},
      {{"type": "improve", "tip": "..."}}
    ],
    "explanation": "brief explanation"
  }},
  "skills": {{
    "score": <number>,
    "tips": [
      {{"type": "good", "tip": "..."}},
      {{"type": "improve", "tip": "..."}}
    ],
    "explanation": "brief explanation"
  }}
}}

---

### 🚫 Rules
- Do NOT return explanations outside JSON
- Do NOT include markdown backticks
- Do NOT hallucinate information
- Keep tips concise and actionable
- Tips should be specific to this resume and JD

---

### ⚡ Optimization Notes
- Prioritize keyword matching for ATS
- Penalize missing required skills
- Reward quantified achievements
- Ensure suggestions are realistic and actionable"""

    def _call_groq(self, prompt: str, api_key: str) -> str:
        """Call Groq API using requests (no extra SDK needed)."""
        import requests

        logger.debug("Calling Groq API")

        # Try models in order of preference
        models_to_try = [
            "llama-3.3-70b-versatile",
            "llama-3.1-70b-versatile",
            "llama-3.1-8b-instant",
            "mixtral-8x7b-32768",
        ]

        last_error = None

        for model_name in models_to_try:
            try:
                logger.debug("Trying Groq model: %s", model_name)
                response = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model_name,
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a professional resume analyst. Always respond with valid JSON only, no markdown formatting or code blocks.",
                            },
                            {"role": "user", "content": prompt},
                        ],
                        "temperature": 0.3,
                        "max_tokens": 4096,
                        "response_format": {"type": "json_object"},
                    },
                    timeout=60,
                )

                if response.status_code == 200:
                    data = response.json()
                    result = data["choices"][0]["message"]["content"]
                    logger.info("Groq response received from %s", model_name)
                    return result
                elif response.status_code == 429:
                    error_msg = response.json().get("error", {}).get("message", "Rate limited")
                    logger.warning("Groq rate limit on %s: %s", model_name, error_msg)
                    # Try next model
                    last_error = f"Rate limit: {error_msg}"
                    time.sleep(2)
                    continue
                elif response.status_code == 401:
                    raise ValueError(
                        "Invalid Groq API key. Get a free key at https://console.groq.com"
                    )
                else:
                    error_data = response.json() if response.headers.get("content-type", "").startswith("application/json") else {"error": response.text}
                    error_msg = error_data.get("error", {}).get("message", response.text)
                    logger.warning("Groq error on %s: %s - %s", model_name, response.status_code, error_msg)
                    last_error = f"{response.status_code}: {error_msg}"
                    continue

            except requests.exceptions.Timeout:
                logger.warning("Groq timeout on %s", model_name)
                last_error = "Request timed out"
                continue
            except requests.exceptions.ConnectionError:
                logger.error("Groq connection failed")
                last_error = "Connection failed"
                break
            except ValueError:
                raise
            except Exception as e:
                logger.warning("Groq error on %s: %s", model_name, e)
                last_error = str(e)
                continue

        raise Exception(f"All Groq models failed. Last error: {last_error}")

    def _call_gemini(self, prompt: str, api_key: str) -> str:
        """Call Gemini API as fallback."""
        import google.generativeai as genai

        logger.debug("Calling Gemini API fallback")
        genai.configure(api_key=api_key)

        models_to_try = [
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-pro",
        ]

        last_error = None

        for model_name in models_to_try:
            try:
                logger.debug("Trying Gemini model: %s", model_name)
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                result = response.text
                logger.info("Gemini response received from %s", model_name)
                return result
            except Exception as e:
                error_str = str(e)
                logger.warning("Gemini %s failed: %s", model_name, error_str[:100])
                last_error = error_str
                if "429" in error_str or "quota" in error_str.lower():
                    continue
                else:
                    continue

        raise Exception(f"All Gemini models failed. Last error: {last_error}")

    def _clean_json_response(self, text: str) -> str:
        """Clean up LLM response to extract valid JSON."""
        # Remove markdown code blocks if present
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        # Try to find JSON object in the response
        if not text.startswith("{"):
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                text = match.group()

        return text

    def _parse_analysis_response(
        self,
        analysis: dict,
        resume_text: str,
        job_description: str,
    ) -> dict:
        """Map model output to normalized, weighted scores."""
        raw_scores = {
            "ats_score": analysis.get("ats", {}).get("score", analysis.get("overallScore", 0)),
            "tone_style_score": analysis.get("toneAndStyle", {}).get("score", 0),
            "content_score": analysis.get("content", {}).get("score", 0),
            "structure_score": analysis.get("structure", {}).get("score", 0),
            "skills_score": analysis.get("skills", {}).get("score", 0),
        }

        if all(score == 0 for score in raw_scores.values()):
            raw_scores["ats_score"] = analysis.get("overallScore", 0)

        final_scores = finalize_analysis_scores(raw_scores, resume_text, job_description)

        return {
            **final_scores,
            "ats_tips": analysis.get("ats", {}).get("tips", []),
            "tone_style_tips": analysis.get("toneAndStyle", {}).get("tips", []),
            "content_tips": analysis.get("content", {}).get("tips", []),
            "structure_tips": analysis.get("structure", {}).get("tips", []),
            "skills_tips": analysis.get("skills", {}).get("tips", []),
        }

    def analyze_resume(self, resume_text: str, job_title: str, job_description: str) -> dict:
        """Analyze resume using available providers with automatic fallback."""
        prompt = self._get_analysis_prompt(resume_text, job_title, job_description)
        errors = []

        for provider_name, api_key in self.providers:
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    logger.debug(
                        "Analysis attempt %s/%s with %s",
                        attempt + 1,
                        max_retries,
                        provider_name,
                    )

                    if provider_name == "groq":
                        response_text = self._call_groq(prompt, api_key)
                    elif provider_name == "gemini":
                        response_text = self._call_gemini(prompt, api_key)
                    else:
                        continue

                    cleaned = self._clean_json_response(response_text)
                    analysis = json.loads(cleaned)

                    logger.info("Analysis parsed successfully from %s", provider_name)
                    return self._parse_analysis_response(analysis, resume_text, job_description)

                except json.JSONDecodeError as e:
                    error_msg = f"{provider_name} returned invalid JSON: {str(e)}"
                    logger.warning(error_msg)
                    errors.append(error_msg)
                    if attempt < max_retries - 1:
                        time.sleep(2 ** attempt)
                    continue

                except ValueError as e:
                    logger.error("%s auth error: %s", provider_name, e)
                    errors.append(str(e))
                    break

                except Exception as e:
                    error_msg = f"{provider_name} error: {str(e)}"
                    logger.warning(error_msg)
                    errors.append(error_msg)
                    if attempt < max_retries - 1:
                        wait_time = 2 ** attempt
                        logger.debug("Retrying in %ss...", wait_time)
                        time.sleep(wait_time)
                    continue

            logger.warning("All attempts exhausted for %s, trying next provider", provider_name)

        # All providers failed
        all_errors = "; ".join(errors)
        raise Exception(
            f"All AI providers failed to analyze the resume. Errors: {all_errors}"
        )
