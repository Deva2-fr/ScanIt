"""Initial migration

Revision ID: fc011efa5a7f
Revises: 
Create Date: 2026-02-13 22:34:05.167424

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'fc011efa5a7f'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add subscription_status column + missing FK constraints."""
    # Add subscription_status column (new field from security hardening)
    op.add_column('users', sa.Column(
        'subscription_status',
        sqlmodel.sql.sqltypes.AutoString(),
        nullable=False,
        server_default='active'
    ))

    # Add FK constraints if they don't already exist (safe for existing DBs)
    try:
        op.create_foreign_key('fk_api_keys_user_id', 'api_keys', 'users', ['user_id'], ['id'])
    except Exception:
        pass  # FK already exists
    try:
        op.create_foreign_key('fk_leads_agency_id', 'leads', 'users', ['agency_id'], ['id'])
    except Exception:
        pass  # FK already exists


def downgrade() -> None:
    """Remove subscription_status column and FK constraints."""
    op.drop_column('users', 'subscription_status')
    try:
        op.drop_constraint('fk_leads_agency_id', 'leads', type_='foreignkey')
    except Exception:
        pass
    try:
        op.drop_constraint('fk_api_keys_user_id', 'api_keys', type_='foreignkey')
    except Exception:
        pass
