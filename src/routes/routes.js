const express = require("express");
let app = express();
let router= require('express').Router();

const auth= require('../controllers/auth.controller');
const { resendOTPLimiter } = require("../middleware/ratelimiter");

router.post('/signup', auth.sendOtp);
router.post('/verify', auth.validateOTP);
router.post('/resend-otp',resendOTPLimiter, auth.resendOtp);
router.post('/signin', auth.signIn);

let routes=app.use("/api", router);

module.exports = routes;