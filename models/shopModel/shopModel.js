const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true,
  },
  email:{
    type: String,
  },
  location: {
    type: String,
    // required: true,
  },
  qrCode: {
    type: String,
    // required: true,
    unique: true,
  },
  // Add more fields as needed
});

const Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;
