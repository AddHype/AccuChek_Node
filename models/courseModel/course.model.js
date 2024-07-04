const mongoose = require('mongoose');
const Joi = require('joi');

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
  progress:{
    type:Number,
    default: 0,
  },
  questions: [
    {

      _id:"",
      question: { type: String },
      options: { type: [String] },
      correctOption: { type: String },
      questionStatus: { type: Boolean, default: false },
    },
  ],
  kill_course: [
    {
      _id:"",
      correct_options: { type: [String] },
      incorrect_options:  { type: [String] },
      killCourseStatus: { type: Boolean, default: false }
    },
  ],
  accu_men: [
    {
      _id:"",
      question: { type: String },
      options: { type: [String] },
      correctOption: { type: String },
      accuManStatus: { type: Boolean, default: false }
    },
  ],
  marquee_test: [
    {
      _id:"",
      question: { type: String },
      options: { type: [String] },
      correctOption: { type: String },
      marqueeTestStatus: { type: Boolean, default: false }
    },
  ],
  spinWheel_test: [
    {
      _id:"",
      question: { type: String },
      options: { type: [String] },
      correctOption: { type: String },
      status: { type: Boolean}
    },
  ],
});






// new joi
// const courseJoiSchema = Joi.object({
//   name: Joi.string().min(3).required(),
//   id: Joi.number().required(),
//   discription: Joi.string().min(10).required(),
//   points: Joi.number().required(),
//   status: Joi.boolean().required(),
//   duration: Joi.string().required(),
//   url: Joi.string().required(),
//   // image: Joi.string(),
//   quiz: Joi.object({
//     questions: Joi.array().items(
//       Joi.object({
//         question: Joi.string().required(),
//         options: Joi.array().items(Joi.string()).required(),
//         correctOption: Joi.string().required(),
//       })
//     ).required(),
//   }),
//   iqMarqueeTest: Joi.object({
//     questions: Joi.array().items(
//       Joi.object({
//         question: Joi.string().required(),
//         options: Joi.array().items(Joi.string()).required(),
//         correctOption: Joi.string().required(),
//       })
//     ).required(),
//   }),
//   killCourse: Joi.object({
//     incorrectWords: Joi.string().required(),
//     correctWord: Joi.string().required(),
//   }),
//   accuMenQuestions: Joi.object({
//     questions: Joi.array().items(
//       Joi.object({
//         question: Joi.string().required(),
//         options: Joi.array().items(Joi.string()).required(),
//         correctOption: Joi.string().required(),
//       })
//     ).required(),
//   }),
// });








// const Course = mongoose.model('cources', courseSchema);
const Course = mongoose.model('cources', courseSchema);
module.exports = {
  Course,
  // courseJoiSchema, // Export the Joi schema for reuse
};
