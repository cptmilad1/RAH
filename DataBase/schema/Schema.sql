CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    user_address Text,
    avatar_url TEXT,
    is_verify boolean default false,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'driver')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

create table sender (
    id serial primary key,
    user_id bigint not null,
    foreign key (user_id) references users(id)
);
create table reciever (
    id serial primary key,
    user_id bigint not null,
    foreign key (user_id) references users(id)
);

CREATE TABLE drivers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    driver_code VARCHAR(30) UNIQUE,
    vehicle_model VARCHAR(60),
    plate_number VARCHAR(30),
    license_number VARCHAR(50),
    rating NUMERIC(3,2) DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'offline' CHECK (status IN ('offline', 'available', 'busy', 'on_trip')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_drivers_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE post_status (
    id SMALLSERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    description TEXT,
    location TEXT
);

CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    reciever_id BIGINT NOT NULL,
    driver_id BIGINT,
    title VARCHAR(150),
    content TEXT NOT NULL,
    image_url TEXT,
    shipment_weight int,
    price numeric(10,2),
    status_id SMALLINT NOT NULL DEFAULT 2,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    foreign key sender_id references sender(id),
    foreign key reciever_id references reciever(id),
    CONSTRAINT fk_posts_driver
        FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL,
    CONSTRAINT fk_posts_status
        FOREIGN KEY (status_id) REFERENCES post_status(id) ON DELETE RESTRICT
);


CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    parent_id BIGINT,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comments_post
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_parent
        FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);


CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    sender_id BIGINT,
    post_id BIGINT,
    type VARCHAR(30) NOT NULL,
    title VARCHAR(150),
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_sender
        FOREIGN KEY (sender_id) REFERENCES sender(id) ON DELETE SET NULL,
    CONSTRAINT fk_notifications_post
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL
);