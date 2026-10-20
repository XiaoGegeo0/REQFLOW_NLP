import re


def normalize_action(action: str | None) -> str | None:
    if not action:
        return None

    text = action.strip()

    # Hapus titik di akhir
    text = re.sub(r"[.!?]+$", "", text)

    # Normalisasi spasi
    text = " ".join(text.split())

    patterns = [
        # "fitur untuk mengedit user story"
        r"^fitur\s+untuk\s+",

        # "kemampuan untuk mengunduh laporan"
        r"^kemampuan\s+untuk\s+",

        # "fitur agar pengguna bisa melihat laporan"
        r"^fitur\s+agar\s+(?:pengguna|user)\s+(?:dapat|bisa)\s+",

        # "pengguna dapat mengunduh laporan"
        r"^(?:pengguna|user)\s+(?:dapat|bisa)\s+",

        # "sistem dapat menyimpan feedback"
        r"^sistem\s+(?:dapat|bisa)\s+",

        # "sistem untuk menyimpan feedback"
        r"^sistem\s+untuk\s+",

        # "dapat mengedit user story"
        r"^(?:dapat|bisa)\s+",

        # "fitur mengedit user story"
        r"^fitur\s+",
    ]

    for pattern in patterns:
        new_text = re.sub(
            pattern,
            "",
            text,
            count=1,
            flags=re.IGNORECASE
        )

        if new_text != text:
            text = new_text.strip()
            break

    return text