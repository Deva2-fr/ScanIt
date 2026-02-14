import stripe
import logging
from typing import Optional, Dict, Any
from fastapi import HTTPException
from ..config import get_settings
from ..models.user import User

logger = logging.getLogger(__name__)

class StripeService:
    def __init__(self):
        self.settings = get_settings()
        stripe.api_key = self.settings.stripe_secret_key
        self.webhook_secret = self.settings.stripe_webhook_secret

    async def create_checkout_session(self, user: User, price_id: str, success_url: str, cancel_url: str) -> str:
        """
        Creates a Stripe Checkout Session for a subscription.
        Returns the checkout URL.
        """
        try:
            # 1. Get or Create Customer
            if not user.stripe_customer_id:
                customer = stripe.Customer.create(
                    email=user.email,
                    name=user.full_name,
                    metadata={"user_id": str(user.id)}
                )
                # We should update the user here or let the webhook do it.
                # For consistency, we return the customer ID and let the caller/webhook handle db updates
                # But to proceed with checkout, we need the ID.
                user.stripe_customer_id = customer.id
            
            # 2. Create Session
            session = stripe.checkout.Session.create(
                customer=user.stripe_customer_id,
                payment_method_types=["card"],
                line_items=[{
                    "price": price_id,
                    "quantity": 1,
                }],
                mode="subscription",
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={"user_id": str(user.id)} # Critical for webhook reconciliation
            )
            
            return session.url
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe Checkout Error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    async def create_portal_session(self, user: User, return_url: str) -> str:
        """
        Creates a Billing Portal session for the user to manage subscription.
        """
        if not user.stripe_customer_id:
            raise HTTPException(status_code=400, detail="No billing account found for this user.")
            
        try:
            session = stripe.billing_portal.Session.create(
                customer=user.stripe_customer_id,
                return_url=return_url
            )
            return session.url
        except stripe.error.StripeError as e:
            logger.error(f"Stripe Portal Error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    async def construct_event(self, payload: bytes, sig_header: str) -> stripe.Event:
        """
        Verifies and constructs the Stripe Event from the webhook payload.
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, self.webhook_secret
            )
            return event
        except ValueError as e:
            # Invalid payload
            raise HTTPException(status_code=400, detail="Invalid payload")
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            raise HTTPException(status_code=400, detail="Invalid signature")

    # Helper to map Stripe Products/Prices to internal Plan Tiers
    def get_plan_tier_from_price(self, price_id: str) -> str:
        # This mapping should ideally be in config or db
        # For now we use the logic or maybe metadata on the price object?
        # Let's assume the user passes the tier in metadata or we check checking IDs
        # Simplest: Map known IDs (configured in env)
        
        # NOTE: In a real app, fetch price from Stripe and check product metadata 'tier'
        # For this implementation, we will trust the plan tier is synced via product metadata
        # Or returns a default.
        pass
