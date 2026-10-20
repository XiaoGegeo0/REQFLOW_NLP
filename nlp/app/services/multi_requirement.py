import re

from app.services.preprocessing import clean_text
from app.services.user_story_generator import generate_user_story


def split_requirement_candidates(text: str):
    text = clean_text(text)

    # Pecah berdasarkan titik, titik koma,
    # atau penghubung tertentu yang sering memisahkan requirement
    parts = re.split(
        r"[.;]|\bdan sistem\b|\bselain itu\b|\bkemudian\b",
        text,
        flags=re.IGNORECASE
    )

    candidates = []

    for part in parts:
        part = part.strip()

        if len(part) >= 5:
            candidates.append(part)

    return candidates


def generate_multiple_user_stories(feedback: str):
    candidates = split_requirement_candidates(feedback)

    results = []

    for candidate in candidates:
        result = generate_user_story(candidate)

        if result["is_requirement"]:
            results.append({
                "source_text": candidate,
                "confidence": result["confidence"],
                "actor": result["actor"],
                "action": result["action"],
                "benefit": result["benefit"],
                "user_story": result["user_story"]
            })

    return {
        "total_candidates": len(candidates),
        "total_requirements": len(results),
        "requirements": results
    }