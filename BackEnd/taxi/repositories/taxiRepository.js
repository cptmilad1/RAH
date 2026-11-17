const db = require('../../../DataBase/base/dbBase')

const rideDetailsSql = `
  SELECT r.id, r.passenger_id AS "passengerId", r.taxi_type AS "taxiType",
         r.taxi_note AS note, r.status, r.requested_at AS "requestedAt",
         r.accepted_at AS "acceptedAt", r.started_at AS "startedAt",
         r.completed_at AS "completedAt", r.cancelled_at AS "cancelledAt",
         pickup.address_line AS "pickupAddress",
         destination.address_line AS "destinationAddress",
         pricing.total_price AS fare,
         passenger.full_name AS "passengerName",
         rating.id AS "ratingId", rating.score AS "ratingScore",
         driver.id AS "driverUserId", driver.full_name AS "driverName",
         COALESCE(vehicle.make, driver_profile.vehicle_make) AS "vehicleMake",
         COALESCE(vehicle.model, driver_profile.vehicle_model) AS "vehicleModel",
         COALESCE(vehicle.model_year, driver_profile.vehicle_year) AS "vehicleYear",
         COALESCE(vehicle.color, driver_profile.vehicle_color) AS "vehicleColor",
         COALESCE(vehicle.plate_number, driver_profile.plate_number) AS "plateNumber",
         vehicle.vehicle_type AS "vehicleType"
  FROM rides r
  JOIN addresses pickup ON pickup.id = r.pickup_address_id
  JOIN addresses destination ON destination.id = r.destination_address_id
  JOIN users passenger ON passenger.id = r.passenger_id
  LEFT JOIN ride_pricing pricing ON pricing.ride_id = r.id
  LEFT JOIN ratings rating ON rating.ride_id = r.id AND rating.from_user_id = r.passenger_id
  LEFT JOIN LATERAL (
    SELECT driver_id FROM ride_assignments
    WHERE ride_id = r.id AND status <> 'rejected'
    ORDER BY id DESC LIMIT 1
  ) assignment ON TRUE
  LEFT JOIN driver_profiles driver_profile ON driver_profile.id = assignment.driver_id
  LEFT JOIN users driver ON driver.id = driver_profile.user_id
  LEFT JOIN LATERAL (
    SELECT v.make, v.model, v.model_year, v.color, v.plate_number, type.name AS vehicle_type
    FROM vehicles v
    LEFT JOIN vehicle_types type ON type.id = v.vehicle_type_id
    WHERE v.driver_id = driver_profile.id AND v.is_active = TRUE
    ORDER BY v.created_at DESC, v.id DESC
    LIMIT 1
  ) vehicle ON TRUE`

async function getVipFare() {
  const result = await db.query(
    `SELECT setting_value AS fare FROM app_settings WHERE setting_key = 'taxi.vip_fare'`,
  )
  return Number(result.rows[0]?.fare || 0)
}

async function setVipFare(fare) {
  const result = await db.query(
    `INSERT INTO app_settings (setting_key, setting_value, description)
     VALUES ('taxi.vip_fare', $1, 'Fixed VIP Taxi fare in AFN')
     ON CONFLICT (setting_key) DO UPDATE
       SET setting_value = EXCLUDED.setting_value, updated_at = NOW()
     RETURNING setting_value AS fare`,
    [String(fare)],
  )
  return Number(result.rows[0].fare)
}

async function createRide(passengerId, data, fare) {
  const client = await db.connect()
  let transactionStarted = false
  try {
    await client.query('BEGIN')
    transactionStarted = true
    const pickup = await client.query(
      `INSERT INTO addresses (user_id, title, address_line)
       VALUES ($1, 'Taxi pickup', $2) RETURNING id`,
      [passengerId, data.pickupAddress],
    )
    const destination = await client.query(
      `INSERT INTO addresses (user_id, title, address_line)
       VALUES ($1, 'Taxi destination', $2) RETURNING id`,
      [passengerId, data.destinationAddress],
    )
    const ride = await client.query(
      `INSERT INTO rides (passenger_id, pickup_address_id, destination_address_id, status, taxi_type, taxi_note)
       VALUES ($1, $2, $3, 'requested', $4, NULLIF($5, ''))
       RETURNING id`,
      [passengerId, pickup.rows[0].id, destination.rows[0].id, data.taxiType, data.note],
    )
    await client.query(
      `INSERT INTO ride_pricing (ride_id, total_price, currency) VALUES ($1, $2, 'AFN')`,
      [ride.rows[0].id, fare],
    )
    await client.query(
      `INSERT INTO ride_status_history (ride_id, status, changed_by, note)
       VALUES ($1, 'requested', $2, 'Taxi request created')`,
      [ride.rows[0].id, passengerId],
    )
    await client.query('COMMIT')
    transactionStarted = false
    return getRideById(ride.rows[0].id)
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function getRideById(rideId) {
  const result = await db.query(`${rideDetailsSql} WHERE r.id = $1 AND r.taxi_type IS NOT NULL`, [rideId])
  return result.rows[0] || null
}

async function listAvailableRides(driverUserId) {
  const result = await db.query(
    `${rideDetailsSql}
     WHERE r.taxi_type IS NOT NULL AND r.status = 'requested'
       AND EXISTS (
         SELECT 1 FROM users u
         JOIN driver_profiles dp ON dp.user_id = u.id
         JOIN LATERAL (
           SELECT is_online, is_available FROM driver_availability
           WHERE driver_id = dp.id ORDER BY updated_at DESC, id DESC LIMIT 1
         ) availability ON TRUE
         WHERE u.id = $1 AND u.role = 'driver' AND u.is_active = TRUE AND dp.status = 'approved'
           AND availability.is_online = TRUE AND availability.is_available = TRUE
       )
       AND NOT EXISTS (
         SELECT 1 FROM ride_assignments a
         JOIN driver_profiles dp ON dp.id = a.driver_id
         WHERE a.ride_id = r.id AND dp.user_id = $1 AND a.status = 'rejected'
       )
     ORDER BY r.requested_at ASC`,
    [driverUserId],
  )
  return result.rows
}

async function listRidesForUser(userId, role) {
  const predicate = role === 'admin'
    ? 'r.taxi_type IS NOT NULL'
    : role === 'driver'
      ? `r.taxi_type IS NOT NULL AND EXISTS (
           SELECT 1 FROM ride_assignments a
           JOIN driver_profiles dp ON dp.id = a.driver_id
           WHERE a.ride_id = r.id AND dp.user_id = $1 AND a.status <> 'rejected'
         )`
      : 'r.taxi_type IS NOT NULL AND r.passenger_id = $1'
  const result = await db.query(
    `${rideDetailsSql} WHERE ${predicate} ORDER BY r.requested_at DESC`,
    role === 'admin' ? [] : [userId],
  )
  return result.rows
}

async function listAdminDrivers() {
  const result = await db.query(
    `SELECT u.id AS "userId", u.full_name AS name, u.email,
            dp.status AS "driverStatus", availability.is_online AS "isOnline",
            availability.is_available AS "isAvailable",
            COALESCE(vehicle.make, dp.vehicle_make) AS "vehicleMake",
            COALESCE(vehicle.model, dp.vehicle_model) AS "vehicleModel",
            COALESCE(vehicle.model_year, dp.vehicle_year) AS "vehicleYear",
            COALESCE(vehicle.color, dp.vehicle_color) AS "vehicleColor",
            COALESCE(vehicle.plate_number, dp.plate_number) AS "plateNumber",
            COUNT(DISTINCT r.id)::int AS "taxiTrips"
     FROM users u
     JOIN driver_profiles dp ON dp.user_id = u.id
     LEFT JOIN LATERAL (
       SELECT is_online, is_available FROM driver_availability
       WHERE driver_id = dp.id ORDER BY updated_at DESC, id DESC LIMIT 1
     ) availability ON TRUE
     LEFT JOIN ride_assignments assignment ON assignment.driver_id = dp.id
       AND assignment.status IN ('accepted', 'completed', 'cancelled')
     LEFT JOIN rides r ON r.id = assignment.ride_id AND r.taxi_type IS NOT NULL
     LEFT JOIN LATERAL (
       SELECT v.make, v.model, v.model_year, v.color, v.plate_number
       FROM vehicles v WHERE v.driver_id = dp.id AND v.is_active = TRUE
       ORDER BY v.created_at DESC, v.id DESC LIMIT 1
     ) vehicle ON TRUE
     WHERE u.role = 'driver'
     GROUP BY u.id, dp.id, availability.is_online, availability.is_available,
              vehicle.make, vehicle.model, vehicle.model_year, vehicle.color, vehicle.plate_number
     ORDER BY u.full_name`,
  )
  return result.rows
}

async function findEligibleDriver(client, userId) {
  const result = await client.query(
    `SELECT dp.id FROM users u
     JOIN driver_profiles dp ON dp.user_id = u.id
     WHERE u.id = $1 AND u.role = 'driver' AND u.is_active = TRUE AND dp.status = 'approved'`,
    [userId],
  )
  return result.rows[0]?.id || null
}

async function findAvailableDriver(client, userId) {
  const result = await client.query(
    `SELECT dp.id, availability.id AS "availabilityId"
     FROM users u
     JOIN driver_profiles dp ON dp.user_id = u.id
     JOIN LATERAL (
       SELECT id, is_online, is_available FROM driver_availability
       WHERE driver_id = dp.id ORDER BY updated_at DESC, id DESC LIMIT 1 FOR UPDATE
     ) availability ON TRUE
     WHERE u.id = $1 AND u.role = 'driver' AND u.is_active = TRUE
       AND dp.status = 'approved' AND availability.is_online = TRUE
       AND availability.is_available = TRUE
     FOR UPDATE OF dp`,
    [userId],
  )
  return result.rows[0] || null
}

async function getDriverAvailability(userId) {
  const result = await db.query(
    `SELECT availability.is_online AS "isOnline",
            availability.is_available AS "isAvailable"
     FROM users u JOIN driver_profiles dp ON dp.user_id = u.id
     LEFT JOIN LATERAL (
       SELECT is_online, is_available FROM driver_availability
       WHERE driver_id = dp.id ORDER BY updated_at DESC, id DESC LIMIT 1
     ) availability ON TRUE
     WHERE u.id = $1 AND u.role = 'driver'`,
    [userId],
  )
  return result.rows[0] || { isOnline: false, isAvailable: false }
}

async function setDriverAvailability(userId, isOnline, isAvailable) {
  const client = await db.connect()
  let transactionStarted = false
  try {
    await client.query('BEGIN')
    transactionStarted = true
    const driver = await client.query(
      `SELECT dp.id FROM users u JOIN driver_profiles dp ON dp.user_id = u.id
       WHERE u.id = $1 AND u.role = 'driver' AND u.is_active = TRUE AND dp.status = 'approved'
       FOR UPDATE OF dp`,
      [userId],
    )
    if (!driver.rowCount) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return { error: 'driver_ineligible' }
    }
    const activeTrip = await client.query(
      `SELECT 1 FROM ride_assignments a JOIN rides r ON r.id = a.ride_id
       WHERE a.driver_id = $1 AND a.status = 'accepted' AND r.status NOT IN ('completed', 'cancelled')
       LIMIT 1`,
      [driver.rows[0].id],
    )
    if (activeTrip.rowCount && isAvailable) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return { error: 'busy' }
    }
    const current = await client.query(
      `SELECT id FROM driver_availability WHERE driver_id = $1
       ORDER BY updated_at DESC, id DESC LIMIT 1 FOR UPDATE`,
      [driver.rows[0].id],
    )
    const online = Boolean(isOnline)
    const available = online && Boolean(isAvailable) && !activeTrip.rowCount
    if (current.rowCount) {
      await client.query(
        `UPDATE driver_availability SET is_online = $1, is_available = $2, updated_at = NOW() WHERE id = $3`,
        [online, available, current.rows[0].id],
      )
    } else {
      await client.query(
        `INSERT INTO driver_availability (driver_id, is_online, is_available, updated_at)
         VALUES ($1, $2, $3, NOW())`,
        [driver.rows[0].id, online, available],
      )
    }
    await client.query('COMMIT')
    transactionStarted = false
    return { isOnline: online, isAvailable: available }
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function acceptRide(rideId, userId) {
  const client = await db.connect()
  let transactionStarted = false
  try {
    await client.query('BEGIN')
    transactionStarted = true
    const ride = await client.query('SELECT id, status FROM rides WHERE id = $1 AND taxi_type IS NOT NULL FOR UPDATE', [rideId])
    if (!ride.rowCount) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return { error: 'not_found' }
    }
    if (ride.rows[0].status !== 'requested') {
      await client.query('ROLLBACK')
      transactionStarted = false
      return { error: 'unavailable' }
    }
    const driver = await findAvailableDriver(client, userId)
    if (!driver) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return { error: 'driver_ineligible' }
    }
    const existingAssignment = await client.query(
      `UPDATE ride_assignments SET status = 'accepted', accepted_at = NOW()
       WHERE ride_id = $1 AND driver_id = $2`,
      [rideId, driver.id],
    )
    if (!existingAssignment.rowCount) {
      await client.query(
        `INSERT INTO ride_assignments (ride_id, driver_id, status, accepted_at)
         VALUES ($1, $2, 'accepted', NOW())`,
        [rideId, driver.id],
      )
    }
    await client.query(
      `UPDATE driver_availability SET is_available = FALSE, updated_at = NOW() WHERE id = $1`,
      [driver.availabilityId],
    )
    await client.query(`UPDATE rides SET status = 'accepted', accepted_at = NOW() WHERE id = $1`, [rideId])
    await client.query(
      `INSERT INTO ride_status_history (ride_id, status, changed_by, note)
       VALUES ($1, 'accepted', $2, 'Taxi request accepted')`,
      [rideId, userId],
    )
    await client.query('COMMIT')
    transactionStarted = false
    return { ride: await getRideById(rideId) }
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function rejectRide(rideId, userId) {
  const client = await db.connect()
  let transactionStarted = false
  try {
    await client.query('BEGIN')
    transactionStarted = true
    const ride = await client.query('SELECT id, status FROM rides WHERE id = $1 AND taxi_type IS NOT NULL FOR UPDATE', [rideId])
    if (!ride.rowCount) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return { error: 'not_found' }
    }
    if (ride.rows[0].status !== 'requested') {
      await client.query('ROLLBACK')
      transactionStarted = false
      return { error: 'unavailable' }
    }
    const driverId = await findEligibleDriver(client, userId)
    if (!driverId) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return { error: 'driver_ineligible' }
    }
    const existingAssignment = await client.query(
      `UPDATE ride_assignments SET status = 'rejected'
       WHERE ride_id = $1 AND driver_id = $2`,
      [rideId, driverId],
    )
    if (!existingAssignment.rowCount) {
      await client.query(
        `INSERT INTO ride_assignments (ride_id, driver_id, status)
         VALUES ($1, $2, 'rejected')`,
        [rideId, driverId],
      )
    }
    await client.query('COMMIT')
    transactionStarted = false
    return { success: true }
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function updateRideStatus(rideId, userId, status, transitions) {
  const client = await db.connect()
  let transactionStarted = false
  try {
    await client.query('BEGIN')
    transactionStarted = true
    const ride = await client.query('SELECT id, status FROM rides WHERE id = $1 AND taxi_type IS NOT NULL FOR UPDATE', [rideId])
    if (!ride.rowCount) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return { error: 'not_found' }
    }
    const driver = await findEligibleDriver(client, userId)
    if (!driver) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return { error: 'driver_ineligible' }
    }
    const assignment = await client.query(
      `SELECT 1 FROM ride_assignments WHERE ride_id = $1 AND driver_id = $2 AND status = 'accepted'`,
      [rideId, driver],
    )
    if (!assignment.rowCount) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return { error: 'forbidden' }
    }
    if (!transitions[ride.rows[0].status]?.includes(status)) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return { error: 'transition' }
    }
    await client.query(
      `UPDATE rides SET status = $1,
         started_at = CASE WHEN $1 = 'started' THEN NOW() ELSE started_at END,
         completed_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE completed_at END
       WHERE id = $2`,
      [status, rideId],
    )
    if (status === 'completed') {
      await client.query(`UPDATE ride_assignments SET status = 'completed' WHERE ride_id = $1 AND driver_id = $2`, [rideId, driver])
      await client.query(
        `UPDATE driver_availability SET is_available = is_online, updated_at = NOW()
         WHERE id = (SELECT id FROM driver_availability WHERE driver_id = $1
                    ORDER BY updated_at DESC, id DESC LIMIT 1)`,
        [driver],
      )
    }
    await client.query(
      `INSERT INTO ride_status_history (ride_id, status, changed_by) VALUES ($1, $2, $3)`,
      [rideId, status, userId],
    )
    await client.query('COMMIT')
    transactionStarted = false
    return { ride: await getRideById(rideId) }
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function cancelRide(rideId, userId, role, reason) {
  const client = await db.connect()
  let transactionStarted = false
  try {
    await client.query('BEGIN')
    transactionStarted = true
    const ride = await client.query(
      `SELECT id, status, passenger_id FROM rides WHERE id = $1 AND taxi_type IS NOT NULL FOR UPDATE`,
      [rideId],
    )
    if (!ride.rowCount) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return { error: 'not_found' }
    }
    const current = ride.rows[0]
    if (['completed', 'cancelled'].includes(current.status)) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return { error: 'terminal' }
    }
    if (role === 'user' && String(current.passenger_id) !== String(userId)) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return { error: 'forbidden' }
    }
    if (role === 'driver') {
      const driver = await findEligibleDriver(client, userId)
      const assigned = driver && await client.query(
        `SELECT 1 FROM ride_assignments WHERE ride_id = $1 AND driver_id = $2 AND status = 'accepted'`,
        [rideId, driver],
      )
      if (!assigned?.rowCount || current.status === 'started') {
        await client.query('ROLLBACK')
        transactionStarted = false
        return { error: 'forbidden' }
      }
    }
    if (role === 'user' && current.status === 'started') {
      await client.query('ROLLBACK')
      transactionStarted = false
      return { error: 'forbidden' }
    }
    await client.query(`UPDATE rides SET status = 'cancelled', cancelled_at = NOW() WHERE id = $1`, [rideId])
    await client.query(
      `INSERT INTO ride_cancellations (ride_id, cancelled_by, reason)
       VALUES ($1, $2, $3)`,
      [rideId, userId, reason || 'Cancelled'],
    )
    await client.query(`UPDATE ride_assignments SET status = 'cancelled' WHERE ride_id = $1 AND status = 'accepted'`, [rideId])
    await client.query(
      `UPDATE driver_availability SET is_available = is_online, updated_at = NOW()
       WHERE id = (
         SELECT availability.id FROM driver_availability availability
         JOIN ride_assignments assignment ON assignment.driver_id = availability.driver_id
         WHERE assignment.ride_id = $1 AND assignment.status = 'cancelled'
         ORDER BY availability.updated_at DESC, availability.id DESC LIMIT 1
       )`,
      [rideId],
    )
    await client.query(
      `INSERT INTO ride_status_history (ride_id, status, changed_by, note)
       VALUES ($1, 'cancelled', $2, $3)`,
      [rideId, userId, reason || null],
    )
    await client.query('COMMIT')
    transactionStarted = false
    return { ride: await getRideById(rideId) }
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function rateRide(rideId, passengerId, score, comment) {
  const result = await db.query(
    `INSERT INTO ratings (ride_id, from_user_id, to_user_id, score, comment)
     SELECT r.id, r.passenger_id, dp.user_id, $3, NULLIF($4, '')
     FROM rides r
     JOIN ride_assignments a ON a.ride_id = r.id AND a.status = 'completed'
     JOIN driver_profiles dp ON dp.id = a.driver_id
     WHERE r.id = $1 AND r.taxi_type IS NOT NULL AND r.passenger_id = $2 AND r.status = 'completed'
     RETURNING id, ride_id AS "rideId", score, comment`,
    [rideId, passengerId, score, comment],
  )
  return result.rows[0] || null
}

module.exports = {
  acceptRide,
  cancelRide,
  createRide,
  getRideById,
  getDriverAvailability,
  getVipFare,
  listAdminDrivers,
  listAvailableRides,
  listRidesForUser,
  rateRide,
  rejectRide,
  setVipFare,
  setDriverAvailability,
  updateRideStatus,
}