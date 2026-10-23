from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.platypus import Paragraph
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs"

INK = HexColor("#132b27")
LIME = HexColor("#d9ff70")
PAPER = HexColor("#f4f1e8")
MUTED = HexColor("#68746f")
LINE = HexColor("#c9cbbd")
BLUE = HexColor("#8fc7ff")
GOLD = HexColor("#ffd36b")
CORAL = HexColor("#ff8b73")


def wrap(c, text, x, y, width, style):
    paragraph = Paragraph(text, style)
    _, height = paragraph.wrap(width, 1000)
    paragraph.drawOn(c, x, y - height)
    return y - height


def style(size=10, leading=None, color=INK, font="Helvetica"):
    return ParagraphStyle(
        "body", fontName=font, fontSize=size, leading=leading or size * 1.45,
        textColor=color, spaceAfter=0,
    )


def brand(c, width, height, label="CASH CHECK"):
    c.setFillColor(INK)
    c.roundRect(36, height - 62, 28, 28, 6, fill=1, stroke=0)
    c.setFillColor(LIME)
    for x, top in [(43, 15), (50, 28), (57, 21)]:
        c.rect(x, height - 62 + 7, 4, top, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(74, height - 51, label)


def footer(c, width, page):
    c.setStrokeColor(LINE)
    c.line(36, 30, width - 36, 30)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8)
    c.drawString(36, 16, "Cash Check | Independent project using SnapTrade")
    c.drawRightString(width - 36, 16, str(page))


def title(c, text, x, y, width, size=31):
    return wrap(c, text, x, y, width, style(size, size * 1.05, INK, "Helvetica-Bold"))


def pill(c, text, x, y, fill=LIME, text_color=INK):
    c.setFont("Helvetica-Bold", 8)
    width = stringWidth(text, "Helvetica-Bold", 8) + 18
    c.setFillColor(fill)
    c.roundRect(x, y - 17, width, 18, 9, fill=1, stroke=0)
    c.setFillColor(text_color)
    c.drawCentredString(x + width / 2, y - 11, text)
    return x + width


def card(c, x, y, width, height, heading, body, accent=INK):
    c.setFillColor(white)
    c.setStrokeColor(LINE)
    c.roundRect(x, y - height, width, height, 12, fill=1, stroke=1)
    c.setFillColor(accent)
    c.roundRect(x + 16, y - 29, 8, 8, 2, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(x + 34, y - 28, heading)
    wrap(c, body, x + 16, y - 45, width - 32, style(9.6, 14, MUTED))


def product_brief():
    filename = OUT / "Cash-Check-Product-Brief.pdf"
    width, height = A4
    c = canvas.Canvas(str(filename), pagesize=A4)
    c.setTitle("Cash Check product brief")

    # Cover
    c.setFillColor(PAPER)
    c.rect(0, 0, width, height, fill=1, stroke=0)
    brand(c, width, height)
    pill(c, "READ-ONLY", 36, height - 98)
    pill(c, "BUILT WITH SNAPTRADE", 132, height - 98, white)
    title(c, "A clearer view of the cash across your brokerage accounts.", 36, height - 145, width - 72, 35)
    wrap(c, "Cash Check is a small, deployed product that brings brokerage cash into one place, explains what changed recently, and lets a person explore a buy-only what-if. It never places trades.", 36, height - 315, width - 120, style(14, 21, MUTED))
    c.setFillColor(INK)
    c.roundRect(36, 166, width - 72, 112, 18, fill=1, stroke=0)
    c.setFillColor(LIME)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(60, 246, "TRY IT")
    c.setFillColor(white)
    c.setFont("Helvetica", 12)
    c.drawString(60, 219, "Live app: cash-check-nine.vercel.app")
    c.drawString(60, 193, "Code and implementation notes: github.com/theomthakur/cash-check")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 9)
    c.drawString(36, 116, "Built by Om Thakur. The demo uses sample data.")
    c.drawString(36, 96, "Cash Check is independent and is not an official SnapTrade product. Not investment advice.")
    footer(c, width, 1)
    c.showPage()

    # Product page
    c.setFillColor(PAPER)
    c.rect(0, 0, width, height, fill=1, stroke=0)
    brand(c, width, height)
    title(c, "What it helps with", 36, height - 105, width - 72)
    wrap(c, "People often use more than one brokerage. A dividend, deposit, or sale can leave cash in separate places, and it is easy to lose track of the total.", 36, height - 160, width - 72, style(11, 16, MUTED))
    card(c, 36, height - 225, 163, 144, "See it together", "Cash is shown by account and by currency, without adding US and Canadian dollars together.", LIME)
    card(c, 214, height - 225, 163, 144, "Understand change", "The last 30 days show money in, money out, and the resulting cash change. It does not guess which deposit is still in cash.", BLUE)
    card(c, 392, height - 225, 167, 144, "Explore a what-if", "A person can set a target mix and see how using available cash could change it. The app never sells or places an order.", GOLD)
    c.setStrokeColor(LINE)
    c.line(36, 376, width - 36, 376)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(36, 344, "Why SnapTrade")
    wrap(c, "Every brokerage has its own sign-in and data format. SnapTrade handles the brokerage connections and gives Cash Check read-only data in one consistent format. That means Cash Check can focus on a useful experience instead of rebuilding brokerage integrations.", 36, 320, width - 72, style(11, 16, MUTED))
    c.setFillColor(INK)
    c.roundRect(36, 165, width - 72, 102, 14, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(58, 236, "A simple boundary")
    wrap(c, "Cash Check asks for openid and read permissions only. It never sees a brokerage password, and it never stores balances, holdings, or activity.", 58, 218, width - 116, style(11, 16, HexColor("#e5e9df")))
    footer(c, width, 2)
    c.showPage()

    # Design and verification page
    c.setFillColor(PAPER)
    c.rect(0, 0, width, height, fill=1, stroke=0)
    brand(c, width, height)
    title(c, "How it works, and what was checked", 36, height - 105, width - 72)
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(INK)
    c.drawString(36, height - 226, "Connection flow")
    steps = [
        ("1", "You choose Connect", "Cash Check sends you to SnapTrade."),
        ("2", "You sign in with SnapTrade", "Cash Check never sees your brokerage password."),
        ("3", "Read-only access", "The connection token is encrypted in Neon."),
        ("4", "Open your dashboard", "Cash Check reads current data, shows it, and does not save it."),
    ]
    x = 36
    for number, heading, body in steps:
        c.setFillColor(LIME)
        c.circle(x + 12, height - 261, 12, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(x + 12, height - 264, number)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(x, height - 287, heading)
        wrap(c, body, x, height - 296, 122, style(8.5, 12.5, MUTED))
        x += 134
    c.setStrokeColor(LINE)
    c.line(36, 430, width - 36, 430)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(36, 400, "Choices made on purpose")
    choices = [
        ("Read-only", "No trading permissions, no orders, no movement of money."),
        ("Separate currencies", "No hidden conversion rate changes the total."),
        ("Honest history", "The 30-day cash estimate names activity types that were skipped."),
        ("Small scope", "No AI recommendations, fund look-through, or currency conversion."),
    ]
    y = 370
    for heading, body in choices:
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(36, y, heading)
        wrap(c, body, 160, y + 4, width - 196, style(9.4, 14, MUTED))
        y -= 43
    c.setFillColor(white)
    c.setStrokeColor(LINE)
    c.roundRect(36, 75, width - 72, 115, 14, fill=1, stroke=1)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 15)
    c.drawString(56, 166, "Verification and honest limits")
    verify = "40 automated tests cover calculations, the PDF summary, encryption, sign-in, token refresh, and feedback. Lint, TypeScript, production build, and dependency audit pass. The deployed app was checked with SnapTrade's Self-directed sandbox scenario on 23 Oct 2026. It has not yet been checked with a real brokerage account."
    wrap(c, verify, 56, 145, width - 112, style(9.7, 14.5, MUTED))
    footer(c, width, 3)
    c.save()


def slide(c, title_text, eyebrow, body, page):
    width, height = landscape(A4)
    c.setFillColor(PAPER)
    c.rect(0, 0, width, height, fill=1, stroke=0)
    brand(c, width, height)
    c.setFillColor(MUTED)
    c.setFont("Helvetica-Bold", 10)
    # Leave a clear band between the small section label and the title. This
    # keeps longer slide titles from crowding the label in the rendered PDF.
    c.drawString(36, height - 82, eyebrow.upper())
    title(c, title_text, 36, height - 180, 560, 34)
    wrap(c, body, 36, height - 305, 545, style(16, 24, MUTED))
    footer(c, width, page)


def presentation():
    filename = OUT / "Cash-Check-Presentation.pdf"
    width, height = landscape(A4)
    c = canvas.Canvas(str(filename), pagesize=(width, height))
    c.setTitle("Cash Check presentation")

    slide(c, "Where is all your cash?", "Cash Check", "A small, read-only app that brings cash across your brokerage accounts into one clear view. Built by Om Thakur as an independent project using SnapTrade.", 1)
    c.setFillColor(INK)
    c.roundRect(620, 170, 176, 200, 20, fill=1, stroke=0)
    c.setFillColor(LIME)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(648, 326, "CASH CHECK")
    c.setFont("Helvetica-Bold", 44)
    c.drawString(648, 264, "$ 37,500")
    c.setFillColor(white)
    c.setFont("Helvetica", 11)
    c.drawString(648, 232, "across 2 accounts")
    c.showPage()

    slide(c, "Your cash can be easy to overlook.", "The problem", "A dividend can land in one account while a deposit sits in another. Seeing the full picture means opening each brokerage and adding it up yourself.", 2)
    labels = [("Brokerage A", "$12,500", LIME), ("Brokerage B", "$25,000", BLUE), ("Brokerage C", "$4,200", GOLD)]
    y = 336
    for name, amount, color in labels:
        c.setFillColor(white)
        c.setStrokeColor(LINE)
        c.roundRect(620, y, 176, 72, 12, fill=1, stroke=1)
        c.setFillColor(color)
        c.circle(642, y + 47, 7, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(658, y + 43, name)
        c.setFont("Helvetica-Bold", 18)
        c.drawString(638, y + 16, amount)
        y -= 87
    c.showPage()

    slide(c, "SnapTrade makes the connection practical.", "Why SnapTrade", "Every brokerage has its own login and data format. SnapTrade handles those connections, so Cash Check can use read-only data in a consistent format and focus on a useful product experience.", 3)
    c.setStrokeColor(INK)
    c.setLineWidth(2)
    nodes = [(615, "Cash Check"), (705, "SnapTrade"), (795, "Brokerages")]
    for index, (x, label) in enumerate(nodes):
        c.setFillColor(LIME if index == 0 else white)
        c.circle(x, 250, 38, fill=1, stroke=1)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(x, 244, label)
        if index < 2:
            c.line(x + 40, 250, nodes[index + 1][0] - 40, 250)
    c.showPage()

    slide(c, "It reads. It never trades.", "The product", "Cash Check shows cash by account and currency, recent money in and out, and a buy-only what-if. It can help a person explore a target mix without turning that exploration into an order.", 4)
    features = [("Cash today", "What is available, grouped by currency."), ("What changed", "Money in, money out, and the change over 30 days."), ("What-if", "A target mix you can explore without placing a trade.")]
    y = 336
    for head, desc in features:
        c.setFillColor(white)
        c.setStrokeColor(LINE)
        c.roundRect(620, y, 176, 72, 12, fill=1, stroke=1)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(638, y + 44, head)
        wrap(c, desc, 638, y + 34, 140, style(8.5, 12, MUTED))
        y -= 87
    c.showPage()

    slide(c, "A small product with clear boundaries.", "Trust", "The app requests only openid and read permissions. It never sees a brokerage password and never stores balances, holdings, activity, targets, or PDF summaries. Tokens are encrypted on the server so the app can reconnect safely.", 5)
    c.setFillColor(INK)
    c.roundRect(620, 170, 176, 190, 16, fill=1, stroke=0)
    c.setFillColor(LIME)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(644, 326, "WHAT IS SAVED")
    c.setFillColor(white)
    c.setFont("Helvetica", 11)
    c.drawString(644, 292, "Encrypted connection token")
    c.drawString(644, 266, "SnapTrade user ID")
    c.drawString(644, 240, "Anonymous feedback")
    c.showPage()

    slide(c, "What I checked, and what I would learn next.", "Verification", "40 automated tests pass. The production build, type check, lint, and dependency audit pass. The deployed app was checked with SnapTrade sandbox data. Next, I would test a real account, watch the feedback and usage data, and interview people who manage more than one brokerage.", 6)
    c.setFillColor(white)
    c.setStrokeColor(LINE)
    c.roundRect(620, 170, 176, 190, 16, fill=1, stroke=1)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(644, 326, "TRY IT")
    c.setFont("Helvetica", 11)
    c.drawString(644, 290, "cash-check-nine.vercel.app")
    c.drawString(644, 254, "github.com/theomthakur")
    c.drawString(644, 236, "/cash-check")
    c.save()


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    product_brief()
    presentation()
