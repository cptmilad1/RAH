ALTER TABLE rides
    ADD COLUMN IF NOT EXISTS taxi_type VARCHAR(20),
    ADD COLUMN IF NOT EXISTS taxi_note TEXT;

ALTER TABLE rides
    DROP CONSTRAINT IF EXISTS rides_status_check;

ALTER TABLE rides
    ADD CONSTRAINT rides_status_check
    CHECK (status IN (
        'requested', 'searching', 'accepted', 'arrived', 'driver_arriving',
        'driver_arrived', 'started', 'completed', 'cancelled'
    ));

ALTER TABLE rides
    DROP CONSTRAINT IF EXISTS rides_taxi_type_check;

ALTER TABLE rides
    ADD CONSTRAINT rides_taxi_type_check
    CHECK (taxi_type IS NULL OR taxi_type IN ('standard', 'vip'));

CREATE INDEX IF NOT EXISTS idx_taxi_rides_passenger_requested
    ON rides (passenger_id, requested_at DESC)
    WHERE taxi_type IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_ride_assignments_one_accepted_driver
    ON ride_assignments (ride_id)
    WHERE status = 'accepted';

CREATE UNIQUE INDEX IF NOT EXISTS idx_ratings_one_per_ride
    ON ratings (ride_id)
    WHERE ride_id IS NOT NULL;

INSERT INTO app_settings (setting_key, setting_value, description)
VALUES ('taxi.vip_fare', '500', 'Fixed VIP Taxi fare in AFN')
ON CONFLICT (setting_key) DO NOTHING;