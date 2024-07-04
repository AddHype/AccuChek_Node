const mongoose = require('mongoose');
const Joi = require('joi');

const productsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
    required: true,
    unique:true,
  },
  description: {
    type: String,
    required: true,

  },
  points: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
});

// Joi schema for validation
const productsJoiSchema = Joi.object({
  title: Joi.string().required(),
  id: Joi.number().required(),
  description: Joi.string().required(),
  points: Joi.number().required(),
  category: Joi.string().required(),
  image: Joi.string().required(),
});

const Products = mongoose.model('products', productsSchema);

module.exports = {
  Products,
  productsJoiSchema, // Export the Joi schema for reuse
};
