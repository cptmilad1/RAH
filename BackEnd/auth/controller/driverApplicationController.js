const db = require('../../../DataBase/base/dbBase')

async function getDriverApplication(req, res, next) {
  try {
    const result = await db.query(
      `SELECT status, province, license_number AS "licenseNumber",
              license_expiry AS "licenseExpiry", vehicle_make AS "vehicleMake",
              vehicle_model AS "vehicleModel", vehicle_year AS "vehicleYear",
              vehicle_color AS "vehicleColor", plate_number AS "plateNumber"
       FROM driver_profiles
       WHERE user_id = $1`,
      [req.user.userId],
    )
    return res.json({ data: result.rows[0] || null })
  } catch (error) {
    return next(error)
  }
}

async function submitDriverApplication(req, res, next) {
  let client
  let transactionStarted = false
  try {
    if (req.user.role !== 'user') {
      return res.status(409).json({ message: 'درخواست رانندگی فقط برای کاربران عادی امکان‌پذیر است.' })
    }

    client = await db.connect()
    await client.query('BEGIN')
    transactionStarted = true
    const existing = await client.query(
      'SELECT id, status FROM driver_profiles WHERE user_id = $1 FOR UPDATE',
      [req.user.userId],
    )
    if (existing.rowCount && existing.rows[0].status !== 'rejected') {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(409).json({ message: 'برای این حساب درخواست رانندگی ثبت شده است.' })
    }

    const application = req.body
    if (existing.rowCount) {
      await client.query(
        `UPDATE driver_profiles
         SET province = $1, license_number = $2, license_expiry = $3,
             vehicle_make = $4, vehicle_model = $5, vehicle_year = $6,
             vehicle_color = $7, plate_number = $8, status = 'pending',
             created_at = NOW(), updated_at = NOW()
         WHERE user_id = $9`,
        [application.province, application.licenseNumber, application.licenseExpiry,
          application.vehicleMake, application.vehicleModel, application.vehicleYear,
          application.vehicleColor, application.plateNumber, req.user.userId],
      )
    } else {
      await client.query(
        `INSERT INTO driver_profiles (
           user_id, province, license_number, license_expiry, vehicle_make,
           vehicle_model, vehicle_year, vehicle_color, plate_number, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')`,
        [req.user.userId, application.province, application.licenseNumber,
          application.licenseExpiry, application.vehicleMake, application.vehicleModel,
          application.vehicleYear, application.vehicleColor, application.plateNumber],
      )
    }

    await client.query(
      `INSERT INTO notifications (user_id, title, body, type, data)
       SELECT id, 'درخواست رانندگی تازه',
              'یک کاربر درخواست عضویت به‌عنوان راننده ثبت کرده است.',
              'driver_application',
              jsonb_build_object('driverUserId', $1::bigint)
       FROM users WHERE role = 'admin'`,
      [req.user.userId],
    )
    await client.query('COMMIT')
    transactionStarted = false
    return res.status(201).json({ message: 'درخواست رانندگی برای بررسی به مدیر ارسال شد.', data: { status: 'pending' } })
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK')
    if (error.code === '23505') {
      return res.status(409).json({ message: 'شمارهٔ جواز یا نمبر پلیت قبلاً ثبت شده است.' })
    }
    return next(error)
  } finally {
    if (client) client.release()
  }
}

module.exports = { getDriverApplication, submitDriverApplication }
