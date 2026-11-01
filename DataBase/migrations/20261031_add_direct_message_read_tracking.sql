ALTER TABLE direct_messages
    ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_direct_messages_unread
    ON direct_messages (conversation_id, sender_id)
    WHERE read_at IS NULL;
