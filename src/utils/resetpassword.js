const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Generator = require("otp-generator");
const AWS = require("aws-sdk");


exports.generateResetToken = async () => {
    return await Generator.generate(15, {
      lowerCaseAlphabets: true,
      upperCaseAlphabets: true,
      specialChars: false,
    });
  };

  exports.sendResetLinkToEmail = async (email, resetToken) => {
    const transporter = nodemailer.createTransport({
      host: process.env.MYHOST,
      port: process.env.MYPORT,
      secure: true,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
  
      // host: "smtp.eu-west-1.amazonaws.com",
      // port: 587,
      // secure: false,
      // auth: {
      //   user: "AKIA5UBY6HKUCO5UOYZJ",
      //   pass: "BJfCgxW4jAqwXslM3EALs8GDxasvj18zRz45WhOUtc7a",
      // },
    });
  
    const mailOptions = {
      from:"chetankumar@legituser.com",
      to: email,
      subject: "OneView Password Reset link",
      html: `<!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
          
              body, body * {
                  box-sizing: border-box;
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
              }
              
              
              body {
                  background-color: #f7f7f7;
                  color: #333333;
              }
              
              .container {
                  width: 100%;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
              }
              
              .header {
                  text-align: center;
                  margin-bottom: 30px;
              }
              
              .header h1 {
                  color: #555555;
                  margin-bottom: 10px;
              }
              
              .content {
                  background-color: #ffffff;
                  padding: 30px;
              }
              
              .footer {
                  text-align: center;
                  margin-top: 30px;
                  color: #777777;
              }
              
              .button {
                display: inline-block;
                margin-top: 20px;
                padding: 10px 20px;
                background-color: #03a9f4;
                color: #ffffff;
                text-decoration: none;
                border-radius: 4px;
            }
              
              @media (max-width: 600px) {
                  .container {
                      padding: 10px;
                  }
                  
                  .header h1 {
                      font-size: 24px;
                  }
                  
                  .content {
                      padding: 20px;
                  }
                  
                  .footer {
                      margin-top: 20px;
                      font-size: 12px;
                  }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Reset Password</h1>
              </div>
              
              <div class="content">
                  <p>Hi,</p>
                  <p>Your Password Reset Link:</p>
                  <a class="button" href="http://localhost:4200/resetpassword?token=${resetToken}&email=${email}">Reset Password</a>
                  <p>Please use this link to reset Password.</p>
              </div>
              
              <div class="footer">
                  <p>Sent from OneView team</p>
              </div>
          </div>
      </body>
      </html>
      `,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log("OTP email sent successfully");
    } catch (error) {
      console.error("Error sending OTP email:", error);
      throw new Error("Error in sending OTP");
    }
  };