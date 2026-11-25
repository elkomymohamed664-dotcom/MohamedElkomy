#!/usr/bin/env python3
"""Printable A4 sheet of LIPOVERSE QR cards. Run with the local venv that has pillow and segno."""
import os
import segno
from PIL import Image, ImageDraw, ImageFont
import arabic_reshaper
from bidi.algorithm import get_display

ROOT = os.path.dirname(os.path.abspath(__file__))
URL = "https://elkomy-liposome.vercel.app"
DPI = 300
A4 = (int(210 / 25.4 * DPI), int(297 / 25.4 * DPI))  # 2480 x 3508

INK = (20, 18, 24)
VIOLET = (109, 40, 217)
VIOLET_SOFT = (124, 58, 237)
PALE = (246, 243, 251)
CARD = (255, 255, 255)
MUTED = (78, 68, 98)
LINE = (196, 181, 253)

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def px(mm):
    return int(round(mm / 25.4 * DPI))


def font(path, pt):
    return ImageFont.truetype(path, max(8, int(pt * DPI / 72)))


def arabic(text):
    return get_display(arabic_reshaper.reshape(text))


def text_width(draw, text, face):
    box = draw.textbbox((0, 0), text, font=face)
    return box[2] - box[0], box[3] - box[1]


def center(draw, text, y, face, fill, left, width):
    w, h = text_width(draw, text, face)
    draw.text((left + (width - w) / 2, y), text, font=face, fill=fill)
    return h


def make_qr(size):
    code = segno.make(URL, error="h")
    path = os.path.join(ROOT, "_qr.png")
    code.save(path, scale=16, border=2, dark="#141218", light="#ffffff")
    img = Image.open(path).convert("RGB")
    img = img.resize((size, size), Image.Resampling.NEAREST)
    os.remove(path)
    return img


def rounded_rect(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_card(card, qr):
    d = ImageDraw.Draw(card)
    w, h = card.size
    d.rectangle((0, 0, w, h), fill=CARD)
    d.rectangle((0, 0, px(3.2), h), fill=VIOLET)
    d.rectangle((0, 0, w, px(1.4)), fill=VIOLET_SOFT)

    y = px(4.2)
    y += center(d, "LIPOVERSE", y, font(FONT_B, 15.5), INK, 0, w) + px(0.6)
    y += center(d, "Beyond the Cell. Beyond the Science.", y, font(FONT, 6.4), VIOLET, 0, w) + px(1.6)
    y += center(d, arabic("منصة تعليمية عن الليبوسومات"), y, font(FONT_B, 8.4), INK, 0, w) + px(0.4)
    y += center(d, arabic("وتوصيل الدواء لطلاب الصيدلة"), y, font(FONT_B, 8.4), INK, 0, w) + px(1.6)

    qr_size = px(34)
    qx = (w - qr_size) // 2
    pad = px(1.4)
    d.rounded_rectangle(
        (qx - pad, y - pad, qx + qr_size + pad, y + qr_size + pad),
        radius=px(1.6),
        outline=LINE,
        width=2,
    )
    card.paste(qr.resize((qr_size, qr_size), Image.Resampling.NEAREST), (qx, y))
    y += qr_size + px(2.0)

    y += center(d, arabic("امسح الكود وابدأ التعلم"), y, font(FONT_B, 8.2), VIOLET, 0, w) + px(0.3)
    y += center(d, "Scan to open the platform", y, font(FONT, 6.2), MUTED, 0, w) + px(0.5)
    y += center(d, "elkomy-liposome.vercel.app", y, font(FONT_B, 6.3), INK, 0, w) + px(1.5)

    d.line((px(8), y, w - px(8), y), fill=LINE, width=2)
    y += px(1.3)
    y += center(d, arabic("تحت إشراف"), y, font(FONT_B, 6.6), VIOLET, 0, w) + px(0.35)
    y += center(d, "Prof. Dr. Irhan I. Abu Hashim", y, font(FONT, 5.5), INK, 0, w) + px(0.15)
    y += center(d, "Prof. Dr. Marwa S. El-Dahhan", y, font(FONT, 5.5), INK, 0, w) + px(0.45)
    y += center(d, "Pharmaceutics Department", y, font(FONT, 5.2), MUTED, 0, w) + px(0.15)
    center(d, "Faculty of Pharmacy, Mansoura National University", y, font(FONT, 5.0), MUTED, 0, w)
    note = arabic("منصة تعليمية — ليست نصيحة طبية")
    center(d, note, h - px(6.4), font(FONT_B, 5.4), MUTED, 0, w)


def main():
    page = Image.new("RGB", A4, PALE)
    draw = ImageDraw.Draw(page)
    margin = px(8)
    header_h = px(14)
    gap = px(3.2)
    cols, rows = 2, 3
    card_w = (A4[0] - margin * 2 - gap) // cols
    card_h = (A4[1] - margin - header_h - margin - gap * (rows - 1)) // rows

    draw.text((margin, px(3.2)), "LIPOVERSE", font=font(FONT_B, 11), fill=INK)
    title_w, _ = text_width(draw, "LIPOVERSE", font(FONT_B, 11))
    draw.text((margin + title_w + px(2.2), px(4.4)), "QR handout  ·  A4", font=font(FONT, 7), fill=MUTED)
    ar_head = arabic("ست بطاقات للطباعة والقص والتوزيع")
    aw, _ = text_width(draw, ar_head, font(FONT_B, 8))
    draw.text((A4[0] - margin - aw, px(3.6)), ar_head, font=font(FONT_B, 8), fill=VIOLET)
    draw.text((margin, px(9.2)), "Cut along the dashed lines. Each card opens the same learning platform.", font=font(FONT, 6.2), fill=MUTED)

    qr = make_qr(px(34))
    for row in range(rows):
        for col in range(cols):
            x = margin + col * (card_w + gap)
            y = header_h + margin // 2 + row * (card_h + gap)
            card = Image.new("RGB", (card_w - px(1.2), card_h - px(1.2)), CARD)
            draw_card(card, qr)
            shadow = Image.new("RGB", card.size, (226, 218, 240))
            page.paste(shadow, (x + px(0.6), y + px(0.6)))
            page.paste(card, (x, y))
            draw.rounded_rectangle(
                (x, y, x + card.size[0] - 1, y + card.size[1] - 1),
                radius=px(2.2),
                outline=VIOLET_SOFT,
                width=3,
            )

    # dashed cut guides in the gaps
    def dashes(x1, y1, x2, y2):
        if x1 == x2:
            step = px(1.6)
            y = y1
            while y < y2:
                draw.line((x1, y, x2, min(y + step, y2)), fill=VIOLET_SOFT, width=2)
                y += step * 2
        else:
            step = px(1.6)
            x = x1
            while x < x2:
                draw.line((x, y1, min(x + step, x2), y2), fill=VIOLET_SOFT, width=2)
                x += step * 2

    mid_x = margin + card_w + gap // 2
    dashes(mid_x, header_h, mid_x, A4[1] - margin)
    for row in range(1, rows):
        y = header_h + margin // 2 + row * (card_h + gap) - gap // 2
        dashes(margin, y, A4[0] - margin, y)

    png = os.path.join(ROOT, "lipoverse-qr-sheet.png")
    pdf = os.path.join(ROOT, "lipoverse-qr-sheet.pdf")
    page.save(png, "PNG", dpi=(DPI, DPI))
    page.save(pdf, "PDF", resolution=DPI)
    print(png)
    print(pdf)
    print(page.size)


if __name__ == "__main__":
    main()
