const db = require("../../../DataBase/base/dbBase");
const jwt = require("jsonwebtoken");
const { sendResetEmail, sendVerificationEmail } = require('./utils/emailVerifySenter')
const { createAccessToken, createRefreshToken, hashToken, setAuthCookies, clearAuthCookies } = require('../services/tokenService');
const userRoom = require('../../presence/userRoom')
const { saveAvatar, removeAvatar } = require('../services/avatarStorage')
const hashedPassword = require("./utils/bcryptPassword");
const createVerificationCode = require("./utils/emailVerificationCode");
const Compare = require("./utils/comparePassword");
const HandleResult = require("./utils/authResHandler");

function disconnectUserSockets(req, userId) {
  req.app.get('io')?.in(userRoom(userId)).disconnectSockets(true)
}

async function getAllUsers(req, res, next) {
  try {
    const result = await db.query(
      `SELECT id, full_name, username, email, role, phone, is_verify, user_address, created_at FROM users`,
    );
    return HandleResult({status: 200, message: "data fetched success!", data: result.rows, res})
  } catch (err) {
    next(err)
  }
}

async function getUser(req, res, next) {
  try {
    const id = req.params.id;
    if (id == undefined || id == null) return HandleResult({ status: 404, message: "invalid id!", res });
    const result = await db.query(
      `select u.id, u.full_name, u.username, u.email, u.phone, u.user_address, u.role,
          u.is_verify, u.is_active, u.created_at,
          COALESCE(u.avatar_url, '/imgs/default-avatar.svg') AS avatar_url,
          dp.province AS driver_province
       from users u
       left join driver_profiles dp on dp.user_id = u.id
       where u.id=$1`,
      [id],
    );
    if (result.rowCount == 0)
      return HandleResult({ status: 403, message: "user not found", res });
    const user = result.rows[0];
    return HandleResult({
      status: 200,
      message: "user finded!",
      data: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        username: user.username,
        role: user.role,
        phone: user.phone,
        verify: user.is_verify,
        isActive: user.is_active,
        address: user.user_address,
        signUp_At: user.created_at,
        image: user.avatar_url,
        driverProvince: user.driver_province,
      },
      res,
    });
  } catch (err) {
    next(err)
  }
}

async function updateUser(req, res, next) {
  let newAvatarUrl
  try {
    const { full_name, username, phone, user_address, driver_province: driverProvince } = req.body;
    const previousAvatarResult = req.file
      ? await db.query('SELECT avatar_url FROM users WHERE id = $1', [req.params.id])
      : null
    if (req.file && !previousAvatarResult.rowCount) {
      return HandleResult({ status: 404, message: 'User not found.', res })
    }
    if (req.file) newAvatarUrl = await saveAvatar(req.file)
    const client = await db.connect()
    let transactionStarted = false
    let user
    try {
      await client.query('BEGIN')
      transactionStarted = true
      const result = await client.query(
        `update users
         set full_name=$1, username=$2, phone=NULLIF($3, ''), user_address=NULLIF($4, ''),
             avatar_url=COALESCE($5, avatar_url)
         where id=$6
         returning id, full_name, username, email, phone, user_address, role, is_verify, is_active, created_at, avatar_url`,
        [full_name, username, phone, user_address, newAvatarUrl, req.params.id],
      )
      if (result.rowCount === 0) {
        await client.query('ROLLBACK')
        transactionStarted = false
        if (newAvatarUrl) await removeAvatar(newAvatarUrl)
        return HandleResult({ status: 404, message: 'User not found.', res })
      }
      user = result.rows[0]
      if (driverProvince !== undefined && user.role === 'driver') {
        await client.query(
          `INSERT INTO driver_profiles (user_id, province)
           VALUES ($1, NULLIF($2, ''))
           ON CONFLICT (user_id) DO UPDATE SET province = EXCLUDED.province, updated_at = NOW()`,
          [user.id, driverProvince],
        )
      }
      await client.query('COMMIT')
      transactionStarted = false
    } catch (error) {
      if (transactionStarted) await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
    if (newAvatarUrl) {
      await removeAvatar(previousAvatarResult.rows[0].avatar_url).catch((cleanupError) => {
        console.error('Previous avatar cleanup failed:', cleanupError.message)
      })
    }
    if (user.role === 'driver') {
      user.driver_province = driverProvince === undefined
        ? (await db.query('SELECT province FROM driver_profiles WHERE user_id = $1', [user.id])).rows[0]?.province
        : driverProvince || null
    }
    return HandleResult({
      status: 200,
      message: 'Profile updated.',
      data: {
        id: user.id,
        name: user.full_name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        verify: user.is_verify,
        isActive: user.is_active,
        address: user.user_address,
        driverProvince: user.driver_province,
        signUp_At: user.created_at,
        image: user.avatar_url,
      },
      res,
    });
  } catch (err) {
    if (newAvatarUrl) await removeAvatar(newAvatarUrl).catch((cleanupError) => {
      console.error('Avatar cleanup failed:', cleanupError.message)
    })
    next(err);
  }
}

async function registerUser(req, res, next) {
  try {
    const {
      full_name,
      username,
      email,
      password,
      phone,
      user_address,
    } = req.body;
    const passwordHash = await hashedPassword(password)
    const client = await db.connect()
    let verification
    let transactionStarted = false

    try {
      await client.query('BEGIN')
      transactionStarted = true
      const result = await client.query(
        `
          INSERT INTO users
          (full_name, username, email, password_hash, phone, user_address, role_id)
          SELECT $1, $2, $3, $4, $5, $6, roles.id
          FROM roles WHERE roles.name = 'user'
          RETURNING id
        `,
        [
          full_name,
          username,
          email,
          passwordHash,
          phone || null,
          user_address,
        ],
      )
      if (result.rowCount === 0) {
        const error = new Error("Can not register user please try again later")
        error.status = 500
        throw error
      }

      const user = result.rows[0]
      let codeStored = false
      for (let attempt = 0; attempt < 10 && !codeStored; attempt += 1) {
        verification = createVerificationCode()
        const codeResult = await client.query(
          `insert into verify_token (user_id, token, expire_at)
           values($1, $2, NOW() + INTERVAL '15 minutes')
           on conflict (token) do nothing
           returning token`,
          [user.id, verification],
        )
        codeStored = codeResult.rowCount === 1
      }
      if (!codeStored) {
        const error = new Error('Could not generate a unique email verification code.')
        error.status = 503
        throw error
      }

      await sendVerificationEmail(email, verification)
      await client.query('COMMIT')
      transactionStarted = false

      return HandleResult({
        status: 201,
        message: "Registration successful. Verify your email before signing in.",
        res,
      })
  } catch (err) {
      if (transactionStarted) {
        try {
          await client.query('ROLLBACK')
        } catch (rollbackError) {
          console.error('Registration rollback failed:', rollbackError.code || rollbackError.message)
        }
      }
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    next(err)
  }
}

async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await db.query(
      `select id, full_name, username, email, password_hash, phone, user_address, avatar_url, role, is_verify, is_active, created_at, token_version from users where email=$1`,
      [email],
    );
    if (result.rows.length == 0)
      return HandleResult({ status: 400, message: "incorrect email or password!", res });
    const user = result.rows[0];
    const passwordIsCorrect = await Compare(password, user.password_hash);
    if (!passwordIsCorrect)
      return HandleResult({ status: 400, message: "incorrect email or password!", res });
    if (!user.is_active)
      return HandleResult({ status: 403, message: "This account is inactive.", res });
    if (!user.is_verify) return HandleResult({ status: 403, message: "Please verify your email before signing in.", res });

    const token = createAccessToken(user);
    const refreshToken = createRefreshToken(user.id);
    const device = req.headers["user-agent"];
    const ip = req.ip;
    const createToken = await db.query(
      `insert into refresh_tokens(user_id, token_hash, expires_at, device, ip_address, last_used)
       values($1, $2, NOW() + INTERVAL '7 days', $3, $4, now())`,
      [user.id, hashToken(refreshToken), device, ip],
    );
    if (createToken.rowCount == 0)
      return HandleResult({ status: 200, message: "creating token feild!", res });
    setAuthCookies(res, token, refreshToken);
    return HandleResult({
      status: 200,
      message: "Login successfull",
      data: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        username: user.username,
        verify: user.is_verify,
        address: user.user_address,
        signUp_At: user.created_at,
        is_active : user.is_active,
        phone : user.phone
      },
      res,
    });
  } catch (err) {
    next(err)
  }
}

async function logoutUser(req, res, next) {
  try{
    const id = req.user.userId
    const refreshToken = req.cookies?.refresh_token
    if (refreshToken) await db.query(`delete from refresh_tokens where token_hash=$1`, [hashToken(refreshToken)])
    clearAuthCookies(res);
    return HandleResult({ status: 200, message: "Successfully logged out.", res });
  }catch(err){
    next(err)
  }
}

async function refreshToken(req, res, next) {
  try {
    const oldRefreshToken = req.cookies?.refresh_token;
    if (!oldRefreshToken) return HandleResult({ status: 401, message: "relogin required...", res });
    const decode = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
    const result = await db.query(
      `select id, user_id, expires_at from refresh_tokens where token_hash=$1`,
      [hashToken(oldRefreshToken)],
    );
    if (result.rowCount == 0)
      return HandleResult({ status: 400, message: "invalid or expired refresh token", res });

    const oldToken = result.rows[0];
    if (String(decode.userId) !== String(oldToken.user_id) || new Date(oldToken.expires_at) < new Date())
      return HandleResult({ status: 401, message: "refresh token expired!", res });
    await db.query(`delete from refresh_tokens where id=$1`, [oldToken.id]);

    const newRefreshToken = createRefreshToken(decode.userId);
    const device = req.headers["user-agent"];
    const ip = req.ip;
    await db.query(
      `insert into refresh_tokens (user_id, token_hash, expires_at, device, ip_address, last_used)
       values($1, $2, NOW() + INTERVAL '7 days', $3, $4, now())`,
      [decode.userId, hashToken(newRefreshToken), device, ip],
    );
    const userResult = await db.query(
      `select id, role, token_version, is_active from users where id=$1`,
      [decode.userId],
    );
    if (userResult.rowCount == 0)
      return HandleResult({ status: 400, message: "user not found!", res });
    const user = userResult.rows[0];
    if (!user.is_active) return HandleResult({ status: 403, message: "This account is inactive.", res });
    const newAccessToken = createAccessToken(user);
    setAuthCookies(res, newAccessToken, newRefreshToken);
    return HandleResult({ status: 200, message: "Access token refreshed.", res });
  } catch (err) {
    next(err)
  }
}

async function changePassword(req,res, next) {
    try{
        const {oldPassword, newPassword} = req.body
        const userId = req.user.userId
        const result = await db.query(`SELECT password_hash from users where id=$1`,[userId])
        if (result.rowCount == 0) return HandleResult({ status: 200, message: "user not found!", res })
        const user = result.rows[0]
        const isMAtch = await Compare(oldPassword, user.password_hash)
        if(!isMAtch) return HandleResult({ status: 200, message: "password not match please try again", res })
        const passwordHash = await hashedPassword(newPassword)
        await db.query(`update users set password_hash=$1, token_version=token_version+1 where id=$2`,[passwordHash, userId])
        await db.query(`delete from refresh_tokens where user_id=$1`, [userId])
        disconnectUserSockets(req, userId)
        clearAuthCookies(res)
        return HandleResult({ status: 200, message: "password changed! please login again...", res })
    }catch(err){
        next(err)
    }
}

async function forgotPassword(req,res, next) {
    try{
        const {email} = req.body
        const result = await db.query(`select id from users where email=$1`,[email])
        if (result.rowCount === 0) {
          return HandleResult({ status: 200, message: "If the account exists, a reset link has been sent.", res })
        }
        const userId = result.rows[0].id
        const resetToken = crypto.randomBytes(32).toString('hex')
        await db.query(`insert into password_reset_token (user_id, token, expire_at)
          values ($1, $2, NOW() + INTERVAL '15 minutes')`,[userId ,resetToken])
        const emailSent = await sendResetEmail(email, resetToken)
        return HandleResult({
          status: 200,
          message: "If the account exists, a reset link has been sent.",
          // ...(process.env.NODE_ENV !== 'production' && !emailSent && { resetToken }),
          res
        })
    }catch(err){
        next(err)
    }
}

async function logoutAll(req,res, next) {
    try{
      const userId = req.user.userId
      await db.query(`delete from refresh_tokens where user_id=$1`,[userId])
      await db.query(`update users set token_version=token_version+1 where id=$1`,[userId])
      disconnectUserSockets(req, userId)
      clearAuthCookies(res)
      return HandleResult({ status: 200, message: "logged out from all devices! please login again...", res })
    }catch(err){
      next(err)
    }
}

async function verifyEmail(req,res, next) {
    try{
        const {code} = req.body
        const result = await db.query(`select user_id from verify_token where token=$1 and expire_at > NOW()`,[code])
        if(result.rowCount == 0)return HandleResult({ status: 400, message: "invalid or expired token", res })
        const userId = result.rows[0].user_id
        await db.query(`update users set is_verify=true where id=$1`,[userId])
        await db.query(`delete from verify_token where token=$1;`,[code])
        return HandleResult({ status: 200, message: "Email verified successfully.", res })
    }catch(err){
        next(err)
    }
}

async function changeRole(req,res, next) {
    try{
        const userId = Number(req.params.id || req.body.userId)
        const {role} = req.body
        const allowedRoles = ["admin", "user"]
        if(!Number.isSafeInteger(userId) || userId < 1 || !allowedRoles.includes(role)){
            return HandleResult({ status: 400, message: "Invalid Role or user not found!", res })
        }
        if (String(req.user.userId) === String(userId)) {
            return HandleResult({ status: 400, message: "You cannot change your own role.", res })
        }
        const client = await db.connect()
        let result
        try {
          await client.query('BEGIN')
          result = await client.query(
            `UPDATE users SET role=$1, role_id=(SELECT id FROM roles WHERE name=$1)
             WHERE id=$2 AND role <> 'driver'
             RETURNING id, username, email, role`,
            [role, userId],
          )
          await client.query('COMMIT')
        } catch (error) {
          await client.query('ROLLBACK')
          throw error
        } finally {
          client.release()
        }
        if(result.rowCount == 0){
            return HandleResult({ status: 404, message: "User not found!", res })
        }
        return HandleResult({
            status: 200,
            data: result.rows[0],
            message: "Role Updated!",
            res,
        })
    }catch(err){
        next(err)
    }
}

// check syntax needed
async function resetPassword(req,res, next) {
    try{
        const {token, newPassword} = req.body
        const result = await db.query(`select user_id from password_reset_token
          where token=$1 and expire_at > now() and used_at is null`,[token])
        if(result.rowCount == 0) return HandleResult({ status: 400, message: "Invalid or expired reset token.", res })
        const userId = result.rows[0].user_id
        const passwordHash = await hashedPassword(newPassword)
        await db.query(`update users set password_hash=$1, token_version=token_version+1 where id=$2`,[passwordHash, userId])
        await db.query(`delete from refresh_tokens where user_id=$1`,[userId])
        disconnectUserSockets(req, userId)
        await db.query(`delete from password_reset_token where token=$1`,[token])
        return HandleResult({ status: 200, message: "Password reset successfully.", res })
    }catch(err){
        next(err)
    }
}

// check syntax needed
async function getSessions(req,res, next) {
    try{
        const id = req.user.userId
        const result = await db.query(`select id, device, ip_address, created_at, expires_at from refresh_tokens where user_id=$1 order by created_at desc`,[id])
        return HandleResult({ status: 200, data: result.rows, res })
    }catch(err){
        next(err)
    }
}

async function deleteSession(req,res, next) {
    try{
        const sessionId = req.params.id
        const userId = req.user.userId
        const result = await db.query(`delete from refresh_tokens where id=$1 and user_id=$2 returning id`, [sessionId, userId])
        if(result.rowCount == 0)return HandleResult({ status: 200, message: "session not found!", res })
        return HandleResult({ status: 200, message: "session logged out!", res })
    }catch(err){
        next(err)
    }
}

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUser,
  updateUser,
  logoutUser,
  refreshToken,
  changePassword,
  forgotPassword,
  logoutAll,
  verifyEmail,
  changeRole,
  resetPassword,
  getSessions,
  deleteSession
};
