"use strict";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../models/index");
const otpGenerator = require('otp-generator');
const USER = db.user;
const ROLE = db.role;
const OTP = db.otp;
const SECRET_KEY = process.env.SECRET_KEY;

const signup = async (req, res,) => {
  const {email, password, roleId, createdby, modifiedby} = req.body;
  try {
    const user = await USER.findOne({
      where: {
        EMAIL_ID: email,
      },
    });
    if (user) {
      return res.status(403).json({ error: "User already exists" });
    }
    const role = await ROLE.findOne({
        where: {
            ROLE_ID: roleId,
        }
    });
    if (!role) {
        return res.status(409).json({ error: "no role associated" });
      }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await USER.create({
      EMAIL_ID: email,
      PASSWORD: hashedPassword,
      ROLE_ID: roleId,
      CREATED_BY: createdby,
      MODIFY_BY: modifiedby,
    });

    const token = jwt.sign(
      {
        email: result.EMAIL_ID,
        roleId: result.ROLE_ID,
        EMPLOYEE_TRG_ID: result.EMPLOYEE_TRG_ID,
      },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(201).send({ user: result, token: token });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "internal error" });
  }
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

 
const protectedapi = (req, res) => {
  return res.status(200).send(`accessed with token`);
};

const protectedrole = (req, res) => {
  return res.status(200).send(`accessed with token and role`);
};

const sendOtp= (req, res) => {

};

module.exports = { signup, signin, protectedapi, protectedrole };
