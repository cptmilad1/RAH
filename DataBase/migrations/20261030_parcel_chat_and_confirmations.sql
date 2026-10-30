ALTER TABLE parcels
    DROP CONSTRAINT IF EXISTS parcels_status_check;

ALTER TABLE parcels
    ADD CONSTRAINT parcels_status_check
    CHECK (status IN (
        'created',
        'assigned',
        'picked_up',
        'in_transit',
        'delivery_pending_confirmation',
        'delivered',
        'cancelled'
    ));

CREATE TABLE IF NOT EXISTS parcel_messages (
    id BIGSERIAL PRIMARY KEY,
    parcel_id BIGINT NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parcel_messages_parcel_created
    ON parcel_messages (parcel_id, created_at, id);
