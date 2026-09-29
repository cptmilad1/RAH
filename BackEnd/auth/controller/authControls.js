const bcrypt = require("bcrypt");
const db = require("../../../DataBase/base/dbBase");
const jwt = require("jsonwebtoken");
const crypto = require('crypto')

async function getAllUsers(req, res) {
  try {
    const result = await db.query(
      `SELECT id, full_name, username, email, role, phone, is_verify, user_address, created_at FROM users`,
    );
    return res
      .status(200)
      .json({ message: "data fetched success!", data: result.rows });
  } catch (err) {
    return res.status(400).json({ message: "have an error", err });
  }
}

async function getUser(req, res) {
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
    return res.status(400).json({
      message: "have an error",
      err,
    });
  }
}

async function registerUser(req, res) {
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
        (full_name, username, email, password_hash, phone, user_address, avatar_url)
        VALUES($1, $2, $3, $4, $5, $6, $7)
        `,
      [
        full_name,
        username,
        email,
        passwordHash,
        phone,
        user_address,
        avatar_url,
      ],
    );
    if (result.rowCount == 0)
      return res.status(500).json({ message: "registeration feild!" });
    const user = result.rows[0]
    const verification = crypto.randomBytes(32).toString('hex')
            await db.query(`insert into verify_token (user_id, token, expire_at)
                values($1,$2, now()+ '15 minutes')`,[user.id, verification])
    return res.status(200).json({ message: "registeration successfull!" });
  } catch (err) {
    if (err.code == "23505") {
      return res
        .status(400)
        .json({ message: "Email or Username already Exist!" });
    }
    return res
      .status(500)
      .json({ message: "User registration failed", error: err });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const result = await db.query(
      `select id, full_name, username, email, password_hash, phone, user_address, avatar_url, role, is_verify, is_active, created_at, token_verion from users where email=$1`,
      [email],
    );
    if (result.rows.length == 0)
      return res.status(400).json({ message: "incorrect email or password!" });
    if(result.rows[0].is_verify == false) return res.status(401).json({message: "please verify your email"})
    const user = result.rows[0];
    const passwordIsCorrect = await bcrypt.compare(
      password,
      user.password_hash,
    );
    if (!passwordIsCorrect)
      return res.status(400).json({ message: "incorrect email or password!" });

    const token = jwt.sign(
      { userId: user.id, role: user.role, tokenVersion: user.token_version},
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );
    const device = req.headers["user-agent"];
    const ip = req.ip;
    const createToken = await db.query(
      `insert into refresh_tokens(user_id, token, expire_at, device, ip_address, last_used) 
                values($1, $2, NOW() + INTERVAL '7 days', $3, $4, now())`,
      [user.id, refreshToken, device, ip],
    );
    if (createToken.rowCount == 0)
      return res.json({ message: "creating token feild!" });
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
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
    console.log(err);
    return res.json({ e: err.errors, message: "somethings wrong" });
  }
}

async function logoutUser(req, res) {
  const refreshToken = req.cookies.refresh_token
  if(refreshToken)return res.status(401).json({message: "Unauthorization..."})
  await db.query(`delete from refresh_tokens where token=$1`,[refreshToken])
  res.clearCookie("access_token");
  res.clearCookie('refresh_token')
  return res.json("Succesfull logged out!");
}

async function refreshToken(req, res) {
  try {
    const oldRefreshToken = req.cookies.refresh_token;
    if (!oldRefreshToken) return res.status(401).send("relogin required...");
    const decode = jwt.verify(oldRefreshToken, process.env.JWT_REFRESH_SECRET);
    const result = await db.query(
      `select * from refresh_tokens where token=$1`,
      [oldRefreshToken],
    );
    if (result.rowCount == 0)
      return res.status(400).send("invalid or expired refresh token");

    const oldToken = result.rows[0];
    if (new Date(oldToken.expire_at) < new Date())
      return res.status(401).json({ message: "refresh token expired!" });
    await db.query(`delete from refresh_tokens where id=$1`, [oldRefreshToken]);

    const newRefreshToken = jwt.sign(
      { userId: decode.userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );
    const device = req.headers["user-agent"];
    const ip = req.ip;
    await db.query(
      `insert into refresh_tokens (user_id, token, expire_at, device, ip_address, last_used)
                            values($1, $2, NOW() + INTERVAL '7 days', $3, $4, now())`,
      [decode.userId, newRefreshToken, device, ip],
    );
    const userResult = await db.query(
      `select id, role, token_version from users where id=$1`,
      [decode.userId],
    );
    if (userResult.rowCount == 0)
      return res.status(400).send("user not found!");
    const user = userResult.rows[0];
    const newAccessToken = jwt.sign(
        {userId: user.id, role: user.role, tokenVersion: user.token_version},
        process.env.JWT_SECRET,
        {expiresIn: "15m"}
    )
    
    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refresh_token", newRefreshToken,{
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7*24*60*60*1000
    })
    res.json({ message: "access token refreshed!" });
  } catch (err) {
    res.json({ message: "can not refresh the token!", error: err });
  }
}

async function changePassword(req,res) {
    try{
        const {oldPassword, newPassword} = req.body
        const userId = req.user.userId
        const result = await db.query(`SELECT password_hash from users where id=$1`,[userId])
        if (result.rowCount == 0) return res.json({message: "user not found!"})
        const user = result.rows[0]
        const isMAtch = await bcrypt.compare(oldPassword, user.password_hash)
        if(!isMAtch) return res.json({message: "password not match please try again"})
        const passwordHash = await bcrypt.hash(newPassword, 10)
        await db.query(`update users set password_hash=$1 where id=$2`,[passwordHash, userId])
        await db.query(`delete from refresh_tokens where user_id=$1`, [userId])
        res.clearCookie("access_token")
        res.clearCookie("refresh_token")
        return res.json({message: "password changed! please login again..."})
    }catch(err){
        return res.status(400).json({
            message: "action field!",
            err: err.message
        })
    }
}

async function forgotPassword(req,res) {
    try{
        const {email} = req.body
        const result = await db.query(`select id from users where email=$1`,[email])
        if(result.rows == 0)return res.send("user not found!")
        const userId = result.rows[0].id
        const resetToken = crypto.randomBytes(32).toString('hex')
        await db.query(`insert into password_verify_token (user_id, token, expire_at) 
            values ($1, $2, now() +'15 minutes')`,[userId ,resetToken])
        
        return res.json({message: "reset link generated and sented to your email", resetToken})
    }catch(err){
        if(err.name == "TokenExpiredError")return res.status(401).json({message: "reset token expired!"})
        if(err.name == "JsonWebTokenError")return res.status(401).json({message: "invalid reset token!"})
        return res.status(500).json({message: "internal server error!"})
    }
}

async function logoutAll(params) {
    try{
      const userId = req.user.userId
      await db.query(`delete from refresh_tokens where id=$1`,[userId])
      await db.query(`update users set token_version=token_version+1 where id=$1`,[userId])
      res.clearCookie('refresh_token')
      res.clearCookie('access_token')
      return res.status(200).json({message: "logged out from all devices! please login again..."})
    }catch(err){
      return res.status(500).json({message: "internal server error or logout feild!",error: err.message})
    }
}

async function verifyEmail(req,res) {
    try{
        const {token} = req.body
        const result = await db.query(`select user_id from verify_token where token=$1`,[token])
        if(result.rowCount == 0)return res.json({message: "invalid or expired token"})
        const userId = result.rows[0].user_id
        await db.query(`update users set is_verify=true where id=$1`,[userId])
        await db.query(`delete from verify_token where token=$1;`,[token])
        return res.json({massage: "email verify successfull"})
    }catch(err){
        res.send(err)
    }
}

async function changeRole(req,res) {
    try{
        const userId = Number(req.params.id)
        const {role} = req.body
        const allowedRoles = ["admin", "driver", "user"]
        if(!allowedRoles.includes(role)){
            return res.status(400).json({
                message: "Invalid Role"
            })
        }
        const result = await db.query(`UPDATE users SET role=$1 WHERE id=$2 RETURNING id, username, email, role`,[role, userId])
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
        res.status(500).json({
            message: "Server Error",
            error: err
        })
    }
}

async function resetPassword(req,res) {
    try{
        const {token, newPassword} = req.body
        const result = await db.query(`select user_id from password_reset_token
            where token=$1 and expire_at > now()`,[token])
        if(result.rowCount == 0) return res.json({meesage: "invalid or expired token"})
        const userId = result.rows[0].user_id
        const passwordHash = await bcrypt.hash(newPassword, 10)
        await db.query(`update users set password_hash=$1 where id=$2`,[passwordHash, userId])
        await db.query(`delete from password_verify_token where token=$1`,[token])
        return res.json({message: "password reseted success!"})
    }catch(err){
        res.json({massage: "error is: "+err, err: err})
    }
}

async function getSessions(req,res) {
    try{
        const id = req.user.userId
        const result = await db.query(`select id, device, ip_address, created_at, expire_at from refresh_tokens where user_id=$1 order by created_at desc`,[id])
        return res.json({data: result.rows})
    }catch(err){
        res.json({message: "somethings wrong!"})
    }
}

async function deleteSession(req,res) {
    try{
        const sessionId = req.params.id
        const userId = req.user.userId
        const result = await db.query(`delete from refresh_tokens where id=$1 and user_id=$2 returning id`, [sessionId, userId])
        if(result.rowCount == 0)return res.json({message: "session not found!"})
        return res.json({message: "session logged out!"})
    }catch(err){
        res.json({message: "logout of session feild!", err})
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
