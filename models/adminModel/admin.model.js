const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Make sure emails are unique
  },
  password: {
    type: String,
    required: true,
    minlength: 8, // Minimum password length
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
}, { timestamps: true });

// Joi schema for validation
const adminJoiSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

adminSchema.pre('save', async function (next) {
  console.log('Hi Hash Password Middleware');
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

const admin = mongoose.model('admin', adminSchema);

module.exports = {
  admin,
  adminJoiSchema, // Export the Joi schema for reuse
};
