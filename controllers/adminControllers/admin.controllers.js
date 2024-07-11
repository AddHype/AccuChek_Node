const express = require("express");
const {
  Products,
  productsJoiSchema,
} = require("../../models/productModel/product.model");
const {
  Course,
  Category,
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

const addCources = async (req, res) => {
  try {
    console.log(req.body);
    const { name, points, description, status, duration } = req.body;
    const courseExists = await Course.findOne({ name });

    if (courseExists) {
      return res.status(422).json({ error: "This course already exists" });
    }
    console.log(req.files);
    const files = req.files;

    const image = files[0].filename;
    const featureVideo = files[1].filename;

    const newCourse = new Course({
      name,
      description,
      points,
      status,
      duration,
      image,
      featureVideo,
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
    console.log(req.body, req.file.filename);
    const {
      id,
      name,
      description,
      // questions,
      // kill_course,
      // accu_men,
      // marquee_test,
      // spinWheel_test,
    } = req.body;
    const image = req.file.filename;
    const existingCourse = await Course.findById(id);

    if (!existingCourse) {
      return res.status(404).json({ error: "Course not found" });
    }

    const newChapter = {
      name,
      videoUrl: image,
      description,
      permission: "public",
      // questions: JSON.parse(questions),
      // kill_course: JSON.parse(kill_course),
      // accu_men: JSON.parse(accu_men),
      // marquee_test: JSON.parse(marquee_test),
      // spinWheel_test: JSON.parse(spinWheel_test),
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

const addNewCategory = async (req, res) => {
  try {
    console.log(req.body);
    const { category } = req.body;
    const existingCategory = await Category.findOne({ name: category });

    if (existingCategory) {
      res.status(201).json({ message: "category already exist" });
    }

    const newCategory = new Category({
      name: category,
    });
    await newCategory.save();
    res.status(200).json({ message: "Category Added!" });
  } catch (error) {
    res.status(500).json({ message: "INTERNAL_SERVER_ERROR " });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find();
    res
      .status(200)
      .json({ message: "categories fetched!", categories: allCategories });
  } catch (error) {
    res.status(500).json({ message: "INTERNAL_SERVER_ERROR " });
  }
};

const addCategoryWithCourse = async (req, res) => {
  try {
    const { id, category } = req.body;
    const existingCourse = await Course.findById(id);

    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    let existingCategory = await Category.findOne({ name: category });

    if (!existingCategory) {
      existingCategory = new Category({
        name: category,
        courseId: [existingCourse._id],
      });
      await existingCategory.save();
      return res.status(200).json({
        message: "Category created and linked with course successfully",
      });
    }

    // Add courseId to the existing category's courseId array if not already present
    if (!existingCategory.courseId.includes(existingCourse._id)) {
      existingCategory.courseId.push(existingCourse._id);
      await existingCategory.save();
    }

    res
      .status(200)
      .json({ message: "Category linked with course successfully" });
  } catch (error) {
    res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
  }
};

const getCourseWithCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Find the category by ID
    const category = await Category.findById(categoryId).populate("courseId");

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Get the courses associated with the category
    const courses = await Course.find({ _id: { $in: category.courseId } });

    res.status(200).json({ message: "Courses fetched!", courses });
  } catch (error) {
    console.error("Error fetching courses by category:", error);
    res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
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
  // console.log(data);
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

const deleteAllCategories = async (req, res) => {
  try {
    const deletingCategories = await Category.deleteMany();
    res.status(200).json({ message: "deleted" });
  } catch (error) {
    req.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
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
  addNewCategory,
  getAllCategories,
  addCategoryWithCourse,
  getCourseWithCategory,
  deleteAllCategories,
};
