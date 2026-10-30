const db = require('../../../DataBase/base/dbBase')

async function findParcelsForUser(userId, role) {
  const result = await db.query(
    `SELECT p.id, p.sender_id AS "senderId", p.tracking_code AS "trackingCode", p.status,
            p.description, p.weight_kg AS "weightKg", p.created_at AS "createdAt",
            p.updated_at AS "updatedAt",
            COALESCE(p.receiver_name, receiver.full_name) AS "receiverName",
            COALESCE(p.receiver_phone, receiver.phone) AS "receiverPhone",
            sender.full_name AS "senderName",
            pickup.province AS "pickupProvince", pickup.city AS "pickupCity", pickup.address_line AS "pickupAddress",
            delivery.province AS "deliveryProvince", delivery.city AS "deliveryCity", delivery.address_line AS "deliveryAddress"
     FROM parcels p
     JOIN users sender ON sender.id = p.sender_id
     LEFT JOIN users receiver ON receiver.id = p.receiver_id
     JOIN addresses pickup ON pickup.id = p.pickup_address_id
     JOIN addresses delivery ON delivery.id = p.delivery_address_id
     WHERE $1 = 'admin'
        OR p.sender_id = $2
        OR p.receiver_id = $2
        OR p.receiver_phone = (SELECT phone FROM users WHERE id = $2)
        OR ($1 = 'driver' AND EXISTS (
          SELECT 1
          FROM parcel_assignments pa
          JOIN driver_profiles dp ON dp.id = pa.driver_id
          WHERE pa.parcel_id = p.id AND dp.user_id = $2
        ))
     ORDER BY p.created_at DESC
     LIMIT 100`,
    [role, userId],
  )
  return result.rows
}

async function findParcelForUser(userId, role, trackingCode) {
  const result = await db.query(
    `SELECT p.id, p.sender_id AS "senderId", p.tracking_code AS "trackingCode", p.status,
            p.description, p.weight_kg AS "weightKg", p.created_at AS "createdAt",
            p.updated_at AS "updatedAt",
            COALESCE(p.receiver_name, receiver.full_name) AS "receiverName",
            COALESCE(p.receiver_phone, receiver.phone) AS "receiverPhone",
            sender.full_name AS "senderName",
            pickup.province AS "pickupProvince", pickup.city AS "pickupCity", pickup.address_line AS "pickupAddress",
            delivery.province AS "deliveryProvince", delivery.city AS "deliveryCity", delivery.address_line AS "deliveryAddress",
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
     LEFT JOIN users receiver ON receiver.id = p.receiver_id
     JOIN addresses pickup ON pickup.id = p.pickup_address_id
     JOIN addresses delivery ON delivery.id = p.delivery_address_id
     WHERE p.tracking_code = $3
       AND ($1 = 'admin'
         OR p.sender_id = $2
         OR p.receiver_id = $2
         OR p.receiver_phone = (SELECT phone FROM users WHERE id = $2)
         OR ($1 = 'driver' AND EXISTS (
           SELECT 1
           FROM parcel_assignments pa
           JOIN driver_profiles dp ON dp.id = pa.driver_id
           WHERE pa.parcel_id = p.id AND dp.user_id = $2
         )))`,
    [role, userId, trackingCode],
  )
  return result.rows[0] || null
}

module.exports = { findParcelsForUser, findParcelForUser }
