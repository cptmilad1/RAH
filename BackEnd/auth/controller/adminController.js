const db = require('../../../DataBase/base/dbBase')

async function listAdminUsers(req, res, next) {
  try {
    const result = await db.query(
      `SELECT u.id, u.full_name AS "fullName", u.username, u.email, u.role,
              u.phone, u.user_address AS address, u.created_at AS "createdAt",
              u.is_active AS "isActive", u.is_verify AS "isVerify",
              COALESCE(
                (SELECT a.city FROM addresses a WHERE a.user_id = u.id AND a.city IS NOT NULL ORDER BY a.created_at DESC LIMIT 1),
                u.user_address
              ) AS city,
              dp.status AS "driverStatus", dp.province AS "driverProvince",
              dp.created_at AS "driverAppliedAt",
              dp.license_number AS "licenseNumber", dp.license_expiry AS "licenseExpiry",
              dp.vehicle_make AS "vehicleMake", dp.vehicle_model AS "vehicleModel",
              dp.vehicle_year AS "vehicleYear", dp.vehicle_color AS "vehicleColor",
              dp.plate_number AS "plateNumber"
       FROM users u
       LEFT JOIN driver_profiles dp ON dp.user_id = u.id
       ORDER BY u.created_at DESC`,
    )
    return res.json({ data: result.rows })
  } catch (error) {
    return next(error)
  }
}

async function approveDriverApplication(req, res, next) {
  const userId = Number(req.params.userId)
  if (!Number.isSafeInteger(userId) || userId < 1) {
    return res.status(400).json({ message: 'شناسهٔ کاربر معتبر نیست.' })
  }

  let client
  let transactionStarted = false
  try {
    client = await db.connect()
    await client.query('BEGIN')
    transactionStarted = true
    const result = await client.query(
      `SELECT dp.status, u.id
       FROM driver_profiles dp
       JOIN users u ON u.id = dp.user_id
       WHERE u.id = $1
       FOR UPDATE OF dp, u`,
      [userId],
    )
    if (!result.rowCount) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(404).json({ message: 'درخواست رانندگی پیدا نشد.' })
    }
    if (result.rows[0].status !== 'pending') {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(409).json({ message: 'این درخواست در وضعیت انتظار تأیید نیست.' })
    }

    await client.query(
      `UPDATE users SET role = 'driver',
         role_id = (SELECT id FROM roles WHERE name = 'driver')
       WHERE id = $1`,
      [userId],
    )
    await client.query(
      `UPDATE driver_profiles SET status = 'approved', updated_at = NOW()
       WHERE user_id = $1`,
      [userId],
    )
    await client.query(
      `UPDATE notifications SET is_read = TRUE
       WHERE type = 'driver_application' AND data->>'driverUserId' = $1::text`,
      [String(userId)],
    )
    await client.query(
      `INSERT INTO notifications (user_id, title, body, type, data)
       VALUES ($1, 'درخواست رانندگی تأیید شد',
               'درخواست رانندگی شما تأیید شد و پنل راننده برای شما فعال است.',
               'driver_application_approved', jsonb_build_object('driverUserId', $1::bigint))`,
      [userId],
    )
    await client.query('COMMIT')
    transactionStarted = false
    return res.json({ message: 'درخواست رانندگی تأیید شد.' })
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK')
    return next(error)
  } finally {
    if (client) client.release()
  }
}

async function rejectDriverApplication(req, res, next) {
  const userId = Number(req.params.userId)
  if (!Number.isSafeInteger(userId) || userId < 1) {
    return res.status(400).json({ message: 'شناسهٔ کاربر معتبر نیست.' })
  }

  let client
  let transactionStarted = false
  try {
    client = await db.connect()
    await client.query('BEGIN')
    transactionStarted = true
    const result = await client.query(
      `SELECT dp.status FROM driver_profiles dp
       JOIN users u ON u.id = dp.user_id
       WHERE u.id = $1
       FOR UPDATE OF dp`,
      [userId],
    )
    if (!result.rowCount) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(404).json({ message: 'درخواست رانندگی پیدا نشد.' })
    }
    if (result.rows[0].status !== 'pending') {
      await client.query('ROLLBACK')
      transactionStarted = false
      return res.status(409).json({ message: 'این درخواست در وضعیت انتظار بررسی نیست.' })
    }

    await client.query(
      `UPDATE driver_profiles SET status = 'rejected', updated_at = NOW()
       WHERE user_id = $1`,
      [userId],
    )
    await client.query(
      `UPDATE notifications SET is_read = TRUE
       WHERE type = 'driver_application' AND data->>'driverUserId' = $1::text`,
      [String(userId)],
    )
    await client.query(
      `INSERT INTO notifications (user_id, title, body, type, data)
       VALUES ($1, 'درخواست رانندگی بررسی شد',
               'درخواست رانندگی شما تأیید نشد. می‌توانید مشخصات را اصلاح و دوباره ارسال کنید.',
               'driver_application_rejected', jsonb_build_object('driverUserId', $1::bigint))`,
      [userId],
    )
    await client.query('COMMIT')
    transactionStarted = false
    return res.json({ message: 'درخواست رانندگی رد شد.' })
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK')
    return next(error)
  } finally {
    if (client) client.release()
  }
}

async function updateAccountStatus(req, res, next) {
  const userId = Number(req.params.id)
  if (!Number.isSafeInteger(userId) || userId < 1) {
    return res.status(400).json({ message: 'شناسهٔ کاربر معتبر نیست.' })
  }
  if (String(req.user.userId) === String(userId)) {
    return res.status(400).json({ message: 'وضعیت حساب خودتان را نمی‌توانید تغییر دهید.' })
  }

  try {
    const result = await db.query(
      `UPDATE users SET is_active = $1, token_version = token_version + 1 WHERE id = $2
       RETURNING id, is_active AS "isActive"`,
      [req.body.isActive, userId],
    )
    if (!result.rowCount) return res.status(404).json({ message: 'کاربر پیدا نشد.' })
    if (!req.body.isActive) {
      await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId])
      req.app.get('io')?.in(`user:${userId}`).disconnectSockets(true)
    }
    return res.json({ message: 'وضعیت حساب به‌روز شد.', data: result.rows[0] })
  } catch (error) {
    return next(error)
  }
}

module.exports = { listAdminUsers, approveDriverApplication, rejectDriverApplication, updateAccountStatus }
