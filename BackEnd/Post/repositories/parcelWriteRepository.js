const crypto = require('crypto')
const db = require('../../../DataBase/base/dbBase')
const { createHttpError } = require('../services/parcelValidation')

async function createParcel(userId, data) {
  const client = await db.connect()
  let transactionStarted = false
  try {
    await client.query('BEGIN')
    transactionStarted = true
    const pickupResult = await client.query(
      `INSERT INTO addresses (user_id, title, province, address_line)
       VALUES ($1, 'مبدأ مرسوله', $2, $3)
       RETURNING id`,
      [userId, data.pickupProvince, data.pickupAddress],
    )
    const deliveryResult = await client.query(
      `INSERT INTO addresses (user_id, title, province, address_line)
       VALUES ($1, 'مقصد مرسوله', $2, $3)
       RETURNING id`,
      [userId, data.deliveryProvince, data.deliveryAddress],
    )
    const parcelResult = await client.query(
      `INSERT INTO parcels (
         tracking_code, sender_id, receiver_id, receiver_name, receiver_phone,
         pickup_address_id, delivery_address_id, description, weight_kg
       )
       VALUES (
         $1, $2, (SELECT id FROM users WHERE phone = $3 LIMIT 1), $4, $3,
         $5, $6, $7, $8
       )
       RETURNING id, sender_id AS "senderId", tracking_code AS "trackingCode", status,
                 description, weight_kg AS "weightKg", created_at AS "createdAt"`,
      [
        `RAH-${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
        userId,
        data.receiverPhone,
        data.receiverName,
        pickupResult.rows[0].id,
        deliveryResult.rows[0].id,
        data.description,
        data.weightKg,
      ],
    )
    const parcel = parcelResult.rows[0]

    if (data.itemName) {
      await client.query(
        'INSERT INTO parcel_items (parcel_id, name, quantity, description) VALUES ($1, $2, $3, $4)',
        [parcel.id, data.itemName, data.quantity, data.description],
      )
    }
    await client.query(
      `INSERT INTO parcel_status_history (parcel_id, status, changed_by, note)
       VALUES ($1, 'created', $2, 'مرسوله ثبت شد.')`,
      [parcel.id, userId],
    )
    await client.query('COMMIT')
    transactionStarted = false

    return {
      ...parcel,
      receiverName: data.receiverName,
      receiverPhone: data.receiverPhone,
      pickupProvince: data.pickupProvince,
      pickupAddress: data.pickupAddress,
      deliveryProvince: data.deliveryProvince,
      deliveryAddress: data.deliveryAddress,
    }
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function cancelParcel(userId, role, trackingCode, reason) {
  const client = await db.connect()
  let transactionStarted = false
  try {
    await client.query('BEGIN')
    transactionStarted = true
    const parcelResult = await client.query(
      `SELECT id, status
       FROM parcels
       WHERE tracking_code = $1 AND ($2 = 'admin' OR sender_id = $3)
       FOR UPDATE`,
      [trackingCode, role, userId],
    )
    if (!parcelResult.rowCount) throw createHttpError(404, 'مرسوله پیدا نشد.')
    const parcel = parcelResult.rows[0]
    if (!['created', 'assigned'].includes(parcel.status)) {
      throw createHttpError(409, 'مرسوله پس از تحویل به راننده قابل لغو نیست.')
    }

    await client.query(`UPDATE parcels SET status = 'cancelled', updated_at = NOW() WHERE id = $1`, [parcel.id])
    await client.query(
      `INSERT INTO parcel_cancellations (parcel_id, cancelled_by, reason)
       VALUES ($1, $2, $3)`,
      [parcel.id, userId, reason],
    )
    await client.query(
      `INSERT INTO parcel_status_history (parcel_id, status, changed_by, note)
       VALUES ($1, 'cancelled', $2, $3)`,
      [parcel.id, userId, reason],
    )
    await client.query('COMMIT')
    transactionStarted = false
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

module.exports = { createParcel, cancelParcel }
