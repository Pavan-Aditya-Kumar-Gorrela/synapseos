# alembic/versions/xxxx_document_intelligence_foundation.py

"""document intelligence foundation

Revision ID: d7_doc_intelligence
Revises: <your_previous_revision_id>
Create Date: 2025-01-01
"""
from alembic import op
import sqlalchemy as sa

revision = "d7_doc_intelligence"
down_revision = "001_initial"   # ← replace
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create the status enum first
    documentstatus = sa.Enum(
        "uploading", "processing", "ready", "failed",
        name="documentstatus"
    )
    documentstatus.create(op.get_bind(), checkfirst=True)

    op.add_column("documents", sa.Column("original_filename", sa.String(500), nullable=True))
    op.add_column("documents", sa.Column("file_size",         sa.Integer(),   nullable=True, server_default="0"))
    op.add_column("documents", sa.Column("extracted_text",    sa.Text(),      nullable=True))
    op.add_column("documents", sa.Column("updated_at",        sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True))

    # Migrate old string status → enum; backfill original_filename from filename
    op.execute("UPDATE documents SET original_filename = filename WHERE original_filename IS NULL")
    op.execute("""
        UPDATE documents SET status =
            CASE status
                WHEN 'pending'    THEN 'uploading'
                WHEN 'processing' THEN 'processing'
                WHEN 'ready'      THEN 'ready'
                WHEN 'failed'     THEN 'failed'
                ELSE 'uploading'
            END
    """)

    op.execute("ALTER TABLE documents ALTER COLUMN status DROP DEFAULT")
    # Swap column type to enum (PostgreSQL)
    op.execute("ALTER TABLE documents ALTER COLUMN status TYPE documentstatus USING status::documentstatus")
    op.execute("ALTER TABLE documents ALTER COLUMN status SET DEFAULT 'uploading'::documentstatus")

    # Make backfilled columns non-nullable
    op.alter_column("documents", "original_filename", nullable=False)
    op.alter_column("documents", "file_size",         nullable=False)
    op.alter_column("documents", "updated_at",        nullable=False)


def downgrade() -> None:
    op.execute("ALTER TABLE documents ALTER COLUMN status TYPE VARCHAR(50) USING status::text")
    op.drop_column("documents", "updated_at")
    op.drop_column("documents", "extracted_text")
    op.drop_column("documents", "file_size")
    op.drop_column("documents", "original_filename")
    sa.Enum(name="documentstatus").drop(op.get_bind(), checkfirst=True)