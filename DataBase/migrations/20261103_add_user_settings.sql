CREATE TABLE IF NOT EXISTS user_settings (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) NOT NULL DEFAULT 'light'
        CHECK (theme IN ('light', 'dark', 'system', 'sepia', 'contrast')),
    font VARCHAR(20) NOT NULL DEFAULT 'vazirmatn'
        CHECK (font IN ('vazirmatn', 'tahoma', 'arial', 'system', 'serif')),
    language VARCHAR(5) NOT NULL DEFAULT 'fa'
        CHECK (language IN ('fa', 'en')),
    color VARCHAR(20) NOT NULL DEFAULT 'forest'
        CHECK (color IN ('forest', 'ocean', 'violet', 'sunset', 'monochrome')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
