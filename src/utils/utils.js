
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const AWS = require('aws-sdk');


exports.generateOTP = async () => {
  return await otpGenerator.generate(6, {lowerCaseAlphabets: false,upperCaseAlphabets:false, specialChars: false }); 
};

exports.sendOTPToEmail = async (email, otp) => {

  const transporter = nodemailer.createTransport({

   host: process.env.MYHOST,
   port:process.env.MYPORT,
   secure:true,
   auth:{
    user: process.env.USER,
    pass: process.env.PASS
   }
 
    // SES: new AWS.SES({
    //   apiVersion: "2010-12-01",
    //   accessKeyId: "AKIA5UBY6HKUCO5UOYZJ",
    //   secretAccessKey: "BJfCgxW4jAqwXslM3EALs8GDxasvj18zRz45WhOUtc7a",
    //   region: "eu-west-1",
    // })
   
  });

  const mailOptions = {
    from: "hellofrom@legituser.com",
    to: email,
    subject: 'OTP Verification',
    text: `Your OTP for email verification is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully');
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Error in sending OTP');
  }
};

exports.hashPassOrOTP = async (pass) => {
  const saltRounds = 10;
  return await bcrypt.hash(pass, saltRounds);
};

exports.comparePasswordOrOtp = async (pass, hashedPass) => {
  return await bcrypt.compare(pass, hashedPass);
};
