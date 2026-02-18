"""
Uses AI (OpenAI or Anthropic) to generate report drafts based on:
1. Parsed content from uploaded past reports (style/format learning)
2. Current day's activity summary (what was worked on)
3. User-provided notes or additional context
"""
import os
from datetime import datetime
from pathlib import Path
import json

from dotenv import load_dotenv

load_dotenv()

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
AI_PROVIDER = os.getenv("AI_PROVIDER", "openai")


def _load_report_templates() -> str:
    """Load all parsed report templates from disk."""
    templates_dir = UPLOAD_DIR / "parsed"
    if not templates_dir.exists():
        return ""
    templates = []
    for f in templates_dir.glob("*.txt"):
        content = f.read_text(encoding="utf-8")
        templates.append(f"--- Template: {f.stem} ---\n{content[:2000]}")
    return "\n\n".join(templates)


def _build_prompt(
    report_type: str,
    activity_summary: dict,
    additional_notes: str,
    tone: str,
    templates: str
) -> str:
    today = datetime.now().strftime("%B %d, %Y")
    top_apps = ", ".join(
        f"{a['app']} ({a['seconds'] // 60} min)"
        for a in activity_summary.get("top_apps", [])[:5]
    ) or "No activity tracked yet"

    template_section = (
        f"\n\nHere are examples of past reports to match the style and format:\n{templates}"
        if templates else ""
    )

    return f"""You are a professional report assistant. Generate a {report_type} report for {today}.

Tone: {tone}
Main apps used today: {top_apps}
Additional notes from the user: {additional_notes or "None"}
{template_section}

Instructions:
- Match the structure and style of the example reports above if provided
- Highlight key accomplishments and tasks completed
- Keep it concise and ready to send to a team
- Use bullet points where appropriate
- If it's a social media post, make it engaging and on-brand

Generate the report now:"""


def generate_with_openai(prompt: str) -> str:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=1500
    )
    return response.choices[0].message.content.strip()


def generate_with_anthropic(prompt: str) -> str:
    import anthropic
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}]
    )
    return message.content[0].text.strip()


def generate_report(
    report_type: str,
    activity_summary: dict,
    additional_notes: str = "",
    tone: str = "professional"
) -> str:
    templates = _load_report_templates()
    prompt = _build_prompt(report_type, activity_summary, additional_notes, tone, templates)

    if AI_PROVIDER == "anthropic":
        return generate_with_anthropic(prompt)
    return generate_with_openai(prompt)
