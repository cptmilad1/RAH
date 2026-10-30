ALTER TABLE driver_profiles
    ADD COLUMN IF NOT EXISTS province VARCHAR(100);

INSERT INTO driver_profiles (user_id, status)
SELECT id, 'approved'
FROM users
WHERE role = 'driver'
ON CONFLICT (user_id) DO NOTHING;