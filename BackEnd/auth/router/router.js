const express = require("express");
const authRouter = express.Router();
const validator = require("../middleware/validator");
const registerShema = require("../schema/registerSchema");
const loginSchema = require("../schema/loginSchema");
const verifyEmailSchema = require("../schema/verifyEmailSchema");
const updateProfileSchema = require("../schema/updateProfileSchema");
const driverApplicationSchema = require("../schema/driverApplicationSchema");
const roleChangeSchema = require("../schema/roleChangeSchema");
const accountStatusSchema = require("../schema/accountStatusSchema");
const resetPasswordSchema = require("../schema/resetPasswordSchema");
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
const { getSettings, updateSetting } = require('../controller/settingsController')
const updateSettingsSchema = require('../schema/updateSettingsSchema')

authRouter.get('/settings/me', authentication, getSettings);
authRouter.patch('/settings/me', authentication, validator(updateSettingsSchema), updateSetting);
authRouter.get("/users",authentication,authorize("admin"),getAllUsers);
authRouter.get("/admin/users", authentication, authorize("admin"), listAdminUsers);
authRouter.post("/driver-applications", authentication, validator(driverApplicationSchema), submitDriverApplication);
authRouter.get("/driver-applications/me", authentication, getDriverApplication);
authRouter.patch("/admin/driver-applications/:userId/approve", authentication, authorize("admin"), approveDriverApplication);
authRouter.patch("/admin/driver-applications/:userId/reject", authentication, authorize("admin"), rejectDriverApplication);
authRouter.patch("/admin/users/:id/status", authentication, authorize("admin"), validator(accountStatusSchema), updateAccountStatus);
authRouter.get("/profile/:id", authentication, getUser);
authRouter.patch("/profile/:id", authentication, ownerShip, avatarUpload, validator(updateProfileSchema), updateUser);
authRouter.get('/users/:id/block', authentication, getUserBlockStatus);
authRouter.put('/users/:id/block', authentication, updateUserBlock);
authRouter.delete('/users/:id/block', authentication, updateUserBlock);
authRouter.get('/direct-messages', authentication, directMessages.listConversations);
authRouter.get('/direct-messages/unread-count', authentication, directMessages.getUnreadCount);
authRouter.get('/direct-messages/:userId', authentication, directMessages.getConversation);
authRouter.post('/direct-messages/:userId', authentication, directMessages.createMessage);
authRouter.post("/auth/register", authLimit, validator(registerShema), registerUser);
authRouter.post("/auth/login", authLimit, validator(loginSchema), loginUser);
authRouter.post("/logout", authentication, logoutUser);
authRouter.post("/auth/refresh", refreshToken);
authRouter.post("/change-password", authentication, changePassword);
authRouter.post("/forgot-password", authLimit, forgotPassword);
authRouter.post("/logout-all", authentication, logoutAll);
authRouter.post("/auth/verify-email", authLimit, validator(verifyEmailSchema), verifyEmail);
authRouter.post("/users/:id/role", authentication, authorize("admin"), validator(roleChangeSchema), changeRole);
authRouter.post("/auth/reset-password", authLimit, validator(resetPasswordSchema), resetPassword);
authRouter.get('/sessions', authentication, getSessions)
authRouter.get('/sessions/:id', authentication, getSessions)
authRouter.delete('/sessions/:id', authentication, deleteSession)
authRouter.get('/auth/delete-session/:id', authentication, deleteSession)

module.exports = authRouter;