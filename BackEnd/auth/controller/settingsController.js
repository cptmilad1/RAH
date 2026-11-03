const db = require('../../../DataBase/base/dbBase')
const HandleResult = require('./utils/authResHandler')

const settingColumns = new Set(['theme', 'font', 'language', 'color'])

async function getSettings(req, res, next) {
  try {
    const result = await db.query(
      `WITH ensured AS (
         INSERT INTO user_settings (user_id)
         VALUES ($1)
         ON CONFLICT (user_id) DO NOTHING
         RETURNING theme, font, language, color, user_id
       )
       SELECT theme, font, language, color FROM ensured
       UNION ALL
       SELECT theme, font, language, color
       FROM user_settings
       WHERE user_id = $1
         AND NOT EXISTS (SELECT 1 FROM ensured)`,
      [req.user.userId],
    )

    return HandleResult({
      status: 200,
      message: 'Settings loaded.',
      data: result.rows[0],
      res,
    })
  } catch (error) {
    next(error)
  }
}

async function updateSetting(req, res, next) {
  try {
    const [[column, value]] = Object.entries(req.body)
    if (!settingColumns.has(column)) {
      return HandleResult({ status: 400, message: 'Invalid setting.', res })
    }

    const result = await db.query(
      `INSERT INTO user_settings (user_id, ${column})
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE
       SET ${column} = EXCLUDED.${column}, updated_at = NOW()
       RETURNING theme, font, language, color`,
      [req.user.userId, value],
    )

    return HandleResult({
      status: 200,
      message: 'Setting saved.',
      data: result.rows[0],
      res,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { getSettings, updateSetting }
