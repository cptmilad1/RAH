const db = require('../../../DataBase/base/dbBase')

async function findConversationsForUser(userId, role) {
  const result = await db.query(
    `SELECT parcel.id, parcel.tracking_code AS "trackingCode",
            incoming.message, incoming.created_at AS "createdAt",
            incoming.sender_id AS "senderId", message_sender.full_name AS "senderName",
            COALESCE(message_sender.avatar_url, '/imgs/default-avatar.svg') AS "senderImage"
     FROM parcels parcel
     JOIN LATERAL (
       SELECT message.id, message.sender_id, message.message, message.created_at
       FROM parcel_messages message
       WHERE message.parcel_id = parcel.id
         AND message.sender_id <> $1
       ORDER BY message.created_at DESC, message.id DESC
       LIMIT 1
     ) incoming ON TRUE
     JOIN users message_sender ON message_sender.id = incoming.sender_id
     WHERE $2 = 'admin'
        OR parcel.sender_id = $1
        OR parcel.receiver_id = $1
        OR parcel.receiver_phone = (SELECT phone FROM users WHERE id = $1)
        OR ($2 = 'driver' AND EXISTS (
          SELECT 1
          FROM parcel_assignments assignment
          JOIN driver_profiles driver_profile ON driver_profile.id = assignment.driver_id
          WHERE assignment.parcel_id = parcel.id
            AND driver_profile.user_id = $1
            AND assignment.status IN ('accepted', 'completed')
        ))
     ORDER BY incoming.created_at DESC, incoming.id DESC
     LIMIT 50`,
    [userId, role],
  )
  return result.rows
}

module.exports = { findConversationsForUser }
