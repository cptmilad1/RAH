const db = require('../../../DataBase/base/dbBase')

async function loadMessages(conversationId) {
  const result = await db.query(
    `SELECT message.id, message.sender_id AS "senderId",
            sender.full_name AS "senderName",
            COALESCE(sender.avatar_url, '/imgs/default-avatar.svg') AS "senderImage",
            message.body AS message, message.created_at AS "createdAt"
     FROM (
       SELECT id, sender_id, body, created_at
       FROM direct_messages
       WHERE conversation_id = $1
       ORDER BY created_at DESC, id DESC
       LIMIT 100
     ) message
     JOIN users sender ON sender.id = message.sender_id
     ORDER BY message.created_at, message.id`,
    [conversationId],
  )
  return result.rows
}

async function getUnreadMessageCount(userId) {
  const result = await db.query(
    `SELECT COUNT(*)::int AS count
     FROM direct_messages message
     JOIN direct_conversations conversation ON conversation.id = message.conversation_id
     WHERE message.sender_id <> $1
       AND message.read_at IS NULL
       AND (conversation.user_one_id = $1 OR conversation.user_two_id = $1)`,
    [userId],
  )
  return result.rows[0].count
}

async function markConversationRead(userId, targetId) {
  const result = await db.query(
    `UPDATE direct_messages message
     SET read_at = NOW()
     FROM direct_conversations conversation
     WHERE message.conversation_id = conversation.id
       AND message.sender_id = $2
       AND message.read_at IS NULL
       AND ((conversation.user_one_id = $1 AND conversation.user_two_id = $2)
         OR (conversation.user_one_id = $2 AND conversation.user_two_id = $1))
     RETURNING message.id`,
    [userId, targetId],
  )
  return result.rowCount
}

async function findConversationId(client, userId, targetId) {
  const result = await client.query(
    `SELECT id FROM direct_conversations
     WHERE user_one_id = LEAST($1::bigint, $2::bigint)
       AND user_two_id = GREATEST($1::bigint, $2::bigint)`,
    [userId, targetId],
  )
  return result.rows[0]?.id || null
}

async function getDirectConversation(userId, targetId) {
  const client = await db.connect()
  let transactionStarted = false
  let conversation
  try {
    await client.query('BEGIN')
    transactionStarted = true
    const users = await client.query(
      `SELECT id, full_name AS name, username,
              COALESCE(avatar_url, '/imgs/default-avatar.svg') AS image
       FROM users
       WHERE id IN ($1, $2)
       ORDER BY id
       FOR UPDATE`,
      [userId, targetId],
    )
    if (users.rowCount !== 2) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return null
    }
    const otherUser = users.rows.find((user) => String(user.id) === String(targetId))
    const blocks = await client.query(
      `SELECT
         EXISTS (SELECT 1 FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2) AS "blockedByMe",
         EXISTS (SELECT 1 FROM user_blocks WHERE blocker_id = $2 AND blocked_id = $1) AS "blockedMe"`,
      [userId, targetId],
    )
    let conversationId = await findConversationId(client, userId, targetId)
    if (!conversationId && !blocks.rows[0].blockedByMe && !blocks.rows[0].blockedMe) {
      await client.query(
        `INSERT INTO direct_conversations (user_one_id, user_two_id)
         VALUES (LEAST($1::bigint, $2::bigint), GREATEST($1::bigint, $2::bigint))
         ON CONFLICT (user_one_id, user_two_id) DO NOTHING`,
        [userId, targetId],
      )
      conversationId = await findConversationId(client, userId, targetId)
    }
    await client.query('COMMIT')
    transactionStarted = false
    conversation = {
      id: conversationId,
      otherUser,
      blockedByMe: blocks.rows[0].blockedByMe,
      blockedMe: blocks.rows[0].blockedMe,
    }
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }

  return {
    ...conversation,
    messages: conversation.id ? await loadMessages(conversation.id) : [],
  }
}

async function listDirectConversations(userId) {
  const result = await db.query(
    `SELECT peer.id AS "userId", peer.full_name AS "userName",
            peer.username, COALESCE(peer.avatar_url, '/imgs/default-avatar.svg') AS "userImage",
            latest.message, latest."createdAt", latest."senderId",
            EXISTS (
              SELECT 1 FROM user_blocks
              WHERE blocker_id = $1 AND blocked_id = peer.id
            ) AS "blockedByMe",
            EXISTS (
              SELECT 1 FROM user_blocks
              WHERE blocker_id = peer.id AND blocked_id = $1
            ) AS "blockedMe"
     FROM direct_conversations conversation
     JOIN users peer ON peer.id = CASE
       WHEN conversation.user_one_id = $1 THEN conversation.user_two_id
       ELSE conversation.user_one_id
     END
     JOIN LATERAL (
       SELECT body AS message, created_at AS "createdAt", sender_id AS "senderId"
       FROM direct_messages
       WHERE conversation_id = conversation.id
       ORDER BY created_at DESC, id DESC
       LIMIT 1
     ) latest ON TRUE
     WHERE conversation.user_one_id = $1 OR conversation.user_two_id = $1
     ORDER BY latest."createdAt" DESC, conversation.id DESC
     LIMIT 100`,
    [userId],
  )
  return result.rows
}

async function sendDirectMessage(userId, targetId, body) {
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
      return { notFound: true }
    }
    const blockResult = await client.query(
      `SELECT EXISTS (
         SELECT 1 FROM user_blocks
         WHERE (blocker_id = $1 AND blocked_id = $2)
            OR (blocker_id = $2 AND blocked_id = $1)
       ) AS blocked`,
      [userId, targetId],
    )
    if (blockResult.rows[0].blocked) {
      await client.query('ROLLBACK')
      transactionStarted = false
      return { blocked: true }
    }

    await client.query(
      `INSERT INTO direct_conversations (user_one_id, user_two_id)
       VALUES (LEAST($1::bigint, $2::bigint), GREATEST($1::bigint, $2::bigint))
       ON CONFLICT (user_one_id, user_two_id) DO NOTHING`,
      [userId, targetId],
    )
    const conversationId = await findConversationId(client, userId, targetId)
    const inserted = await client.query(
      `INSERT INTO direct_messages (conversation_id, sender_id, body)
       VALUES ($1, $2, $3)
       RETURNING id, sender_id AS "senderId", body AS message, created_at AS "createdAt"`,
      [conversationId, userId, body],
    )
    const sender = await client.query(
      `SELECT full_name AS "senderName",
              COALESCE(avatar_url, '/imgs/default-avatar.svg') AS "senderImage"
       FROM users WHERE id = $1`,
      [userId],
    )
    await client.query('COMMIT')
    transactionStarted = false
    return {
      conversationId,
      message: { ...inserted.rows[0], ...sender.rows[0] },
    }
  } catch (error) {
    if (transactionStarted) await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

module.exports = {
  getDirectConversation,
  getUnreadMessageCount,
  listDirectConversations,
  markConversationRead,
  sendDirectMessage,
}
