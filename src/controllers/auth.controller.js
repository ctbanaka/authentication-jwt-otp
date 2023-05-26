"use strict";
const jwt = require("jsonwebtoken");
const db = require("../models/index");
const USER = db.user;
const ROLE = db.role;
const OTP = db.otp;
const TOKEN = db.token;
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

const sendOtp = async (req, res) => {
  const { email, password,roleId } = req.body;

  try {
    if (!email || !password) {
      throw new Error(`one or more fields required`);
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "this is not a valid email" });
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

    const role = await ROLE.findOne({
      where: {
          ROLE_ID: roleId,
      }
  });
  if (!role) {
      return res.status(409).json({ error: "no role associated" });
    }
   
    const hashedPassword = await hashPassOrOTP(password);
    const otp = await generateOTP();
    const hashedOTP = await hashPassOrOTP(otp);

    const user = await USER.create({
      EMAIL_ID: email,
      PASSWORD: hashedPassword,
      ROLE_ID: roleId
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
      res.status(400).json({ message: `incorrect OTP` });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ err: "error detected", message: error.message });
  }
};



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

const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw new Error(`one or more fields required`);
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
      ]
    });

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    if (!user.IS_VERIFIED) {
      return res
        .status(400)
        .json({ error: "verify your email before signing in" });
    }

    const matchPassword = await comparePasswordOrOtp(password, user.PASSWORD);

    if (!matchPassword) {
      return res.status(400).json({ error: "invalid password" });
    }

    const token = jwt.sign(
      {
        email: user.EMAIL_ID,
         role: user.ONEVIEW_ROLE.ROLE_NAME,
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

    // i will later
    // if(password.length <7)
    // return res.status(409).json({ error: "invalid password" });

    const hashedPassword = await hashPassOrOTP(password);

     await USER.update(
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
