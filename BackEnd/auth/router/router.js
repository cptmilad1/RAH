const express = require("express");
const router = express.Router();
const validator = require("../middleware/validator");
const registerShema = require("../schema/registerSchema");
const loginSchema = require("../schema/loginSchema");
const {
  loginUser,
  registerUser,
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
  deleteSession,
} = require("../controller/authControls");
const authentication = require("../middleware/authentication");
const ownerShip = require("../middleware/ownerShip");
const authorize = require("../middleware/authorize");
const authLimit = require('../middleware/rateLimite')

router.get(
  "/users",
  authentication,
  ownerShip,
  authorize("admin"),
  getAllUsers,
);
router.get("/profile/:id", authentication, ownerShip, getUser);
router.post("/auth/register", authLimit, validator(registerShema), registerUser);
router.post("/auth/login", authLimit, validator(loginSchema), loginUser);
router.post("/logout", authentication, logoutUser);
router.post("/auth/refresh", refreshToken);
router.post("/change-password", authentication, changePassword);
router.post("/forgot-password", authLimit, forgotPassword);
router.post("/logout-all", authentication, logoutAll);
router.post("/auth/verify-email", authLimit, verifyEmail);
router.post("/change-role", authentication, authorize("admin"), changeRole);
router.post("/users/:id/role", authentication, authorize("admin"), changeRole);
router.post("/auth/reset-password", resetPassword);
router.get('/sessions', authentication, getSessions)
router.get('/sessions/:id', authentication, getSessions)
router.delete('/sessions/:id', authentication, deleteSession)
router.get('/auth/delete-session/:id', authentication, deleteSession)


module.exports = router;
