ALTER TABLE driver_profiles
    ADD COLUMN IF NOT EXISTS vehicle_make VARCHAR(100),
    ADD COLUMN IF NOT EXISTS vehicle_model VARCHAR(100),
    ADD COLUMN IF NOT EXISTS vehicle_year INTEGER CHECK (vehicle_year IS NULL OR vehicle_year >= 1900),
    ADD COLUMN IF NOT EXISTS vehicle_color VARCHAR(50),
    ADD COLUMN IF NOT EXISTS plate_number VARCHAR(50);

CREATE UNIQUE INDEX IF NOT EXISTS driver_profiles_plate_number_unique
    ON driver_profiles (plate_number)
    WHERE plate_number IS NOT NULL;
