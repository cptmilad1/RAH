create table password_verify_token(
    id serial primary key,
    user_id int not null,
    token text not null,
    expire_at timestamp not null,
    created_at timestamp default current_timestamp
);

create table verify_token(
    id serial primary key,
    user_id int not null,
    token text not null unique,
    expire_at timestamp not null,
    created_at timestamp default current_timestamp
);

CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

INSERT INTO roles (name, description)
VALUES
    ('user', 'Standard user'),
    ('admin', 'Administrator'),
    ('driver', 'Driver')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30) UNIQUE,
    password_hash TEXT NOT NULL,
    user_address Text,
    avatar_url TEXT,
    token_version smallint default 0,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'driver')),
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    is_verify BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at timestamp default current_timestamp,
    ip_address text,
    device text,
    last_used timestamp
);

CREATE TABLE password_reset_token (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expire_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE email_verify (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expire_at TIMESTAMPTZ NOT NULL,
    verify_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_id BIGINT REFERENCES refresh_tokens(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

CREATE TABLE addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100),
    province VARCHAR(100),
    city VARCHAR(100),
    district VARCHAR(100),
    address_line TEXT NOT NULL,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_locations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    accuracy_meters NUMERIC(8,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vehicle_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    max_passengers INTEGER CHECK (max_passengers > 0),
    max_parcel_weight NUMERIC(10,2)
);

CREATE TABLE driver_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100) UNIQUE,
    license_expiry DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','approved','suspended','rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vehicles (
    id BIGSERIAL PRIMARY KEY,
    driver_id BIGINT NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
    vehicle_type_id BIGINT NOT NULL REFERENCES vehicle_types(id) ON DELETE RESTRICT,
    make VARCHAR(100),
    model VARCHAR(100),
    model_year INTEGER CHECK (model_year IS NULL OR model_year >= 1900),
    color VARCHAR(50),
    plate_number VARCHAR(50) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE driver_documents (
    id BIGSERIAL PRIMARY KEY,
    driver_id BIGINT NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_number VARCHAR(100),
    file_url TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','approved','rejected','expired')),
    expire_at DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE driver_availability (
    id BIGSERIAL PRIMARY KEY,
    driver_id BIGINT NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    is_available BOOLEAN NOT NULL DEFAULT FALSE,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE parcel_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE parcels (
    id BIGSERIAL PRIMARY KEY,
    tracking_code VARCHAR(100) NOT NULL UNIQUE,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    receiver_id BIGINT REFERENCES users(id) ON DELETE RESTRICT,
    receiver_name VARCHAR(100),
    receiver_phone VARCHAR(30),
    pickup_address_id BIGINT NOT NULL REFERENCES addresses(id) ON DELETE RESTRICT,
    delivery_address_id BIGINT NOT NULL REFERENCES addresses(id) ON DELETE RESTRICT,
    parcel_type_id BIGINT REFERENCES parcel_types(id) ON DELETE SET NULL,
    description TEXT,
    weight_kg NUMERIC(10,2) CHECK (weight_kg IS NULL OR weight_kg > 0),
    status VARCHAR(30) NOT NULL DEFAULT 'created'
        CHECK (status IN ('created','assigned','picked_up','in_transit','delivered','cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE parcel_assignments (
    id BIGSERIAL PRIMARY KEY,
    parcel_id BIGINT NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
    driver_id BIGINT NOT NULL REFERENCES driver_profiles(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'assigned'
        CHECK (status IN ('assigned','accepted','rejected','completed','cancelled')),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE TABLE parcel_status_history (
    id BIGSERIAL PRIMARY KEY,
    parcel_id BIGINT NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    changed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE parcel_items (
    id BIGSERIAL PRIMARY KEY,
    parcel_id BIGINT NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    description TEXT
);

CREATE TABLE parcel_proofs (
    id BIGSERIAL PRIMARY KEY,
    parcel_id BIGINT NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
    proof_type VARCHAR(50) NOT NULL,
    file_url TEXT,
    receiver_name VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE parcel_cancellations (
    id BIGSERIAL PRIMARY KEY,
    parcel_id BIGINT NOT NULL UNIQUE REFERENCES parcels(id) ON DELETE CASCADE,
    cancelled_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE parcel_pricing (
    id BIGSERIAL PRIMARY KEY,
    parcel_id BIGINT NOT NULL UNIQUE REFERENCES parcels(id) ON DELETE CASCADE,
    base_price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (base_price >= 0),
    distance_price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (distance_price >= 0),
    weight_price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (weight_price >= 0),
    total_price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_price >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'AFN'
);

CREATE TABLE rides (
    id BIGSERIAL PRIMARY KEY,
    passenger_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    pickup_address_id BIGINT NOT NULL REFERENCES addresses(id) ON DELETE RESTRICT,
    destination_address_id BIGINT NOT NULL REFERENCES addresses(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'requested'
        CHECK (status IN ('requested','searching','accepted','arrived','started','completed','cancelled')),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

CREATE TABLE ride_stops (
    id BIGSERIAL PRIMARY KEY,
    ride_id BIGINT NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    stop_order INTEGER NOT NULL CHECK (stop_order > 0),
    address_id BIGINT REFERENCES addresses(id) ON DELETE RESTRICT,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    UNIQUE (ride_id, stop_order)
);

CREATE TABLE ride_assignments (
    id BIGSERIAL PRIMARY KEY,
    ride_id BIGINT NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    driver_id BIGINT NOT NULL REFERENCES driver_profiles(id) ON DELETE RESTRICT,
    status VARCHAR(30) NOT NULL DEFAULT 'offered'
        CHECK (status IN ('offered','accepted','rejected','cancelled','completed')),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMPTZ
);

CREATE TABLE ride_status_history (
    id BIGSERIAL PRIMARY KEY,
    ride_id BIGINT NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    changed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ride_cancellations (
    id BIGSERIAL PRIMARY KEY,
    ride_id BIGINT NOT NULL UNIQUE REFERENCES rides(id) ON DELETE CASCADE,
    cancelled_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ride_pricing (
    id BIGSERIAL PRIMARY KEY,
    ride_id BIGINT NOT NULL UNIQUE REFERENCES rides(id) ON DELETE CASCADE,
    base_price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (base_price >= 0),
    distance_price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (distance_price >= 0),
    duration_price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (duration_price >= 0),
    total_price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_price >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'AFN'
);

CREATE TABLE ride_tracking (
    id BIGSERIAL PRIMARY KEY,
    ride_id BIGINT NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    driver_id BIGINT REFERENCES driver_profiles(id) ON DELETE SET NULL,
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    speed NUMERIC(8,2),
    heading NUMERIC(6,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ratings (
    id BIGSERIAL PRIMARY KEY,
    ride_id BIGINT REFERENCES rides(id) ON DELETE CASCADE,
    parcel_id BIGINT REFERENCES parcels(id) ON DELETE CASCADE,
    from_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    to_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (ride_id IS NOT NULL OR parcel_id IS NOT NULL)
);

CREATE TABLE rating_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE rating_details (
    id BIGSERIAL PRIMARY KEY,
    rating_id BIGINT NOT NULL REFERENCES ratings(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES rating_categories(id) ON DELETE RESTRICT,
    score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
    UNIQUE (rating_id, category_id)
);

CREATE TABLE user_reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    rating_id BIGINT REFERENCES ratings(id) ON DELETE SET NULL,
    review TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50),
    data JSONB,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notification_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sms_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    ride_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    parcel_notifications BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE device_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    platform VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(30) NOT NULL DEFAULT 'direct',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE conversation_participants (
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

CREATE TABLE message_attachments (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE support_tickets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    subject VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    priority VARCHAR(30) NOT NULL DEFAULT 'normal'
        CHECK (priority IN ('low','normal','high','urgent')),
    status VARCHAR(30) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open','pending','resolved','closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE support_messages (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE support_attachments (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    uploaded_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reported_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    ride_id BIGINT REFERENCES rides(id) ON DELETE SET NULL,
    parcel_id BIGINT REFERENCES parcels(id) ON DELETE SET NULL,
    reason VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','reviewing','resolved','rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE report_evidence (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL REFERENCES user_reports(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE app_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE system_logs (
    id BIGSERIAL PRIMARY KEY,
    level VARCHAR(20) NOT NULL DEFAULT 'info'
        CHECK (level IN ('debug','info','warn','error')),
    service VARCHAR(100),
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE service_areas (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    province VARCHAR(100),
    city VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE service_area_pricing (
    id BIGSERIAL PRIMARY KEY,
    service_area_id BIGINT NOT NULL REFERENCES service_areas(id) ON DELETE CASCADE,
    service_type VARCHAR(30) NOT NULL
        CHECK (service_type IN ('taxi','parcel')),
    base_price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (base_price >= 0),
    price_per_km NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (price_per_km >= 0),
    price_per_kg NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (price_per_kg >= 0),
    UNIQUE (service_area_id, service_type)
);

-- Useful indexes
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_password_resets_user_id ON password_reset_token(user_id);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_parcels_sender_id ON parcels(sender_id);
CREATE INDEX idx_parcels_receiver_id ON parcels(receiver_id);
CREATE INDEX idx_parcels_status ON parcels(status);
CREATE INDEX idx_parcel_assignments_driver_id ON parcel_assignments(driver_id);
CREATE INDEX idx_rides_passenger_id ON rides(passenger_id);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_ride_assignments_driver_id ON ride_assignments(driver_id);
CREATE INDEX idx_ride_tracking_ride_id ON ride_tracking(ride_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);