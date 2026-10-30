const db = require('../../../DataBase/base/dbBase')
const { createHttpError } = require('../services/parcelValidation')

async function appendHistory(client, parcelId, status, userId, note) {
  await client.query(
    `INSERT INTO parcel_status_history (parcel_id, status, changed_by, note)
     VALUES ($1, $2, $3, $4)`,
    [parcelId, status, userId, note],
  )
}

async function notifyParticipants(client, parcel, actorId, title, body, type) {
  await client.query(
    `INSERT INTO notifications (user_id, title, body, type, data)
     SELECT DISTINCT users.id, $2, $3, $4,
            jsonb_build_object('trackingCode', $5::text, 'status', $6::text)
     FROM users
     WHERE (
       users.id = ANY($1::bigint[])
       OR users.phone = $8
     ) AND users.id <> $7`,
    [
      [parcel.senderId, parcel.receiverId, parcel.driverId].filter(Boolean),
      title,
      body,
      type,
      parcel.trackingCode,
      parcel.status,
      actorId,
      parcel.receiverPhone,
    ],
  )
}

async function transitionParcel(userId, trackingCode, operation, nextStatus, note) {
  const client = await db.connect()
  let transactionStarted = false
  try {
    await client.query('BEGIN')
    transactionStarted = true
    const result = await client.query(
      `SELECT p.id, p.tracking_code AS "trackingCode", p.sender_id AS "senderId",
              p.receiver_id AS "receiverId", p.receiver_phone AS "receiverPhone", p.status,
              (
                SELECT dp.user_id
                FROM parcel_assignments pa
                JOIN driver_profiles dp ON dp.id = pa.driver_id
                WHERE pa.parcel_id = p.id AND pa.status = 'accepted'
                ORDER BY pa.accepted_at DESC NULLS LAST
                LIMIT 1
              ) AS "driverId"
       FROM parcels p
       WHERE p.tracking_code = $1
       FOR UPDATE`,
      [trackingCode],
    )
    if (!result.rowCount) throw createHttpError(404, 'مرسوله پیدا نشد.')
    const parcel = result.rows[0]

    if (operation === 'confirm-handoff') {
      if (String(parcel.senderId) !== String(userId)) {
        throw createHttpError(403, 'فقط فرستنده می‌تواند تحویل مرسوله به راننده را تأیید کند.')
      }
      if (parcel.status !== 'assigned') {
        throw createHttpError(409, 'مرسوله در وضعیت انتظار تأیید تحویل به راننده نیست.')
      }
    } else if (operation === 'driver-status') {
      const assignment = await client.query(
        `SELECT 1
         FROM parcel_assignments pa
         JOIN driver_profiles dp ON dp.id = pa.driver_id
         WHERE pa.parcel_id = $1 AND dp.user_id = $2 AND pa.status = 'accepted'
         FOR UPDATE OF pa`,
        [parcel.id, userId],
      )
      if (!assignment.rowCount) throw createHttpError(403, 'فقط رانندهٔ این مرسوله می‌تواند وضعیت آن را تغییر دهد.')
      const expectedStatus = nextStatus === 'in_transit' ? 'picked_up' : 'in_transit'
      if (parcel.status !== expectedStatus) {
        throw createHttpError(409, 'این تغییر وضعیت در مرحلهٔ فعلی مرسوله امکان‌پذیر نیست.')
      }
    } else {
      const user = await client.query('SELECT phone FROM users WHERE id = $1', [userId])
      const isParticipant =
        String(parcel.senderId) === String(userId) ||
        String(parcel.receiverId || '') === String(userId) ||
        (parcel.receiverPhone && parcel.receiverPhone === user.rows[0]?.phone)
      if (!isParticipant) throw createHttpError(403, 'شما اجازهٔ تأیید دریافت این مرسوله را ندارید.')
      if (parcel.status !== 'delivery_pending_confirmation') {
        throw createHttpError(409, 'مرسوله هنوز برای تأیید نهایی آماده نیست.')
      }
    }

    await client.query(
      'UPDATE parcels SET status = $2, updated_at = NOW() WHERE id = $1',
      [parcel.id, nextStatus],
    )
    if (nextStatus === 'delivered') {
      await client.query(
        `UPDATE parcel_assignments
         SET status = 'completed', completed_at = NOW()
         WHERE parcel_id = $1 AND status = 'accepted'`,
        [parcel.id],
      )
    }
    await appendHistory(client, parcel.id, nextStatus, userId, note)
    parcel.status = nextStatus
    const statusMessages = {
      picked_up: ['تحویل مرسوله تأیید شد', 'فرستنده تحویل مرسوله به راننده را تأیید کرد.'],
      in_transit: ['مرسوله در مسیر است', 'راننده وضعیت مرسوله را به «در مسیر» تغییر داد.'],
      delivery_pending_confirmation: ['تأیید دریافت مرسوله', 'راننده تحویل مرسوله را ثبت کرد؛ لطفاً دریافت را تأیید کنید.'],
      delivered: ['تحویل نهایی تأیید شد', 'دریافت مرسوله توسط کاربر تأیید شد.'],
    }
    const [title, body] = statusMessages[nextStatus]
    await notifyParticipants(client, parcel, userId, title, body, 'parcel_status')

    await client.query('COMMIT')
    transactionStarted = false
    return { id: parcel.id, trackingCode, status: nextStatus }
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function confirmHandoff(userId, trackingCode) {
  return transitionParcel(userId, trackingCode, 'confirm-handoff', 'picked_up', 'فرستنده تحویل مرسوله به راننده را تأیید کرد.')
}

async function updateDriverParcelStatus(userId, trackingCode, status) {
  const notes = {
    in_transit: 'راننده مرسوله را در مسیر ثبت کرد.',
    delivery_pending_confirmation: 'راننده تحویل مرسوله را ثبت کرد و منتظر تأیید کاربر است.',
  }
  return transitionParcel(userId, trackingCode, 'driver-status', status, notes[status])
}

async function confirmDelivery(userId, trackingCode) {
  return transitionParcel(userId, trackingCode, 'confirm-delivery', 'delivered', 'کاربر دریافت نهایی مرسوله را تأیید کرد.')
}

module.exports = { confirmHandoff, updateDriverParcelStatus, confirmDelivery }
