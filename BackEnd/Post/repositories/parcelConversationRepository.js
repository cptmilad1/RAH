const db = require('../../../DataBase/base/dbBase')

async function findChatAccess(userId, trackingCode, role) {
  const result = await db.query(
    `SELECT p.id, p.tracking_code AS "trackingCode",
            ARRAY(
              SELECT participant.id
              FROM users participant
              WHERE participant.id = p.sender_id
                 OR participant.id = p.receiver_id
                 OR participant.phone = p.receiver_phone
                 OR participant.id = (
                   SELECT dp.user_id
                   FROM parcel_assignments pa
                   JOIN driver_profiles dp ON dp.id = pa.driver_id
                   WHERE pa.parcel_id = p.id AND pa.status IN ('accepted', 'completed')
                   ORDER BY pa.accepted_at DESC NULLS LAST
                   LIMIT 1
                 )
            ) AS "participantIds"
     FROM parcels p
     WHERE p.tracking_code = $2
       AND ($3 = 'admin' OR EXISTS (
           SELECT 1
           FROM parcel_assignments pa
           WHERE pa.parcel_id = p.id AND pa.status IN ('accepted', 'completed')
         ))
       AND ($3 = 'admin' OR (
         p.sender_id = $1
         OR p.receiver_id = $1
         OR p.receiver_phone = (SELECT phone FROM users WHERE id = $1)
         OR EXISTS (
           SELECT 1
           FROM parcel_assignments pa
           JOIN driver_profiles dp ON dp.id = pa.driver_id
           WHERE pa.parcel_id = p.id AND dp.user_id = $1 AND pa.status IN ('accepted', 'completed')
         )
       ))`,
    [userId, trackingCode, role],
  )
  return result.rows[0] || null
}

async function listParcelMessages(parcelId) {
  const result = await db.query(
    `SELECT messages.id, messages.sender_id AS "senderId",
            sender.full_name AS "senderName",
            COALESCE(sender.avatar_url, '/imgs/default-avatar.svg') AS "senderImage",
            messages.message,
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
            sender.full_name AS "senderName",
            COALESCE(sender.avatar_url, '/imgs/default-avatar.svg') AS "senderImage",
            inserted.message,
            inserted.created_at AS "createdAt"
     FROM inserted
     JOIN users sender ON sender.id = inserted.sender_id`,
    [parcelId, senderId, message],
  )
  return result.rows[0]
}

module.exports = { findChatAccess, listParcelMessages, createParcelMessage }
