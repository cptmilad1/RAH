const db = require('../../../DataBase/base/dbBase')

async function findParcelsForUser(userId, role) {
  const result = await db.query(
    `SELECT p.id, p.sender_id AS "senderId", p.tracking_code AS "trackingCode", p.status,
            p.description, p.weight_kg AS "weightKg", p.created_at AS "createdAt",
            p.updated_at AS "updatedAt",
            COALESCE(p.receiver_name, receiver.full_name) AS "receiverName",
            COALESCE(p.receiver_id, (SELECT account.id FROM users account WHERE account.phone = p.receiver_phone)) AS "receiverId",
            COALESCE(p.receiver_phone, receiver.phone) AS "receiverPhone",
            COALESCE(receiver.avatar_url, '/imgs/default-avatar.svg') AS "receiverImage",
            sender.full_name AS "senderName",
            COALESCE(sender.avatar_url, '/imgs/default-avatar.svg') AS "senderImage",
            pickup.province AS "pickupProvince", pickup.address_line AS "pickupAddress",
            delivery.province AS "deliveryProvince", delivery.address_line AS "deliveryAddress"
     FROM parcels p
     JOIN users sender ON sender.id = p.sender_id
     LEFT JOIN users receiver
       ON receiver.id = COALESCE(
         p.receiver_id,
         (SELECT account.id FROM users account WHERE account.phone = p.receiver_phone)
       )
     JOIN addresses pickup ON pickup.id = p.pickup_address_id
     JOIN addresses delivery ON delivery.id = p.delivery_address_id
     WHERE $1 IN ('admin', 'driver')
        OR p.sender_id = $2
        OR p.receiver_id = $2
        OR p.receiver_phone = (SELECT phone FROM users WHERE id = $2)
     ORDER BY p.created_at DESC
     `,
    [role, userId],
  )
  return result.rows
}

async function findParcelForUser(userId, trackingCode) {
  const result = await db.query(
    `SELECT p.id, p.sender_id AS "senderId", p.tracking_code AS "trackingCode", p.status,
            p.description, p.weight_kg AS "weightKg", p.created_at AS "createdAt",
            p.updated_at AS "updatedAt",
            COALESCE(p.receiver_name, receiver.full_name) AS "receiverName",
            COALESCE(p.receiver_id, (SELECT account.id FROM users account WHERE account.phone = p.receiver_phone)) AS "receiverId",
            COALESCE(receiver.avatar_url, '/imgs/default-avatar.svg') AS "receiverImage",
            COALESCE(p.receiver_phone, receiver.phone) AS "receiverPhone",
            sender.full_name AS "senderName",
            COALESCE(sender.avatar_url, '/imgs/default-avatar.svg') AS "senderImage",
            (p.sender_id = $1) AS "isSender",
            COALESCE(
              p.receiver_id = $1 OR p.receiver_phone = (SELECT phone FROM users WHERE id = $1),
              FALSE
            ) AS "isReceiver",
            EXISTS (
              SELECT 1 FROM parcel_assignments pa
              WHERE pa.parcel_id = p.id AND pa.status IN ('accepted', 'completed')
            ) AS "hasAssignedDriver",
            EXISTS (
              SELECT 1 FROM parcel_assignments pa
              JOIN driver_profiles dp ON dp.id = pa.driver_id
              WHERE pa.parcel_id = p.id AND dp.user_id = $1 AND pa.status IN ('accepted', 'completed')
            ) AS "isAssignedDriver",
            COALESCE((
              SELECT driver.full_name
              FROM parcel_assignments pa
              JOIN driver_profiles dp ON dp.id = pa.driver_id
              JOIN users driver ON driver.id = dp.user_id
              WHERE pa.parcel_id = p.id AND pa.status IN ('accepted', 'completed')
              ORDER BY pa.accepted_at DESC NULLS LAST
              LIMIT 1
            ), '') AS "driverName",
            (
              SELECT driver.id
              FROM parcel_assignments pa
              JOIN driver_profiles dp ON dp.id = pa.driver_id
              JOIN users driver ON driver.id = dp.user_id
              WHERE pa.parcel_id = p.id AND pa.status IN ('accepted', 'completed')
              ORDER BY pa.accepted_at DESC NULLS LAST
              LIMIT 1
            ) AS "driverId",
            COALESCE((
              SELECT driver.avatar_url
              FROM parcel_assignments pa
              JOIN driver_profiles dp ON dp.id = pa.driver_id
              JOIN users driver ON driver.id = dp.user_id
              WHERE pa.parcel_id = p.id AND pa.status IN ('accepted', 'completed')
              ORDER BY pa.accepted_at DESC NULLS LAST
              LIMIT 1
            ), '/imgs/default-avatar.svg') AS "driverImage",
            pickup.province AS "pickupProvince", pickup.address_line AS "pickupAddress",
            delivery.province AS "deliveryProvince", delivery.address_line AS "deliveryAddress",
            COALESCE((
              SELECT json_agg(json_build_object(
                'status', history.status,
                'note', history.note,
                'createdAt', history.created_at
              ) ORDER BY history.created_at DESC)
              FROM parcel_status_history history
              WHERE history.parcel_id = p.id
            ), '[]'::json) AS history,
            COALESCE((
              SELECT json_agg(json_build_object(
                'name', item.name,
                'quantity', item.quantity,
                'description', item.description
              ) ORDER BY item.id)
              FROM parcel_items item
              WHERE item.parcel_id = p.id
            ), '[]'::json) AS items
     FROM parcels p
     JOIN users sender ON sender.id = p.sender_id
     LEFT JOIN users receiver
       ON receiver.id = COALESCE(
         p.receiver_id,
         (SELECT account.id FROM users account WHERE account.phone = p.receiver_phone)
       )
     JOIN addresses pickup ON pickup.id = p.pickup_address_id
     JOIN addresses delivery ON delivery.id = p.delivery_address_id
     WHERE p.tracking_code = $2`,
    [userId, trackingCode],
  )
  return result.rows[0] || null
}

module.exports = { findParcelsForUser, findParcelForUser }
