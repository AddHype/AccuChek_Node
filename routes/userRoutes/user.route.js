const express = require("express");
const router = express.Router();
const {
  updateGameStatus,
  getCourseQuiaData,
  sendOTP,
  verifyOTP,
  userRegister,
  userSigin,
  setCourseInUser,
  getTrueCoursesFromUser,
  getMembers,
  dellMember,
  updateSingleMember,
  getSingleMember,
  getFalseStausCources,
  getTrueStausCources,
  userInfo,
  getCourseStatus,
  resetPassword,
  frogotPassword,
} = require("../../controllers/userControllers/user.controllers");
const multer = require("multer");
const userController = require("../../controllers/userControllers/user.controllers");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });
router.post("/userRegister", upload.single("image"), userRegister);

router.route("/sendOTP").post(sendOTP);
router.route("/verifyOTP").post(verifyOTP);

router.put("/userInfo/:_id", upload.single("image"), userInfo);
router.route("/updateGameStatus/:_id").put(updateGameStatus);
router.route("/addCourseInUser/:userId/:courseId").post(setCourseInUser);
router.route("/getTrueCoursesFromUser/:id").get(getTrueCoursesFromUser);

router.route("/userSigin").post(userSigin);
router.route("/getCourseStatus/:userId/:courseId").get(getCourseStatus);
router.route("/getMembers").get(getMembers);
router.route("/dellMember/:_id").delete(dellMember);

router.route("/getFalseStausCources").get(getFalseStausCources);
router.route("/getTrueStausCources").get(getTrueStausCources);
// Update Member
router.route("/updateSingleMember/:_id").put(updateSingleMember);
// Firt Get Member according to id
router.route("/getSingleMember/:id").get(getSingleMember);

// getCourse Single course
router.route("/getCourseQuiaData/:id").get(getCourseQuiaData);
//
// frogotpassword
router.route("/api/forgotPassword").post(frogotPassword);
//
// Rest
router.route("/api/resetPassword").post(resetPassword);

module.exports = router;
