import re

def normalize_benefit(benefit: str | None) -> str | None:
    if not benefit:
        return None

    text = benefit.strip()

    text = re.sub(r"[.!?]+$", "", text)

    text = " ".join(text.split())

    patterns = [
        r"^agar\s+",
        r"^supaya\s+",
        r"^sehingga\s+",
    ]

    for pattern in patterns:
        text = re.sub(
            pattern,
            "",
            text,
            count=1,
            flags=re.IGNORECASE
        )

    return text.strip()