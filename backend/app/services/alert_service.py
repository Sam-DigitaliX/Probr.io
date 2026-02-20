import json
import logging
import smtplib
from email.mime.text import MIMEText

import httpx

from app.config import settings

logger = logging.getLogger("trackguard.alerts")


async def send_slack_notification(webhook_url: str, title: str, message: str, severity: str) -> bool:
    """Send an alert notification to Slack via webhook."""
    color = "#dc2626" if severity == "critical" else "#f59e0b"
    emoji = ":red_circle:" if severity == "critical" else ":warning:"

    payload = {
        "attachments": [
            {
                "color": color,
                "blocks": [
                    {
                        "type": "header",
                        "text": {"type": "plain_text", "text": f"{emoji} {title}"},
                    },
                    {
                        "type": "section",
                        "text": {"type": "mrkdwn", "text": message},
                    },
                ],
            }
        ]
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(webhook_url, json=payload, timeout=10)
            if resp.status_code == 200:
                logger.info(f"Slack notification sent: {title}")
                return True
            logger.error(f"Slack webhook returned {resp.status_code}")
            return False
    except Exception:
        logger.exception("Failed to send Slack notification")
        return False


async def send_email_notification(to_email: str, title: str, message: str, severity: str) -> bool:
    """Send an alert notification via email."""
    if not settings.smtp_host:
        logger.warning("SMTP not configured, skipping email notification")
        return False

    msg = MIMEText(f"Severity: {severity.upper()}\n\n{message}", "plain", "utf-8")
    msg["Subject"] = f"[TrackGuard] {title}"
    msg["From"] = settings.smtp_from
    msg["To"] = to_email

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            if settings.smtp_user:
                server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
        logger.info(f"Email notification sent to {to_email}: {title}")
        return True
    except Exception:
        logger.exception("Failed to send email notification")
        return False


async def notify_alert(title: str, message: str, severity: str,
                       client_email: str | None = None,
                       client_slack_webhook: str | None = None) -> None:
    """Send alert notifications via all configured channels."""
    # Global Slack webhook
    if settings.slack_webhook_url:
        await send_slack_notification(settings.slack_webhook_url, title, message, severity)

    # Client-specific Slack webhook
    if client_slack_webhook:
        await send_slack_notification(client_slack_webhook, title, message, severity)

    # Email to client
    if client_email:
        await send_email_notification(client_email, title, message, severity)
