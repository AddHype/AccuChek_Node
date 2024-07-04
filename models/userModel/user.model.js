const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique:true,
  },
  country: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirm_password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  points:{
    type: Number,
    default: 0,
  },
  course:[
    {
      courseId:{type: String},
      courseStatus:{type:Boolean,default:false},
      courseCompletionDate:{type:String}
    }
  ],
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
const userJoiSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  country: Joi.string().required(),
  language: Joi.string().required(),
  password: Joi.string().required(),
  confirm_password: Joi.string().valid(Joi.ref('password')).required(),
});

const userJoiSigninSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})

userSchema.pre('save', async function(next){
  console.log("Hi Hash Password Middleware");
  if(this.isModified('password')){
    this.password = await bcrypt.hash(this.password, 12);
    this.confirm_password = await bcrypt.hash(this.confirm_password, 12);
  }
  next();
});

userSchema.methods.generateAuthToken = async function() {
  try {
    let token = jwt.sign({_id: this._id}, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return this.token;
  } catch (error) {
    console.log(error);
  }
};

const User = mongoose.model('users', userSchema);

module.exports = {
  User,
  userJoiSchema, // Export the Joi schema for reuse
  userJoiSigninSchema,
};