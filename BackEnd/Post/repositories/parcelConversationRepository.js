const db = require('../../../DataBase/base/dbBase')

async function findChatAccess(userId, trackingCode) {
  const result = await db.query(
    `SELECT p.id, p.tracking_code AS "trackingCode"
     FROM parcels p
     WHERE p.tracking_code = $2
       AND EXISTS (
           SELECT 1
           FROM parcel_assignments pa
           WHERE pa.parcel_id = p.id AND pa.status IN ('accepted', 'completed')
         )
       AND (
         p.sender_id = $1
         OR p.receiver_id = $1
         OR p.receiver_phone = (SELECT phone FROM users WHERE id = $1)
         OR EXISTS (
           SELECT 1
           FROM parcel_assignments pa
           JOIN driver_profiles dp ON dp.id = pa.driver_id
           WHERE pa.parcel_id = p.id AND dp.user_id = $1 AND pa.status IN ('accepted', 'completed')
         )
       )`,
    [userId, trackingCode],
  )
  return result.rows[0] || null
}

async function listParcelMessages(parcelId) {
  const result = await db.query(
    `SELECT messages.id, messages.sender_id AS "senderId",
            sender.full_name AS "senderName", messages.message,
            messages.created_at AS "createdAt"
     FROM (
       SELECT id, sender_id, message, created_at
       FROM parcel_messages
       WHERE parcel_id = $1
       ORDER BY created_at DESC, id DESC
       LIMIT 100
     ) messages
     JOIN users sender ON sender.id = messages.sender_id
     ORDER BY messages.created_at, messages.id`,
    [parcelId],
  )
  return result.rows
}

async function createParcelMessage(parcelId, senderId, message) {
  const result = await db.query(
    `WITH inserted AS (
       INSERT INTO parcel_messages (parcel_id, sender_id, message)
       VALUES ($1, $2, $3)
       RETURNING id, sender_id, message, created_at
     )
     SELECT inserted.id, inserted.sender_id AS "senderId",
            sender.full_name AS "senderName", inserted.message,
            inserted.created_at AS "createdAt"
     FROM inserted
     JOIN users sender ON sender.id = inserted.sender_id`,
    [parcelId, senderId, message],
  )
  return result.rows[0]
}

module.exports = { findChatAccess, listParcelMessages, createParcelMessage }
