const db = require('../../../DataBase/base/dbBase')

async function getBlockStatus(userId, targetId) {
  const result = await db.query(
    `SELECT target.id,
            EXISTS (
              SELECT 1 FROM user_blocks
              WHERE blocker_id = $1 AND blocked_id = target.id
            ) AS "blockedByMe",
            EXISTS (
              SELECT 1 FROM user_blocks
              WHERE blocker_id = target.id AND blocked_id = $1
            ) AS "blockedMe"
     FROM users target
     WHERE target.id = $2`,
    [userId, targetId],
  )
  return result.rows[0] || null
}

async function setUserBlocked(userId, targetId, blocked) {
  const client = await db.connect()
  let transactionStarted = false
  try {
    await client.query('BEGIN')
    transactionStarted = true
    const users = await client.query(
      'SELECT id FROM users WHERE id IN ($1, $2) ORDER BY id FOR UPDATE',
      [userId, targetId],
    )
    if (users.rowCount !== 2) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return false
    }

    if (blocked) {
      await client.query(
        `INSERT INTO user_blocks (blocker_id, blocked_id)
         VALUES ($1, $2)
         ON CONFLICT (blocker_id, blocked_id) DO NOTHING`,
        [userId, targetId],
      )
    } else {
      await client.query(
        'DELETE FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2',
        [userId, targetId],
      )
    }
    await client.query('COMMIT')
    transactionStarted = false
    return true
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

module.exports = { getBlockStatus, setUserBlocked }
