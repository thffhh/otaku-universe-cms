const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Login User or Super Admin
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ১. Super Admin চেক (যেমনটা তুমি চেয়েছো)
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASS) {
      const token = jwt.sign(
        { id: 'super_admin_id', email: process.env.ADMIN_EMAIL, role: 'super_admin' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.status(200).json({
        success: true,
        message: 'Super Admin Login Successful',
        token,
        user: { name: 'Super Admin', email: process.env.ADMIN_EMAIL, role: 'super_admin' }
      });
    }

    // ২. Normal User চেক (Database থেকে)
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (user.isBanned) return res.status(403).json({ success: false, message: 'Account is banned' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login Successful',
      token,
      user: { name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
