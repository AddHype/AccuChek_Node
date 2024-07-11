const express = require("express");
const {
  User,
  userJoiSchema,
  userJoiSigninSchema,
} = require("../../models/userModel/user.model");
// const cources = require('../models/courseSchema')
const router = express.Router();
const { Course } = require("../../models/courseModel/course.model");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendOTPTOEmail = require("../../auth/auths.Email");
const OTPModel = require("../../models/userModel/opt");
const {
  deleteStoredOTPFromDatabase,
  getStoredOTPFromDatabase,
  storeOTPInDatabase,
} = require("../../models/userModel/opt.js");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    function generateOTP() {
      const length = 6;
      const charset = "0123456789";
      let otp = "";

      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        otp += charset[randomIndex];
      }
      return otp;
    }

    const generatedOtp = generateOTP();
    sendOTPTOEmail(email, generatedOtp);

    // Store the OTP in the OTP model
    await storeOTPInDatabase(email, generatedOtp, new Date());

    return res.status(200).json({ message: "OTP sent and saved" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send and save OTP" });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Retrieve the stored OTP from the OTP model
    const { storedOtp, otpTimestamp } = await getStoredOTPFromDatabase(email);

    if (!storedOtp) {
      return res.status(404).json({ message: "OTP not found for this email" });
    }

    const currentTime = new Date();
    const otpExpirationTime = new Date(otpTimestamp);
    otpExpirationTime.setMinutes(otpExpirationTime.getMinutes() + 1);

    if (currentTime > otpExpirationTime) {
      return res.status(410).json({ message: "OTP has expired" });
    }

    if (otp === storedOtp) {
      deleteStoredOTPFromDatabase(email);

      return res.status(200).json({ message: "OTP verified successfully" });
    } else {
      return res.status(401).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

const userRegister = async (req, res) => {
  const { error } = userJoiSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const { name, email, password, country, confirm_password, language } =
      req.body;

    // Check if the email exists in the database
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      return res
        .status(422)
        .json({ error: "This email is already registered" });
    }

    const image = req.file.filename;
    const newUser = new User({
      name,
      email,
      password,
      country,
      confirm_password,
      language,
      image,
      points: 0,
    });
    await newUser.save();
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add user" });
  }
};

// User Sign in
const userSigin = async (req, res) => {
  const { error } = userJoiSigninSchema.validate(req.body);
  if (error) {
    return res.status(404).json({ error: error.details[0].message });
  }

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Not Empty Fields allowed" });
    }

    const userLogin = await User.findOne({ email: email });

    if (userLogin) {
      const isMatched = await bcrypt.compare(password, userLogin.password);

      if (!isMatched) {
        return res.status(400).json({ message: "Invalid Credentials" });
      } else {
        const token = jwt.sign(
          {
            userId: userLogin._id,
            userName: userLogin.name,
            userImage: userLogin.image,
            userPoints: userLogin.points,
          },
          "pakistan009",
          {
            expiresIn: "1h",
          }
        );

        return res.status(200).json({
          message: "User Login Successfully",
          token: token,
          userId: userLogin._id,
          name: userLogin.name,
          image: userLogin.image,
          points: userLogin.points,
        });
      }
    } else {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const userInfo = async (req, res) => {
  try {
    const { _id } = req.params;
    const updateFields = { ...req.body };

    // Check if a new image is uploaded
    if (req.file) {
      updateFields.image = req.file.filename;
    }

    // Use findByIdAndUpdate with { new: true } to return the updated document
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { $set: updateFields },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error while updating user profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// const updateGameStatus = async (req, res) => {
//   try {
//     const result = await Course.updateOne(
//       { _id: req.params._id },
//       { $set: req.body }
//     );
//     res.send(result);
//   } catch (error) {
//     console.error("Error while updating game status", error);
//     res.status(500).json({ error: "Failed to update game status" });
//   }
// };
const updateGameStatus = async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    const { progress } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const course = user.course.find((c) => c.courseId === courseId);

    if (!course) {
      // Add the course to the user's course array if it doesn't exist
      user.course.push({
        courseId,
        progress,
        courseStatus: false,
      });
    } else {
      // Update the progress of the existing course
      course.progress = progress;
    }

    await user.save();

    res.send({ message: "Course progress updated successfully" });
  } catch (error) {
    console.error("Error while updating game status", error);
    res.status(500).json({ error: "Failed to update game status" });
  }
};

const getAllCourses = async (req, res) => {
  try {
    console.log(req.params);
    const { userId } = req.params;

    // Fetch all courses
    const courses = await Course.find();

    // Fetch user's courses progress
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create a map for user's course progress
    const userCoursesMap = new Map();
    user.course.forEach((c) => {
      userCoursesMap.set(c.courseId, c.progress);
    });

    // Add progress information to courses
    const coursesWithProgress = courses.map((course) => {
      const courseId = course._id.toString();
      const progress = userCoursesMap.get(courseId) || 0;
      return {
        ...course.toObject(),
        progress,
      };
    });

    res.json(coursesWithProgress);
  } catch (error) {
    console.error("Error while fetching courses", error);
    res.status(500).json({ error: "INTERNAL SERVER ERROR" });
  }
};

// Get All Users
const getMembers = async (req, res) => {
  let data = await User.find();
  console.log(data);
  data.length > 0 ? res.send(data) : res.send("No data");
};

// Dell Member
const dellMember = async (req, res) => {
  let dellCoourse = await User.deleteOne({ _id: req.params._id });
  if (dellCoourse) {
    res.status(201).json({ message: "Successfully Member Delete" });
  } else {
    res.status(201).json({ message: "Error while deleted User" });
  }
};

//Update User Info
const updateSingleMember = async (req, res) => {
  let result = await User.updateOne(
    { _id: req.params._id },
    { $set: req.body }
  );
  res.send(result);
};

//get Single User
const getSingleMember = async (req, res) => {
  let result = await User.findOne({ _id: req.params.id });
  res.send(result);
};

// get Cources whos has status false
const getFalseStausCources = async (req, res) => {
  try {
    let data = await Course.find({ status: false });
    console.log(data);
    data.length > 0 ? res.send(data) : res.send("No data");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

// get Cources whos has status false
const getTrueStausCources = async (req, res) => {
  try {
    let data = await Course.find({ status: true });
    console.log(data);
    data.length > 0 ? res.send(data) : res.send("No data");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

//insert course detail in user
const setCourseInUser = async (req, res) => {
  try {
    const { courseId, userId } = req.params;

    // Step 2: Find the user based on userId
    const user = await User.findById(userId);
    const existingCourse = user.course.find(
      (course) => course.courseId === courseId
    );

    if (existingCourse) {
      // If courseId is found, update courseStatus
      existingCourse.courseStatus = true;
    } else {
      // If courseId is not found, add a new course object
      user.course.push({ courseId, courseStatus: true });
    }
    await user.save();

    return res
      .status(200)
      .json({ message: "Course status updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//get True Status of Courses from User
const getTrueCoursesFromUser = async (req, res) => {
  try {
    // Step 1: Find the user based on userId
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Step 2: Extract courseId values
    const courseIds = user.course.map((course) => course.courseId);

    // Step 3: Retrieve corresponding courses from Course table
    const coursesFromCourseTable = await Course.find({
      _id: { $in: courseIds },
    });

    return res.send(coursesFromCourseTable);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getCourseStatus = async (req, res) => {
  try {
    const { courseId, userId } = req.params;
    // Step 1: Find the user based on userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const courseExists = user.course.some(
      (course) => course.courseId === courseId
    );

    if (courseExists) {
      return res.status(200).json({ statusCourse: true });
    } else {
      return res.status(200).json({ statusCourse: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// quizQustions Api with id passsed
// getQuizQustions with id
const getCourseQuiaData = async (req, res) => {
  // try {
  //   let result = await Course.findOne({ _id: req.params.id });
  //   res.send([result]);
  //   console.log(result);
  // } catch (error) {
  //   console.error(error);
  //   res.status(404).json({ message: 'Course not found' });
  // }
};

const frogotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.RESET_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 3600000;

    await user.save();

    await sendResetEmail(email, resetToken);

    return res.json({ resetToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    const decodedToken = jwt.verify(resetToken, process.env.RESET_TOKEN_SECRET);

    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const sendResetEmail = async (email, resetToken) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ayanmali358@gmail.com",
      pass: "sidwwvtdklhlkhlw",
    },
  });

  const mailOptions = {
    from: "<your-email@gmail.com>",
    to: email,
    subject: "Password Reset",
    html: `<p>Click the following link to reset your password: <a href="http://localhost:3000/ForgotPassword${resetToken}">Reset Password</a></p>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  updateGameStatus,
  getCourseQuiaData,
  sendOTP,
  verifyOTP,
  userRegister,
  userSigin,
  getMembers,
  dellMember,
  updateSingleMember,
  getSingleMember,
  getFalseStausCources,
  getTrueStausCources,
  userInfo,
  getCourseStatus,
  setCourseInUser,
  getTrueCoursesFromUser,
  frogotPassword,
  resetPassword,
  getAllCourses,
};
