const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1); // প্রসেস বন্ধ করে দেবে যদি ডাটাবেস কানেক্ট না হয়
  }
};

module.exports = connectDB;
