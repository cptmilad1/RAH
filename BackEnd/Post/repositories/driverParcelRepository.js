const db = require('../../../DataBase/base/dbBase')
const { createHttpError, normalizeProvince } = require('../services/parcelValidation')

async function findAvailableParcels(userId) {
  const driverResult = await db.query(
    `SELECT dp.province
     FROM driver_profiles dp
     JOIN users u ON u.id = dp.user_id AND u.role = 'driver'
     WHERE dp.user_id = $1 AND dp.status = 'approved'`,
    [userId],
  )
  if (!driverResult.rowCount) throw createHttpError(403, 'پروفایل رانندهٔ شما تأیید نشده است.')
  const driverProvince = driverResult.rows[0].province
  if (!driverProvince) throw createHttpError(409, 'ابتدا ولایت کاری خود را در پروفایل ثبت کنید.')

  const result = await db.query(
    `SELECT p.id, p.tracking_code AS "trackingCode", p.description,
            p.weight_kg AS "weightKg", p.created_at AS "createdAt",
            sender.full_name AS "senderName",
            pickup.province AS "pickupProvince",
            delivery.province AS "deliveryProvince"
     FROM parcels p
     JOIN users sender ON sender.id = p.sender_id
     JOIN addresses pickup ON pickup.id = p.pickup_address_id
     JOIN addresses delivery ON delivery.id = p.delivery_address_id
     WHERE p.status = 'created'
       AND LOWER(BTRIM(pickup.province)) = LOWER(BTRIM($1))
       AND NOT EXISTS (
         SELECT 1 FROM parcel_assignments pa
         WHERE pa.parcel_id = p.id AND pa.status IN ('assigned', 'accepted')
       )
     ORDER BY p.created_at DESC
     LIMIT 100`,
    [driverProvince],
  )

  return { driverProvince, parcels: result.rows }
}

async function acceptAvailableParcel(userId, trackingCode) {
  const client = await db.connect()
  let transactionStarted = false
  try {
    await client.query('BEGIN')
    transactionStarted = true

    const driverResult = await client.query(
      `SELECT dp.id, dp.province
       FROM driver_profiles dp
       JOIN users u ON u.id = dp.user_id AND u.role = 'driver'
       WHERE dp.user_id = $1 AND dp.status = 'approved'
       FOR UPDATE OF dp`,
      [userId],
    )
    if (!driverResult.rowCount) throw createHttpError(403, 'پروفایل رانندهٔ شما تأیید نشده است.')
    const driver = driverResult.rows[0]
    if (!driver.province) throw createHttpError(409, 'ابتدا ولایت کاری خود را در پروفایل ثبت کنید.')

    const parcelResult = await client.query(
      `SELECT p.id, p.status, pickup.province AS "pickupProvince"
       FROM parcels p
       JOIN addresses pickup ON pickup.id = p.pickup_address_id
       WHERE p.tracking_code = $1
       FOR UPDATE OF p`,
      [trackingCode],
    )
    if (!parcelResult.rowCount) throw createHttpError(404, 'مرسوله پیدا نشد.')
    const parcel = parcelResult.rows[0]
    if (parcel.status !== 'created') throw createHttpError(409, 'این مرسوله دیگر در دسترس نیست.')
    if (!parcel.pickupProvince || normalizeProvince(parcel.pickupProvince, 'ولایت مبدأ').toLocaleLowerCase() !== normalizeProvince(driver.province, 'ولایت راننده').toLocaleLowerCase()) {
      throw createHttpError(403, 'این مرسوله مربوط به ولایت کاری شما نیست.')
    }

    const existingAssignment = await client.query(
      `SELECT 1 FROM parcel_assignments
       WHERE parcel_id = $1 AND status IN ('assigned', 'accepted')
       LIMIT 1`,
      [parcel.id],
    )
    if (existingAssignment.rowCount) throw createHttpError(409, 'این مرسوله قبلاً به راننده‌ای واگذار شده است.')

    await client.query(
      `INSERT INTO parcel_assignments (parcel_id, driver_id, status, accepted_at)
       VALUES ($1, $2, 'accepted', NOW())`,
      [parcel.id, driver.id],
    )
    await client.query(
      `UPDATE parcels SET status = 'assigned', updated_at = NOW() WHERE id = $1`,
      [parcel.id],
    )
    await client.query(
      `INSERT INTO parcel_status_history (parcel_id, status, changed_by, note)
       VALUES ($1, 'assigned', $2, 'مرسوله توسط راننده پذیرفته شد.')`,
      [parcel.id, userId],
    )

    await client.query('COMMIT')
    transactionStarted = false
    return { trackingCode, status: 'assigned' }
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

module.exports = { findAvailableParcels, acceptAvailableParcel }