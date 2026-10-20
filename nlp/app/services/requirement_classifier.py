import re


REQUIREMENT_KEYWORDS = [
    "ingin",
    "butuh",
    "membutuhkan",
    "memerlukan",
    "harus",
    "dapat",
    "bisa",
    "fitur",
    "sistem",
    "pengguna",
    "user",
    "admin",
    "stakeholder",
]


NON_REQUIREMENT_PATTERNS = [
    r"\bbagus\b",
    r"\bkeren\b",
    r"\bjelek\b",
    r"\bsuka\b",
    r"\btidak suka\b",
    r"\bwarnanya\b",
    r"\btampilannya\b",
]


def classify_requirement(text: str):
    text_lower = text.lower()

    score = 0.0

    # =========================
    # Positive signals
    # =========================

    for keyword in REQUIREMENT_KEYWORDS:
        if keyword in text_lower:
            score += 0.08

    # Strong requirement phrases
    strong_patterns = [
        r"\bsaya ingin\b",
        r"\bsaya butuh\b",
        r"\bsaya membutuhkan\b",
        r"\bsaya memerlukan\b",
        r"\bsistem harus\b",
        r"\bharus dapat\b",
        r"\bharus bisa\b",
    ]

    for pattern in strong_patterns:
        if re.search(pattern, text_lower):
            score += 0.25

    # Actor phrase
    if re.search(r"\bsebagai\s+\w+", text_lower):
        score += 0.15

    # Benefit marker
    if re.search(r"\b(agar|supaya|sehingga)\b", text_lower):
        score += 0.10

    # =========================
    # Negative signals
    # =========================

    for pattern in NON_REQUIREMENT_PATTERNS:
        if re.search(pattern, text_lower):
            score -= 0.15

    # Clamp 0 - 1
    score = max(0.0, min(score, 1.0))

    is_requirement = score >= 0.35

    return {
        "is_requirement": is_requirement,
        "confidence": round(score, 2)
    }