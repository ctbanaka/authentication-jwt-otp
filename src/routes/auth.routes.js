const express = require("express");
let app = express();
let router = require("express").Router();

const auth = require("../controllers/auth.controller");
const roleController = require("../controllers/role.controller");
const { resendOTPLimiter } = require("../middleware/ratelimiter");
const { validateEmail } = require("../middleware/validateemail");
const { authenticate,authorize } = require("../auth/passport");

 

router.post("/signup", auth.sendOtp);
router.post("/verify", auth.validateOTP);
router.post("/resend-otp", validateEmail, resendOTPLimiter, auth.resendOtp);
router.post("/signin", auth.signIn);
router.post("/forgot-password", auth.forgotPassword);
router.post("/reset-password", auth.resetPassword);
router.post("/createrole",roleController.createRole);
router.get("/dummy",authenticate, roleController.protectedapi);
router.get("/role",authenticate, authorize(['randi',]), roleController.protectedrole);


let routes = app.use("/api", router);

module.exports = routes;
 