const bcrypt = require("bcrypt");
const db = require("../../../DataBase/base/dbBase");
const jwt = require("jsonwebtoken");
const crypto = require('crypto')
const { sendResetEmail, sendVerificationEmail } = require('./utils/emailVerifySenter')
const { createAccessToken, createRefreshToken, hashToken, setAuthCookies, clearAuthCookies } = require('../services/tokenService')

async function getAllUsers(req, res, next) {
  try {
    const result = await db.query(
      `SELECT id, full_name, username, email, role, phone, is_verify, user_address, created_at FROM users`,
    );
    return res
      .status(200)
      .json({ message: "data fetched success!", data: result.rows });
  } catch (err) {
    next(err)
  }
}

async function getUser(req, res, next) {
  try {
    const id = req.params.id;
    if (id == undefined) return res.status(404).send("invalid id!");
    const result = await db.query(
      `select id, full_name, username, email, phone, user_address, role, is_verify, is_active, created_at from users where id=$1`,
      [id],
    );
    if (result.rowCount == 0)
      return res.status(403).json({ message: "user not found" });
    const user = result.rows[0];
    return res.status(200).json({
      message: "user finded!",
      data: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        username: user.username,
        role: user.role,
        phone: user.phone,
        verify: user.is_verify,
        address: user.user_address,
        signUp_At: user.created_at,
      },
    });
  } catch (err) {
    next(err)
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
      avatar_url,
    } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `
        INSERT INTO users
        (full_name, username, email, password_hash, phone, user_address, avatar_url, role_id)
        SELECT $1, $2, $3, $4, $5, $6, $7, roles.id
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
        avatar_url,
      ],
    );
    if (result.rowCount == 0)
      return res.status(500).json({ message: "Default user role is not configured." });
    const user = result.rows[0]
    const verification = crypto.randomBytes(32).toString('hex')
    await db.query(`insert into verify_token (user_id, token, expire_at)
      values($1, $2, NOW() + INTERVAL '15 minutes')`, [user.id, verification])
    await sendVerificationEmail(email, verification)
    return res.status(201).json({
      message: "Registration successful. Verify your email before signing in.",
      ...(process.env.NODE_ENV !== 'production' && { verificationToken: verification }),
    });
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
      return res.status(400).json({ message: "incorrect email or password!" });
    const user = result.rows[0];
    if (!user.is_active) return res.status(403).json({ message: "This account is inactive." });
    const passwordIsCorrect = await bcrypt.compare(
      password,
      user.password_hash,
    );
    if (!passwordIsCorrect)
      return res.status(400).json({ message: "incorrect email or password!" });
    if (!user.is_verify) return res.status(403).json({ message: "Please verify your email before signing in." });

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
      return res.json({ message: "creating token feild!" });
    setAuthCookies(res, token, refreshToken);
    return res.status(200).json({
      message: "Login successfull",
      data: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        username: user.username,
        verify: user.is_verify,
        address: user.user_address,
        signUp_At: user.created_at,
      },
    });
  } catch (err) {
    next(err)
  }
}

async function logoutUser(req, res, next) {
  try{
    const refreshToken = req.cookies?.refresh_token
    if (refreshToken) await db.query(`delete from refresh_tokens where token_hash=$1`, [hashToken(refreshToken)])
    clearAuthCookies(res);
    return res.status(200).json({ message: "Successfully logged out." });
  }catch(err){
    next(err)
  }
}

async function refreshToken(req, res, next) {
  try {
    const oldRefreshToken = req.cookies?.refresh_token;
    if (!oldRefreshToken) return res.status(401).send("relogin required...");
    const decode = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
    const result = await db.query(
      `select id, user_id, expires_at from refresh_tokens where token_hash=$1`,
      [hashToken(oldRefreshToken)],
    );
    if (result.rowCount == 0)
      return res.status(400).send("invalid or expired refresh token");

    const oldToken = result.rows[0];
    if (String(decode.userId) !== String(oldToken.user_id) || new Date(oldToken.expires_at) < new Date())
      return res.status(401).json({ message: "refresh token expired!" });
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
      return res.status(400).send("user not found!");
    const user = userResult.rows[0];
    if (!user.is_active) return res.status(403).json({ message: "This account is inactive." });
    const newAccessToken = createAccessToken(user);
    setAuthCookies(res, newAccessToken, newRefreshToken);
    return res.json({ message: "Access token refreshed." });
  } catch (err) {
    next(err)
  }
}

async function changePassword(req,res, next) {
    try{
        const {oldPassword, newPassword} = req.body
        const userId = req.user.userId
        const result = await db.query(`SELECT password_hash from users where id=$1`,[userId])
        if (result.rowCount == 0) return res.json({message: "user not found!"})
        const user = result.rows[0]
        const isMAtch = await bcrypt.compare(oldPassword, user.password_hash)
        if(!isMAtch) return res.json({message: "password not match please try again"})
        const passwordHash = await bcrypt.hash(newPassword, 10)
        await db.query(`update users set password_hash=$1, token_version=token_version+1 where id=$2`,[passwordHash, userId])
        await db.query(`delete from refresh_tokens where user_id=$1`, [userId])
        res.clearCookie("access_token")
        res.clearCookie("refresh_token")
        return res.json({message: "password changed! please login again..."})
    }catch(err){
        next(err)
    }
}

async function forgotPassword(req,res, next) {
    try{
        const {email} = req.body
        const result = await db.query(`select id from users where email=$1`,[email])
        if (result.rowCount === 0) {
          return res.json({ message: "If the account exists, a reset link has been sent." })
        }
        const userId = result.rows[0].id
        const resetToken = crypto.randomBytes(32).toString('hex')
        await db.query(`insert into password_reset_token (user_id, token, expire_at)
          values ($1, $2, NOW() + INTERVAL '15 minutes')`,[userId ,resetToken])
        const emailSent = await sendResetEmail(email, resetToken)
        return res.json({
          message: "If the account exists, a reset link has been sent.",
          ...(process.env.NODE_ENV !== 'production' && !emailSent && { resetToken }),
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
      res.clearCookie('refresh_token')
      res.clearCookie('access_token')
      return res.status(200).json({message: "logged out from all devices! please login again..."})
    }catch(err){
      next(err)
    }
}

async function verifyEmail(req,res, next) {
    try{
        const {token} = req.body
        const result = await db.query(`select user_id from verify_token where token=$1 and expire_at > NOW()`,[token])
        if(result.rowCount == 0)return res.json({message: "invalid or expired token"})
        const userId = result.rows[0].user_id
        await db.query(`update users set is_verify=true where id=$1`,[userId])
        await db.query(`delete from verify_token where token=$1;`,[token])
        return res.json({message: "Email verified successfully."})
    }catch(err){
        next(err)
    }
}
async function changeRole(req,res, next) {
    try{
        const userId = Number(req.params.id || req.body.userId)
        const {role} = req.body
        const allowedRoles = ["admin", "driver", "user"]
        if(!Number.isSafeInteger(userId) || userId < 1 || !allowedRoles.includes(role)){
            return res.status(400).json({
                message: "Invalid Role"
            })
        }
        const result = await db.query(`UPDATE users SET role=$1, role_id=(SELECT id FROM roles WHERE name=$1) WHERE id=$2 RETURNING id, username, email, role`,[role, userId])
        if(result.rowCount == 0){
            return res.status(404).json({
                message: "User not found!"
            })
        }
        res.status(200).json({
            data: result.rows[0],
            message: "Role Updated!"
        })
    }catch(err){
        next(err)
    }
}
async function resetPassword(req,res, next) {
    try{
        const {token, newPassword} = req.body
        const result = await db.query(`select user_id from password_reset_token
          where token=$1 and expire_at > now() and used_at is null`,[token])
        if(result.rowCount == 0) return res.status(400).json({message: "Invalid or expired reset token."})
        const userId = result.rows[0].user_id
        const passwordHash = await bcrypt.hash(newPassword, 10)
        await db.query(`update users set password_hash=$1, token_version=token_version+1 where id=$2`,[passwordHash, userId])
        await db.query(`delete from refresh_tokens where user_id=$1`,[userId])
        await db.query(`delete from password_reset_token where token=$1`,[token])
        return res.json({message: "Password reset successfully."})
    }catch(err){
        next(err)
    }
}
async function getSessions(req,res, next) {
    try{
        const id = req.user.userId
        const result = await db.query(`select id, device, ip_address, created_at, expires_at from refresh_tokens where user_id=$1 order by created_at desc`,[id])
        return res.json({data: result.rows})
    }catch(err){
        next(err)
    }
}
async function deleteSession(req,res, next) {
    try{
        const sessionId = req.params.id
        const userId = req.user.userId
        const result = await db.query(`delete from refresh_tokens where id=$1 and user_id=$2 returning id`, [sessionId, userId])
        if(result.rowCount == 0)return res.json({message: "session not found!"})
        return res.json({message: "session logged out!"})
    }catch(err){
        next(err)
    }
}

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUser,
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
