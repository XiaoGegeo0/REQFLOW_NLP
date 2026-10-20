import re


def clean_text(text: str) -> str:
    # hapus spasi berlebih
    text = " ".join(text.strip().split())

    # rapikan spasi sebelum tanda baca
    text = re.sub(r"\s+([,.!?])", r"\1", text)

    # hapus tanda titik berlebih di akhir
    text = re.sub(r"[.]+$", "", text)

    return text