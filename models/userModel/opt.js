const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
});

const storeOTPInDatabase = async (email, otp, otpTimestamp) => {
  try {
    // Check if an OTP record already exists for the user
    const existingOTP = await OTPModel.findOne({ email });

    if (existingOTP) {
      // If an OTP record exists, update it with the new OTP and timestamp
      existingOTP.otp = otp;
      existingOTP.timestamp = otpTimestamp;
      await existingOTP.save();
    } else {
      // If no OTP record exists, create a new one
      const otpData = new OTPModel({
        email,
        otp,
        timestamp: otpTimestamp,
      });
      await otpData.save();
    }
  } catch (error) {
    console.error('Error storing/updating OTP in the database:', error);
    throw error;
  }
};

const getStoredOTPFromDatabase = async (email) => {
  try {
    const otpData = await OTPModel.findOne({ email });
    if (!otpData) {
      return { storedOtp: null, otpTimestamp: null };
    }
    return { storedOtp: otpData.otp, otpTimestamp: otpData.timestamp };
  } catch (error) {
    console.error('Error fetching stored OTP from the database:', error);
    throw error;
  }
};

const deleteStoredOTPFromDatabase = async (email) => {
  try {
    await OTPModel.deleteOne({ email });
  } catch (error) {
    console.error('Error deleting stored OTP from the database:', error);
    throw error;
  }
};

const OTPModel = mongoose.model('OTP', otpSchema);

module.exports = {
  storeOTPInDatabase,
  getStoredOTPFromDatabase,
  deleteStoredOTPFromDatabase,
};
