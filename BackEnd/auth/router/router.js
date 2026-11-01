const express = require("express");
const router = express.Router();
const validator = require("../middleware/validator");
const registerShema = require("../schema/registerSchema");
const loginSchema = require("../schema/loginSchema");
const verifyEmailSchema = require("../schema/verifyEmailSchema");
const updateProfileSchema = require("../schema/updateProfileSchema");
const driverApplicationSchema = require("../schema/driverApplicationSchema");
const roleChangeSchema = require("../schema/roleChangeSchema");
const accountStatusSchema = require("../schema/accountStatusSchema");
const {
  loginUser,
  registerUser,
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
  deleteSession,
} = require("../controller/authControls");
const { submitDriverApplication, getDriverApplication } = require("../controller/driverApplicationController");
const { listAdminUsers, approveDriverApplication, rejectDriverApplication, updateAccountStatus } = require("../controller/adminController");
const authentication = require("../middleware/authentication");
const ownerShip = require("../middleware/ownerShip");
const authorize = require("../middleware/authorize");
const authLimit = require('../middleware/rateLimite')
const avatarUpload = require('../middleware/avatarUpload')
const { getUserBlockStatus, updateUserBlock } = require('../controller/userBlockController')
const directMessages = require('../controller/directMessageController')

router.get("/users",authentication,ownerShip,authorize("admin"),getAllUsers);
router.get("/admin/users", authentication, authorize("admin"), listAdminUsers);
router.post("/driver-applications", authentication, validator(driverApplicationSchema), submitDriverApplication);
router.get("/driver-applications/me", authentication, getDriverApplication);
router.patch("/admin/driver-applications/:userId/approve", authentication, authorize("admin"), approveDriverApplication);
router.patch("/admin/driver-applications/:userId/reject", authentication, authorize("admin"), rejectDriverApplication);
router.patch("/admin/users/:id/status", authentication, authorize("admin"), validator(accountStatusSchema), updateAccountStatus);
router.get("/profile/:id", authentication, ownerShip, getUser);
router.patch("/profile/:id", authentication, ownerShip, avatarUpload, validator(updateProfileSchema), updateUser);
router.get('/users/:id/block', authentication, getUserBlockStatus);
router.put('/users/:id/block', authentication, updateUserBlock);
router.delete('/users/:id/block', authentication, updateUserBlock);
router.get('/direct-messages', authentication, directMessages.listConversations);
router.get('/direct-messages/unread-count', authentication, directMessages.getUnreadCount);
router.get('/direct-messages/:userId', authentication, directMessages.getConversation);
router.post('/direct-messages/:userId', authentication, directMessages.createMessage);
router.post("/auth/register", authLimit, validator(registerShema), registerUser);
router.post("/auth/login", authLimit, validator(loginSchema), loginUser);
router.post("/logout", authentication, logoutUser);
router.post("/auth/refresh", refreshToken);
router.post("/change-password", authentication, changePassword);
router.post("/forgot-password", authLimit, forgotPassword);
router.post("/logout-all", authentication, logoutAll);
router.post("/auth/verify-email", authLimit, validator(verifyEmailSchema), verifyEmail);
router.post("/users/:id/role", authentication, authorize("admin"), validator(roleChangeSchema), changeRole);
router.post("/auth/reset-password", resetPassword);
router.get('/sessions', authentication, getSessions)
router.get('/sessions/:id', authentication, getSessions)
router.delete('/sessions/:id', authentication, deleteSession)
router.get('/auth/delete-session/:id', authentication, deleteSession)

module.exports = router;