const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'ayanmali358@gmail.com',
    pass: 'sidwwvtdklhlkhlw',
  },
});
transporter.verify().then(console.log).catch(console.error);

 transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'ayanmali358@gmail.com',
      pass: 'sidwwvtdklhlkhlw',
  },
});

const emailContent = `
<html>
  <head>
    <style>
      /* Add CSS styles here */
      *{
         background: linear-gradient(
          95deg,
          #8eb927 15%,
          #82b939 17%,
          #66ba67 23%,
          #4fbc8c 28%,
          #3dbca9 34%,
          #30bdbe 39%,
          #28bdca 45%,
          #26becf 50%
        ) !important; 
      }
      body {
        font-family: Arial, sans-serif;
      }
      .header {
        text-align: center;
      }
      .header img {
        width: 150px; /* Adjust the image size as needed */
      }
      .content {
        background-color: #ffffff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
      }
    </style>
  </head>
  <body>
    <div class="header">
      <img src="https://seeklogo.com/images/R/Roche-logo-A80FCF9553-seeklogo.com.png" alt="Your Logo">
      <h1>AccuChek</h1>
      <div style="line-height: 150%; text-align: center;"><span style="font-size: 30px; font-family: Tahoma, Arial, Helvetica, 
      sans-serif; color: #bd3e3d; line-height: 150%;"><strong>Verify your account </strong></span></div>
    </div>
    <div
     style="border-radius: 20px; border: 7px dotted rgb(126, 42, 41); text-align: center; border-collapse: separate; 
     background-color: rgb(88, 29, 28);font-family: Arial,Helvetica,sans-serif; font-size: 14px; padding-top:20px;padding-bottom:20px;
      padding-left:40px; padding-right:40px;font-weight:bold;" class="bmeButtonText"><span style="font-family: Tahoma, Arial, Helvetica,
       sans-serif; font-size: 20px; color: rgb(255, 255, 255);"><a style="color: rgb(255, 255, 255); text-decoration: none;"
        target="_blank">OTP CODE: 09388</a></span> 
    </div>
    <div class="content">
      <h2>Service Update</h2>
      <p>Dear valued customer,</p>
      <p>There is a new article available on our website. Check it out!</p>
      <a href="google.com">Read the Article</a>
    </div>
  </body>
</html>
`;

const mailOptions = {
  from: '"AccuChek" ayanmali358@gmail.com', 
  // to: 'mhamzazia2@gmail.com',
  to:'email',

  subject: 'Registration ✔', 
  // html: emailContent, 
};

transporter.sendMail(mailOptions)
.then(info => {
  console.log('Email sent:', info.response);
})
.catch(error => {
  console.error('Error sending email:', error);
});

// Function to send OTP to the provided email
const sendOTPToEmail = (email, otp) => {
  const mailOptions = {
    from: "ayanmali358@gmail.com",
    to: email,
    subject: "OTP for Account Verification AccuChek",
    text: `Your OTP code is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
};

module.exports = sendOTPToEmail;
