"""
Email Service
Handles sending emails using fastapi-mail
"""
from typing import List, Any
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from ..config import get_settings

settings = get_settings()

# Default configuration
conf = ConnectionConfig(
    MAIL_USERNAME=settings.mail_username,
    MAIL_PASSWORD=settings.mail_password,
    MAIL_FROM=settings.mail_from,
    MAIL_PORT=settings.mail_port,
    MAIL_SERVER=settings.mail_server,
    MAIL_STARTTLS=settings.mail_starttls,
    MAIL_SSL_TLS=settings.mail_ssl_tls,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)

async def send_verification_email(email_to: EmailStr, verification_code: str):
    """
    Send verification email with code
    """
    
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Vérification de votre compte</h2>
        <p>Merci de vous être inscrit sur SiteAuditor.</p>
        <p>Pour activer votre compte, veuillez entrer le code de vérification ci-dessous :</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">{verification_code}</span>
        </div>
        <p>Ce code est valable pendant 15 minutes.</p>
        <p>Si vous n'avez pas demandé ce code, veuillez ignorer cet email.</p>
    </div>
    """

    message = MessageSchema(
        subject="Code de vérification SiteAuditor",
        recipients=[email_to],
        body=html,
        subtype=MessageType.html
    )

    try:
        # Check if we have valid credentials
        if not settings.mail_password or settings.mail_username == "user@example.com":
            print(f"============================================")
            print(f"EMAIL SIMULATION - TO: {email_to}")
            print(f"CODE: {verification_code}")
            print(f"============================================")
            return True
            
        fm = FastMail(conf)
        await fm.send_message(message)
        print(f"EMAIL SENT SUCCESSFULLY TO: {email_to}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        # Always print code in dev even on error so user isn't stuck
        print(f"============================================")
        print(f"EMAIL FAILBACK - CODE: {verification_code}")
        print(f"============================================")
        return False
