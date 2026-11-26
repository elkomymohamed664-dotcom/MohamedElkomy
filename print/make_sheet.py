#!/usr/bin/env python3
"""Printable A4 sheet of LIPOVERSE QR cards, each with the site liposome mark."""
import os
import segno
from PIL import Image, ImageDraw, ImageFont
import arabic_reshaper
from bidi.algorithm import get_display

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(ROOT)
URL = "https://elkomy-liposome.vercel.app"
DPI = 300
A4 = (int(210 / 25.4 * DPI), int(297 / 25.4 * DPI))

INK = (20, 18, 24)
CHARCOAL = (20, 18, 24)
CHARCOAL_2 = (36, 31, 46)
VIOLET = (196, 181, 253)
VIOLET_DEEP = (124, 58, 237)
PALE = (246, 243, 251)
WHITE = (255, 255, 255)
MUTED = (88, 78, 110)
PALE_INK = (237, 228, 255)
LINE = (196, 181, 253)

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
SEALS = [
    os.path.join(REPO, "images", "mansoura-national-university.jpg"),
    os.path.join(REPO, "images", "faculty-of-pharmacy.jpg"),
    os.path.join(REPO, "images", "pharmaceutics-department.jpg"),
]


def px(mm):
    return int(round(mm / 25.4 * DPI))


def font(path, pt):
    return ImageFont.truetype(path, max(8, int(pt * DPI / 72)))


def arabic(text):
    return get_display(arabic_reshaper.reshape(text))


def text_size(draw, text, face):
    box = draw.textbbox((0, 0), text, font=face)
    return box[2] - box[0], box[3] - box[1]


def center(draw, text, y, face, fill, left, width):
    w, h = text_size(draw, text, face)
    draw.text((left + (width - w) / 2, y), text, font=face, fill=fill)
    return h


def circle_image(im, size, ring=0, ring_color=VIOLET):
    im = im.convert("RGBA").resize((size, size), Image.Resampling.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse((1, 1, size - 2, size - 2), fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(im, (0, 0), mask)
    if ring:
        ImageDraw.Draw(out).ellipse((1, 1, size - 2, size - 2), outline=ring_color + (255,), width=ring)
    return out


def load_mark(size):
    im = Image.open(os.path.join(ROOT, "liposome-hero.png"))
    return circle_image(im, size, ring=max(3, size // 48), ring_color=VIOLET)


def load_seal(path, size):
    im = Image.open(path).convert("RGBA")
    side = min(im.size)
    left = (im.size[0] - side) // 2
    top = (im.size[1] - side) // 2
    im = im.crop((left, top, left + side, top + side))
    seal = circle_image(im, size, ring=max(2, size // 28), ring_color=(255, 255, 255))
    return seal


def make_qr(size):
    """QR with the site liposome in the center. Error correction H keeps it scannable."""
    code = segno.make(URL, error="h")
    matrix = code.matrix
    n = len(matrix)
    border = 4
    logo_modules = 13
    modules = n + border * 2
    module_px = max(4, size // modules)
    canvas = modules * module_px
    start = (n - logo_modules) // 2
    im = Image.new("RGBA", (canvas, canvas), (255, 255, 255, 255))
    draw = ImageDraw.Draw(im)
    dark = INK + (255,)
    finder = (76, 29, 149, 255)
    for r in range(n):
        for c in range(n):
            if start <= r < start + logo_modules and start <= c < start + logo_modules:
                continue
            if not matrix[r][c]:
                continue
            x0 = (c + border) * module_px
            y0 = (r + border) * module_px
            in_finder = (r < 7 and c < 7) or (r < 7 and c >= n - 7) or (r >= n - 7 and c < 7)
            if in_finder:
                draw.rectangle((x0, y0, x0 + module_px - 1, y0 + module_px - 1), fill=finder)
            else:
                pad = max(1, module_px // 6)
                draw.ellipse(
                    (x0 + pad, y0 + pad, x0 + module_px - 1 - pad, y0 + module_px - 1 - pad),
                    fill=dark,
                )
    inner = (logo_modules - 2) * module_px
    hero = Image.open(os.path.join(ROOT, "liposome-hero.png"))
    mark = circle_image(hero, inner, ring=max(2, inner // 36), ring_color=VIOLET)
    ox = (start + border + 1) * module_px
    oy = ox
    disc = inner + module_px
    plate = Image.new("RGBA", (disc, disc), (0, 0, 0, 0))
    ImageDraw.Draw(plate).ellipse((0, 0, disc - 1, disc - 1), fill=(255, 255, 255, 255))
    im.paste(plate, (ox - (disc - inner) // 2, oy - (disc - inner) // 2), plate)
    im.paste(mark, (ox, oy), mark)
    if canvas != size:
        page = Image.new("RGB", (size, size), WHITE)
        left = (size - canvas) // 2
        page.paste(im.convert("RGB"), (left, left))
        return page
    return im.convert("RGB")


def paste_rgba(base, overlay, xy):
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    layer.paste(overlay, xy, overlay)
    return Image.alpha_composite(base.convert("RGBA"), layer).convert("RGB")


def rounded_mask(size, radius):
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def clip_round(im, radius):
    im = im.convert("RGBA")
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out.paste(im, (0, 0), rounded_mask(im.size, radius))
    return out


def draw_card(card, qr, mark, seals):
    d = ImageDraw.Draw(card)
    w, h = card.size
    d.rectangle((0, 0, w, h), fill=WHITE)
    head = px(52)
    d.rectangle((0, 0, w, head), fill=CHARCOAL)
    d.rectangle((0, head - px(1.1), w, head), fill=VIOLET_DEEP)

    mark_s = px(40)
    mx = px(5.2)
    my = (head - mark_s) // 2
    card = paste_rgba(card, mark, (mx, my))
    d = ImageDraw.Draw(card)

    tx = mx + mark_s + px(2.4)
    tw = w - tx - px(3.2)
    y = px(5.4)
    lipo = "LIPO"
    verse = "VERSE"
    face = font(FONT_B, 13.2)
    lw, lh = text_size(d, lipo, face)
    vw, _ = text_size(d, verse, face)
    x = tx + (tw - lw - vw) / 2
    d.text((x, y), lipo, font=face, fill=WHITE)
    d.text((x + lw, y), verse, font=face, fill=VIOLET)
    y += lh + px(1.0)
    y += center(d, "Beyond the Cell.", y, font(FONT, 6.3), VIOLET, tx, tw) + px(0.15)
    y += center(d, "Beyond the Science.", y, font(FONT, 6.3), VIOLET, tx, tw) + px(1.5)
    y += center(d, arabic("شوف الليبوسوم يتحرك"), y, font(FONT_B, 7.6), WHITE, tx, tw) + px(0.45)
    y += center(d, arabic("واتعلم توصيل الدواء"), y, font(FONT_B, 7.6), PALE_INK, tx, tw)

    y = head + px(2.2)
    qr_size = px(38)
    qx = (w - qr_size) // 2
    pad = px(1.5)
    d.rounded_rectangle(
        (qx - pad, y - pad, qx + qr_size + pad, y + qr_size + pad),
        radius=px(1.8),
        outline=VIOLET,
        width=3,
    )
    card.paste(qr.resize((qr_size, qr_size), Image.Resampling.NEAREST), (qx, y))
    y += qr_size + px(2.0)

    y += center(d, arabic("امسح الكود وابدأ التعلم"), y, font(FONT_B, 8.0), VIOLET_DEEP, 0, w) + px(0.35)
    y += center(d, "Scan to open the platform", y, font(FONT, 5.8), MUTED, 0, w) + px(0.45)
    y += center(d, "elkomy-liposome.vercel.app", y, font(FONT_B, 6.2), INK, 0, w) + px(1.1)

    d.line((px(8), y, w - px(8), y), fill=LINE, width=2)
    y += px(1.2)
    y += center(d, arabic("تحت إشراف"), y, font(FONT_B, 6.4), VIOLET_DEEP, 0, w) + px(0.3)
    y += center(d, "Prof. Dr. Irhan I. Abu Hashim", y, font(FONT, 5.5), INK, 0, w) + px(0.15)
    y += center(d, "Prof. Dr. Marwa S. El-Dahhan", y, font(FONT, 5.5), INK, 0, w) + px(1.1)

    seal_s = px(9.2)
    gap = px(1.6)
    row_w = seal_s * 3 + gap * 2
    sx = (w - row_w) // 2
    for i, seal in enumerate(seals):
        card = paste_rgba(card, seal, (sx + i * (seal_s + gap), y))
    d = ImageDraw.Draw(card)
    y += seal_s + px(0.8)
    y += center(d, "Faculty of Pharmacy, Mansoura National University", y, font(FONT, 4.8), MUTED, 0, w) + px(0.7)
    center(d, arabic("منصة تعليمية — ليست نصيحة طبية"), y, font(FONT_B, 5.0), MUTED, 0, w)
    return card


def dashes(draw, x1, y1, x2, y2):
    step = px(1.6)
    if x1 == x2:
        y = y1
        while y < y2:
            draw.line((x1, y, x2, min(y + step, y2)), fill=VIOLET_DEEP, width=2)
            y += step * 2
    else:
        x = x1
        while x < x2:
            draw.line((x, y1, min(x + step, x2), y2), fill=VIOLET_DEEP, width=2)
            x += step * 2


def main():
    page = Image.new("RGB", A4, PALE)
    draw = ImageDraw.Draw(page)
    margin = px(8)
    header_h = px(12)
    gap = px(4)
    cols, rows = 2, 2
    card_w = (A4[0] - margin * 2 - gap) // cols
    card_h = (A4[1] - header_h - margin - gap) // rows

    draw.text((margin, px(3.0)), "LIPOVERSE", font=font(FONT_B, 11), fill=INK)
    title_w, _ = text_size(draw, "LIPOVERSE", font(FONT_B, 11))
    draw.text((margin + title_w + px(2), px(4.1)), "QR cards  ·  A4", font=font(FONT, 7), fill=MUTED)
    ar_head = arabic("أربع بطاقات — قص ووزّع")
    aw, _ = text_size(draw, ar_head, font(FONT_B, 8))
    draw.text((A4[0] - margin - aw, px(3.4)), ar_head, font=font(FONT_B, 8), fill=VIOLET_DEEP)
    draw.text(
        (margin, px(8.4)),
        "Cut along the dashed lines. Each card opens the same platform.",
        font=font(FONT, 6.1),
        fill=MUTED,
    )

    qr = make_qr(px(38))
    mark = load_mark(px(40))
    seals = [load_seal(path, px(9.2)) for path in SEALS]
    inner_w = card_w - px(1.4)
    inner_h = card_h - px(1.4)

    for row in range(rows):
        for col in range(cols):
            x = margin + col * (card_w + gap)
            y = header_h + row * (card_h + gap)
            radius = px(3.2)
            card = Image.new("RGB", (inner_w, inner_h), WHITE)
            card = clip_round(draw_card(card, qr, mark, seals), radius)
            shadow = Image.new("RGBA", card.size, (0, 0, 0, 0))
            ImageDraw.Draw(shadow).rounded_rectangle(
                (0, 0, card.size[0] - 1, card.size[1] - 1),
                radius=radius,
                fill=(214, 206, 230, 255),
            )
            page = paste_rgba(page, shadow, (x + px(0.7), y + px(0.7)))
            page = paste_rgba(page, card, (x, y))
            draw = ImageDraw.Draw(page)
            draw.rounded_rectangle(
                (x, y, x + card.size[0] - 1, y + card.size[1] - 1),
                radius=radius,
                outline=VIOLET_DEEP,
                width=4,
            )

    mid_x = margin + card_w + gap // 2
    dashes(draw, mid_x, header_h, mid_x, A4[1] - margin // 2)
    mid_y = header_h + card_h + gap // 2
    dashes(draw, margin, mid_y, A4[0] - margin, mid_y)

    png = os.path.join(ROOT, "lipoverse-qr-sheet.png")
    pdf = os.path.join(ROOT, "lipoverse-qr-sheet.pdf")
    page.save(png, "PNG", dpi=(DPI, DPI))
    page.save(pdf, "PDF", resolution=DPI)
    print(png)
    print(pdf)
    print(page.size)


if __name__ == "__main__":
    main()
