"use strict";
const jwt = require("jsonwebtoken");
const db = require("../models/index");
const USER = db.user;
const ROLE = db.role;
const OTP = db.otp;
const TOKEN = db.token;
const PASSWORD= db.password;
const SECRET_KEY = process.env.SECRET_KEY;

const {
  generateOTP,
  hashPassOrOTP,
  comparePasswordOrOtp,
  sendOTPToEmail,
} = require("../utils/utils");

const {
  generateResetToken,
  sendResetLinkToEmail,
} = require("../utils/resetpassword");

const emailRegex = /^[A-Za-z0-9._%+-]+@gmail\.com$/; // regex will be replaced to capgemini
const passwordRegex = /^.{8}$/;

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication routes
 */


/**
 * @swagger
 * /signup:
 *   post:
 *     summary: User registration
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
const sendOtp = async (req, res) => {
                /*roleId*/
  const { email, password,} = req.body;

  try {
    if (!email || !password) {
      throw new Error(`one or more fields required`);
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "this is not a valid email" });
    }

    if(!passwordRegex.test(password)) {
      return res.status(400).json({ error: "enter valid password" });
    }

    const exstingUser = await USER.findOne({
      where: {
        EMAIL_ID: email,
      },
    });

    if (exstingUser) {
      if (exstingUser.IS_VERIFIED) {
        return res
          .status(409)
          .json({ error: "User already exists and has been verified" });
      }

      if (!exstingUser.IS_VERIFIED) {
        return res.status(409).json({
          error: "User exists but is not verified",
          message: "Please verify your account before proceeding.",
        });
      }
    }

  //   const role = await ROLE.findOne({
  //     where: {
  //         ROLE_ID: roleId,
  //     }
  // });
  // if (!role) {
  //     return res.status(409).json({ error: "no role associated" });
  //   }
   
    const hashedPassword = await hashPassOrOTP(password);
    const otp = await generateOTP();
    const hashedOTP = await hashPassOrOTP(otp);

    const user = await USER.create({
      EMAIL_ID: email,
     // ROLE_ID: roleId
    });

    await PASSWORD.create({
      USER_ID: user.USER_ID,
      PASSWORD: hashedPassword,
    });

    await OTP.create({
      USER_ID: user.USER_ID,
      OTP: hashedOTP,
    });

    await sendOTPToEmail(email, otp);

    return res.status(201).json({
      message:
        "Signup successful. Please check your email for OTP verification.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ err: "error detected", message: error.message });
  }
};



/**
 * @swagger
 * /verify:
 *   post:
 *     summary: Verify OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               otp:
 *                 type: string
 *                 description: One-Time Password
 *             required:
 *               - email
 *               - otp
 *     responses:
 *       200:
 *         description: OTP verification successful
 *       400:
 *         description: Bad request
 */

const validateOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      throw new Error(`one or more fields required`);
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "this is not a valid email format" });
    }

    const user = await USER.findOne({
      where: {
        EMAIL_ID: email,
      },
      include: [
        {
          model: ROLE,
          attributes: ['ROLE_NAME'],
        },
      ],
      attributes: ['USER_ID', 'EMAIL_ID'],
    });

    const Otp = await OTP.findOne({
      where: {
        USER_ID: user.USER_ID,
      },
      order: [["CREATED_DATE_TIME", "DESC"]],
    });

    const verifiedOtp = await comparePasswordOrOtp(otp, Otp.OTP);

    if (user && verifiedOtp) {
      await USER.update(
        { IS_VERIFIED: true },
        {
          where: {
            USER_ID: user.USER_ID,
          },
        }
      );

      const token = jwt.sign(
        {
          email: user.EMAIL_ID,
          role: user.ONEVIEW_ROLE.ROLE_NAME,
          userId: user.USER_ID,
        },
        SECRET_KEY,
        { expiresIn: "3h" }
      );

      res.status(200).json({ message: `OTP validated`,user:user, token: token });
    } else {
      res.status(400).json({ message: `incorrect OTP or email` });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ err: "error detected", message: error.message });
  }
};

/**
 * @swagger
 * /resend-otp:
 *   post:
 *     summary: resend OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                
 *             required:
 *               - email
 *              
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Bad request
 */

const resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email || typeof email == "undefined" || email == "") {
      throw new Error(`email required`);
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "this is not a valid email" });
    }

    const user = await USER.findOne({ where: { EMAIL_ID: email } });

    if (user) {
      if (user.IS_VERIFIED) {
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

    await sendOTPToEmail(email, otp);

    return res.status(201).json({
      message: "OTP sent successfully",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "error detected", message: err.message });
  }
};

/**
 * @swagger
 * /signin:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       description: User credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized - Invalid credentials
 */
const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw new Error(`one or more fields required`);
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "this is not a valid email" });
    }

    const user = await USER.findOne({
      where: {
        EMAIL_ID: email,
      },
      include:[{model:PASSWORD,attributes: ['PASSWORD']}],

      // include: [
      //   {
      //     model: ROLE,
      //     attributes: ['ROLE_NAME'],
      //   },
      // ]
    });

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    if (!user.IS_VERIFIED) {
      return res
        .status(400)
        .json({ error: "verify your email before signing in" });
    }
    const matchPassword = await comparePasswordOrOtp(password, user.ONEVIEW_PASSWORD.PASSWORD);

    if (!matchPassword) {
      return res.status(400).json({ error: "invalid password" });
    }

    const token = jwt.sign(
      {
        email: user.EMAIL_ID,
       //  role: user.ONEVIEW_ROLE.ROLE_NAME,
        userId: user.USER_ID,
      },
      SECRET_KEY,
      { expiresIn: "3h" }
    );
    res.status(200).send({token: token });
  } catch (error) {
    console.log(error);
  }
};


/**
 * @swagger
 * /forgot-password:
 *   post:
 *     summary: forgot password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                
 *             required:
 *               - email
 *              
 *     responses:
 *       200:
 *         description: reset email sent successfully
 *       400:
 *         description: Bad request
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      throw new Error("Email is required");
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "This is not a valid email" });
    }

    const user = await USER.findOne({
      where: {
        EMAIL_ID: email,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const token = await generateResetToken();

    await TOKEN.create({
      USER_ID: user.USER_ID,
      TOKEN: token,
    });

    await sendResetLinkToEmail(email, token);

    return res.status(200).json({
      message: "Password reset email has been sent to your email",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Error detected", message: error.message });
  }
};

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: User password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *               token:
 *                 type: string
 *                 description: reset token
 *             required:
 *               - email
 *               - password
 *               - token
 *     responses:
 *       200:
 *         description: password reset successful
 *       400:
 *         description: Bad request
 */
const resetPassword = async (req, res) => {
  const { token, password, email } = req.body;

  try {
    if (!email || !password || !token) {
      throw new Error("missing fields");
    }

    const user = await USER.findOne({ where: { EMAIL_ID: email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const Token = await TOKEN.findOne({
      where: { TOKEN: token, USER_ID: user.USER_ID },
    });

    if (!Token) {
      return res.status(400).json({ error: "invalid token" });
    }

    if(!passwordRegex.test(password)) {
    return res.status(409).json({ error: "password criteria does not match" });
    }
    
    const hashedPassword = await hashPassOrOTP(password);

     await PASSWORD.update(
      { PASSWORD: hashedPassword },
      {
        where: {
          USER_ID: user.USER_ID,
        },
      }
    );

    res
      .status(201)
      .json({ message: "password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "internal server error" });
  }
};

module.exports = {
  sendOtp,
  validateOTP,
  resendOtp,
  signIn,
  forgotPassword,
  resetPassword,
};
