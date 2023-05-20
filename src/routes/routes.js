const express = require("express");
let app = express();
let router= require('express').Router();

const auth= require('../controllers/auth.controller');

router.post('/signup', auth.sendOtp);
router.post('/verify', auth.validateOTP)

let routes=app.use("/api", router);

module.exports = routes;