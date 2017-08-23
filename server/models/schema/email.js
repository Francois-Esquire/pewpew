const mongoose = require('mongoose');
const validator = require('validator');

const EmailSchema = new mongoose.Schema({
  address: {
    type: String,
    trim: true,
    minlength: 5,
    lowercase: true,
    unique: true,
    sparse: true,
    validate: {
      validator: email => validator.isEmail(email),
      message: '{VALUE} is not a valid email.',
    },
  },
  verified: Boolean,
}, {
  _id: false,
  skipVersioning: true,
});

EmailSchema.pre('save', function emailSave(next) {
  if (this.isNew || this.isModified('address')) {
    this.verified = false;
  }
  return next();
});

EmailSchema.methods = {
  verify() {
    this.verified = true;
    return this.save();
  },
};

module.exports = EmailSchema;
