"""
Sends generated reports via Gmail SMTP to the configured recipient.
Requires GMAIL_USER and GMAIL_APP_PASSWORD in .env (use a Gmail App Password,
not your regular Gmail password).
"""
import os
import ssl
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from dotenv import load_dotenv

load_dotenv()

GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")
REPORT_RECIPIENT = os.getenv("REPORT_RECIPIENT", "ialonsoa@byu.edu")


def send_report_email(subject: str, content: str) -> bool:
    """Send a report email via Gmail SMTP. Returns True on success."""
    if not GMAIL_USER or not GMAIL_APP_PASSWORD:
        raise ValueError(
            "Gmail credentials not configured. "
            "Set GMAIL_USER and GMAIL_APP_PASSWORD in your .env file."
        )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = GMAIL_USER
    msg["To"] = REPORT_RECIPIENT

    msg.attach(MIMEText(content, "plain"))

    context = ssl.create_default_context()
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.ehlo()
        server.starttls(context=context)
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        server.sendmail(GMAIL_USER, REPORT_RECIPIENT, msg.as_string())

    return True
