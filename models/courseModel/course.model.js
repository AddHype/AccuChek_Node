const mongoose = require("mongoose");
const Joi = require("joi");

const chapterSchema = new mongoose.Schema({
  name: { type: mongoose.Schema.Types.String, trim: true },
  videoUrl: { type: mongoose.Schema.Types.String, trim: true },
  permission: {
    type: mongoose.Schema.Types.String,
    enum: ["public", "private"],
    default: "public",
  },
  description: { type: mongoose.Schema.Types.String, trim: true },
  questions: [
    {
      _id: "",
      question: { type: String },
      options: { type: [String] },
      correctOption: { type: String },
      questionStatus: { type: Boolean, default: false },
    },
  ],
  kill_course: [
    {
      _id: "",
      correct_options: { type: [String] },
      incorrect_options: { type: [String] },
      killCourseStatus: { type: Boolean, default: false },
    },
  ],
  accu_men: [
    {
      _id: "",
      question: { type: String },
      options: { type: [String] },
      correctOption: { type: String },
      accuManStatus: { type: Boolean, default: false },
    },
  ],
  marquee_test: [
    {
      _id: "",
      question: { type: String },
      options: { type: [String] },
      correctOption: { type: String },
      marqueeTestStatus: { type: Boolean, default: false },
    },
  ],
  spinWheel_test: [
    {
      _id: "",
      question: { type: String },
      options: { type: [String] },
      correctOption: { type: String },
      status: { type: Boolean },
    },
  ],
});

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
  },
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
  },
  chapters: [chapterSchema],
  points: {
    type: Number,
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  progress: {
    type: Number,
    default: 0,
  },
});
const Course = mongoose.model("cources", courseSchema);
module.exports = { Course };
