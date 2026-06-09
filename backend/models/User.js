const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['user', 'super_admin', 'admin', 'moderator', 'uploader'], 
    default: 'user' 
  },
  isBanned: { type: Boolean, default: false }
}, { timestamps: true });

// পাসওয়ার্ড সেভ করার আগে অটোমেটিক Hash (Encrypt) করে ফেলবে
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
