const express = require("express");
const {
  Products,
  productsJoiSchema,
} = require("../../models/productModel/product.model");
const {
  Course,
  courseJoiSchema,
} = require("../../models/courseModel/course.model");
const {
  admin,
  adminJoiSchema,
} = require("../../models/adminModel/admin.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const app = express();

const adminSigin = async (req, res) => {
  const { error } = adminJoiSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Not Empty Fields" });
    }

    const adminLogin = await admin.findOne({ email: email });

    if (adminLogin) {
      const isMatched = await bcrypt.compare(password, adminLogin.password);

      if (!isMatched) {
        return res.status(400).json({ message: "Invalid Credentials" });
      } else {
        // If credentials are validate true then, generate a JWT token here
        const token = jwt.sign({ adminId: adminLogin._id }, "pakistan009", {
          expiresIn: "1h", // Token will expire in 1 hour
        });
        console.log(token);
        // Set the token as an HTTP-only cookie
        res.cookie("jwtToken", token, {
          maxAge: 3600000, // Token expiration time in milliseconds (1 hour)
          httpOnly: true,
        });

        res.json({ message: "Login Successful" });
      }
    } else {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// admin Register
const adminRegister = async (req, res) => {
  const { error } = adminJoiSchema.validate(req.body);
  if (error) {
    return res.status(404).json({ error: error.details[0].message });
  }
  try {
    const { email, password } = req.body;
    const adminExists = await admin.findOne({ email: email });
    if (adminExists) {
      return res.status(422).json({ error: "Email already exists" });
    } else {
      const adminC = new admin({ email, password });
      // Encrypt the password befor saved
      await adminC.save();
      res.status(201).json({ message: "Successfully admin created" });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: "Something went wrong" });
  }
};

// const addCources = async (req, res) => {
//   try {
//     console.log(
//       "addCourse data: ",
//       req.body.name,
//       req.body.id,
//       req.body.description,
//       req.body.points,
//       req.body.status,
//       req.body.duration,
//       req.body.url,
//       req.body.questions,
//       req.body.kill_course,
//       req.body.accu_men,
//       req.body.marquee_test,
//       req.body.spinWheel_test
//     );
//     const {
//       name,
//       id,
//       description,
//       points,
//       status,
//       duration,
//       url,
//       questions,
//       kill_course,
//       accu_men,
//       marquee_test,
//       spinWheel,
//     } = req.body;
//     const courseExists = await Course.findOne({ id: id });

//     if (courseExists) {
//       return res.status(422).json({ error: "This course already exists" });
//     }

//     const image = req.file.filename;
//     const newCourse = new Course({
//       name,
//       id,
//       description,
//       points,
//       status,
//       duration,
//       url,
//       image,
//       questions: JSON.parse(questions),
//       kill_course: JSON.parse(kill_course),
//       accu_men: JSON.parse(accu_men),
//       marquee_test: JSON.parse(marquee_test),
//       spinWheel_test: JSON.parse(spinWheel),
//     });

//     await newCourse.save();

//     res.status(201).json({
//       success: true,
//       message: "Course added successfully",
//       course: newCourse,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to add course" });
//   }
// };

const addCources = async (req, res) => {
  try {
    console.log(req.body);
    const { name, id, description, points, status, duration, url } = req.body;
    const courseExists = await Course.findOne({ id: id });

    if (courseExists) {
      return res.status(422).json({ error: "This course already exists" });
    }

    const image = req.file.filename;
    const newCourse = new Course({
      name,
      id,
      description,
      points,
      status,
      duration,
      url,
      image,
    });

    await newCourse.save();

    res.status(201).json({
      success: true,
      message: "Course added successfully",
      course: newCourse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add course" });
  }
};

const addChapterInCourse = async (req, res) => {
  try {
    console.log(req.body);
    const {
      id,
      name,
      permission,
      description,
      questions,
      kill_course,
      accu_men,
      marquee_test,
      spinWheel_test,
    } = req.body;
    const image = req.file.filename;
    const existingCourse = await Course.findOne({ id: id });

    if (!existingCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    const newChapter = {
      name,
      videoUrl: image,
      permission,
      description,
      questions: JSON.parse(questions),
      kill_course: JSON.parse(kill_course),
      accu_men: JSON.parse(accu_men),
      marquee_test: JSON.parse(marquee_test),
      spinWheel_test: JSON.parse(spinWheel_test),
    };

    existingCourse.chapters.push(newChapter);
    await existingCourse.save();

    res.status(200).json({
      success: true,
      message: "Chapter added successfully",
      course: existingCourse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add chapter" });
  }
};

module.exports = { addChapterInCourse };

// Add product Images in db
const addProduct = async (req, res) => {
  try {
    const { title, id, description, points, category } = req.body;
    const productExict = await Products.findOne({ id: id });

    if (productExict) {
      return res.status(422).json({ error: "Product id already exists" });
    } else {
      let image = req.file.filename;
      let newProducts = new Products({
        title,
        id,
        description,
        points,
        category,
        image,
      });
      // Return true if product add return fale if not sucessfull
      console.log(newProducts instanceof Products);
      await newProducts.save();
      res.status(201).send({
        success: true,
        message: "Product added successfully",
        Products: Products,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add Product" });
  }
};

// Get all products from DB
const getProducts = async (req, res) => {
  let data = await Products.find();
  console.log(data);
  data.length > 0 ? res.send(data) : res.send("<h1>No data</h1>");
};

// Delete Product from DB
const dellProduct = async (req, res) => {
  let dellCoourse = await Products.deleteOne({ _id: req.params._id });
  if (dellCoourse) {
    res.status(201).json({ message: "Successfully Product Delete" });
  } else {
    res.status(201).json({ message: "Error while deleted" });
  }
};

const updateSingleProduct = async (req, res) => {
  let result = await Products.updateOne(
    { _id: req.params._id },
    { $set: req.body }
  );
  res.send(result);
};

// get Single Product Update
const getSingleProduct = async (req, res) => {
  let result = await Products.findOne({ _id: req.params.id });
  res.send(result);
};

// Cources Operation

// Get All Cources
const getCources = async (req, res) => {
  let data = await Course.find();
  console.log(data);
  data.length > 0 ? res.send(data) : res.send("No data");
};

const dellCource = async (req, res) => {
  let dellCoourse = await Course.deleteOne({ _id: req.params._id });
  if (dellCoourse) {
    res.status(201).json({ message: "Successfully Course Delete" });
  } else {
    res.status(201).json({ message: "Cource is not deleted" });
  }
};
// Update Cource
const updateCource = async (req, res) => {
  let result = await Course.updateOne(
    { _id: req.params._id },
    { $set: req.body }
  );
  res.send(result);
};

const getSingleCourse = async (req, res) => {
  try {
    let result = await Course.findOne({ _id: req.params.id });
    res.send([result]);
    console.log(result);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "Course not found" });
  }
};

const getSingleCourseGame = async (req, res) => {
  try {
    let result = await Course.findOne({ _id: req.params.id });
    res.send(result);
    console.log(result);
  } catch (error) {
    console.error(error);
    res.status(404).json({ message: "Course not found" });
  }
};

module.exports = {
  getSingleCourseGame,
  getProducts,
  dellProduct,
  addProduct,
  addCources,
  dellCource,
  getCources,
  getSingleProduct,
  updateSingleProduct,
  updateCource,
  adminSigin,
  adminRegister,
  getSingleCourse,
  addChapterInCourse,
};
