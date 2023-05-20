"use strict";
const jwt = require("jsonwebtoken");
const db = require("../models/index");
const USER = db.user;
const ROLE = db.role;
const OTP = db.otp;
const SECRET_KEY = process.env.SECRET_KEY;
const {generateOTP,hashPassOrOTP,comparePasswordOrOtp,sendOTPToEmail} = require("../utils/utils");

const sendOtp = async (req, res) => {
  const { email, password } = req.body;

  // const emailRegex = /^[A-Za-z0-9._%+-]+@capgemini\.com$/;
  try {
    // if (!emailRegex.test(email)) {
    //   return res.status(400).json({ error: "this is not a valid email" });
    // }

    const exstingUser = await USER.findOne({
      where: {
        EMAIL_ID: email,
      },
    });

    if (exstingUser) {
      if (exstingUser.isVERIFIED) {
        return res
          .status(409)
          .json({ error: "User already exists and has been verified" });
      }

      if (!exstingUser.isVERIFIED) {
        return res.status(409).json({
          error: "User exists but is not verified",
          message: "Please verify your account before proceeding.",
        });
      }
    }

    const otp = await generateOTP();
    const hashedOTP = await hashPassOrOTP(otp);
    const hashedPassword = await hashPassOrOTP(password);

    const user = await USER.create({
      EMAIL_ID: email,
      PASSWORD: hashedPassword,
    });

     await OTP.create({
      USER_ID: user.USER_ID,
      OTP: hashedOTP,
    });

    await sendOTPToEmail(email,otp);

    return res.status(201).json({
        message:
          "Signup successful. Please check your email for OTP verification.",
      });
  } catch (error) {
    return res.status(500).json({ err: "error detected",message: error.message });
  }
};

const validateOTP= async (req, res) => {
  const { email, otp } = req.body;
 
  try {
    const user = await USER.findOne({
      where: {
      EMAIL_ID: email,
    }
  });

  const Otp= await OTP.findOne({
    where:{
      USER_ID: user.USER_ID
    },
    order: [['CREATED_DATE_TIME', 'DESC']],
  });
 
  const verifiedOtp = await comparePasswordOrOtp(otp, Otp.OTP);

  if(user && verifiedOtp){
     await USER.update(
      {isVERIFIED: true},
      {
        where: {
        USER_ID: user.USER_ID,
      }}
     );

     const token = jwt.sign(
      {
        email: user.EMAIL_ID,
       // role: user.ROLE_ID,
        userId: user.USER_ID,
      },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message:`OTP validated`,token:token})
  } else {
    res.status(400).json({ message:`incorrect OTP or email address`})
  }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ err: "error detected",message: error.message });
  }

};

const resendOtp = async (req, res) => { 
   const {email} = req.body;
  try{
   const user = await USER.findOne({ where:{EMAIL_ID: email}});

   if (user) {
    if (user.isVERIFIED) {
      return res
        .status(409)
        .json({ error: "User already exists and has been verified" });
    }
  } else {
    return res
    .status(409)
    .json({ error: ` account not found with ${email}` });
  }

  const otp = await generateOTP();
  const hashedOTP = await hashPassOrOTP(otp); 

  await OTP.create({
    USER_ID: user.USER_ID,
    OTP: hashedOTP,
  });

  await sendOTPToEmail(email,otp);
 
  return res.status(201).json({
    message:
      "OTP sent successfully",
  });
  }catch(err) {
    return res.status(500).json({ error: "error detected",message: err.message });
  };

};

const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await USER.findOne({
        // include: [{
        //     model: ROLE,
        //     attributes: ['ROLE_ID', 'ROLE_NAME'] 
        //   }],
      where: {
        EMAIL_ID: email,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    const matchPassword = await bcrypt.compare(password, user.PASSWORD);

    if (!matchPassword) {
      return res.status(400).json({ error: "invalid password" });
    }

    const token = jwt.sign(
      {
        email: user.EMAIL_ID,
       // role: user.ROLE_ID,
        userId: user.USER_ID,
      },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.status(200).send({ user: user, token: token });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { sendOtp, validateOTP,resendOtp, signIn };
