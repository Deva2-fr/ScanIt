import logging
import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Configure mail service
conf = ConnectionConfig(
    MAIL_USERNAME=settings.mail_username,
    MAIL_PASSWORD=settings.mail_password,
    MAIL_FROM=settings.mail_from,
    MAIL_PORT=settings.mail_port,
    MAIL_SERVER=settings.mail_server,
    MAIL_STARTTLS=settings.mail_starttls,
    MAIL_SSL_TLS=settings.mail_ssl_tls,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=False, # Dev only mainly
    TEMPLATE_FOLDER=os.path.join(os.path.dirname(__file__), "../templates") if os.path.exists("app/templates") else None
)

async def send_alert_email(to_email: str, url: str, old_score: int, new_score: int, report_link: str = "#"):
    """
    Sends an alert email when a monitored site's score drops.
    """
    if not settings.mail_password:
        logger.warning("Mail password not set, skipping email sending.")
        return

    subject = f"⚠️ Alerte : Le score de {url} a chuté de {old_score - new_score} points"
    
    html = f"""
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">SiteAuditor Alerte</h1>
        </div>
        <div style="padding: 20px;">
            <p>Bonjour,</p>
            <p>Votre surveillance automatique a détecté une régression significative sur le site :</p>
            <p style="font-size: 16px; font-weight: bold; color: #dc2626;">{url}</p>
            
            <div style="background-color: #f1f5f9; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-size: 18px;">
                    Score hier : <strong>{old_score}/100</strong> <br>
                    Score aujourd'hui : <strong>{new_score}/100</strong> 📉
                </p>
            </div>
            
            <p>Nous vous recommandons de vérifier le rapport détaillé pour identifier les causes de cette baisse.</p>
            
            <a href="{report_link}" style="display: inline-block; background-color: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 10px;">
                Voir le rapport détaillé
            </a>
        </div>
        <div style="background-color: #f8fafc; color: #64748b; padding: 15px; text-align: center; font-size: 12px; border-top: 1px solid #ddd;">
             Cet email a été envoyé automatiquement par SiteAuditor Watchdog.
        </div>
    </div>
    """

    message = MessageSchema(
        subject=subject,
        recipients=[to_email],
        body=html,
        subtype=MessageType.html
    )

    try:
        fm = FastMail(conf)
        await fm.send_message(message)
        logger.info(f"Alert email sent to {to_email} for {url}")
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
