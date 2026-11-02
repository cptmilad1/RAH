-- Invalidate existing raw reset tokens before the application starts storing SHA-256 hashes.
DELETE FROM password_reset_token;

CREATE UNIQUE INDEX IF NOT EXISTS idx_password_reset_token_user_id
    ON password_reset_token(user_id);

COMMENT ON COLUMN password_reset_token.token IS
    'SHA-256 hash of the password reset bearer token; never store the raw token.';
