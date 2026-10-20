import re

from app.services.preprocessing import clean_text
from app.services.requirement_classifier import classify_requirement
from app.services.action_normalizer import normalize_action
from app.services.benefit_normalizer import normalize_benefit

def extract_actor(text: str):
    patterns = [
        r"\bsebagai\s+([^,]+)",
        r"\buntuk\s+(admin|mahasiswa|dosen|stakeholder|user|pengguna)\b",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            return match.group(1).strip()

    return "User"


def extract_benefit(text: str):
    patterns = [
        r"\bagar\s+(.+)",
        r"\bsupaya\s+(.+)",
        r"\bsehingga\s+(.+)",
        r"\buntuk memudahkan\s+(.+)",
        r"\buntuk membantu\s+(.+)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            return match.group(1).strip()

    return None


def extract_action(text: str):
    patterns = [
        r"\bsaya ingin dapat\s+(.+)",
        r"\bsaya juga ingin\s+(.+)",
        r"\bsaya ingin\s+(.+)",
        r"\bsaya membutuhkan\s+(.+)",
        r"\bsaya butuh\s+(.+)",
        r"\bsistem harus dapat\s+(.+)",
        r"\bsistem harus bisa\s+(.+)",
        r"\bharus dapat\s+(.+)",
        r"\bharus bisa\s+(.+)",
        r"\bingin dapat\s+(.+)",
        r"\bingin\s+(.+)",
        r"\bmembutuhkan\s+(.+)",
        r"\bmemerlukan\s+(.+)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)

        if match:
            action = match.group(1).strip()

            action = re.split(
                r"\b(?:agar|supaya|sehingga)\b",
                action,
                maxsplit=1,
                flags=re.IGNORECASE
            )[0].strip()

            return action

    return None


def generate_user_story(feedback: str):
    text = clean_text(feedback)

    if not text:
        return {
            "is_requirement": False,
            "actor": None,
            "action": None,
            "benefit": None,
            "user_story": None,
            "message": "Feedback kosong."
        }
        
    classification = classify_requirement(text)

    if not classification["is_requirement"]:
        return {
            "is_requirement": False,
            "confidence": classification["confidence"],
            "actor": None,
            "action": None,
            "benefit": None,
            "user_story": None,
            "message": "Kandidat requirement tidak ditemukan."
        }

    actor = extract_actor(text)
    action = extract_action(text)
    benefit = extract_benefit(text)

    action = normalize_action(action)
    benefit = normalize_benefit(benefit)

    if not action:
        return {
            "is_requirement": False,
            "actor": None,
            "action": None,
            "benefit": None,
            "user_story": None,
            "message": "Kandidat requirement tidak ditemukan."
        }

    user_story = f"Sebagai {actor}, saya ingin {action}"

    if benefit:
        user_story += f" agar {benefit}"

    user_story += "."

    return {
        "is_requirement": True,
        "confidence": classification["confidence"],
        "actor": actor,
        "action": action,
        "benefit": benefit,
        "user_story": user_story,
        "message": "User story berhasil dihasilkan."
    }