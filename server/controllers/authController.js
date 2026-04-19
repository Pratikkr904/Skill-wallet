// Authentication controller
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendResetEmail = async ({ email, name, code }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email configuration is missing. Set EMAIL_USER and EMAIL_PASS in .env');
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: 'SkillSwap Password Reset Code',
    html: `<div style="font-family:Arial,sans-serif;color:#111;line-height:1.5">
      <p>Hi ${name},</p>
      <p>You requested a password reset for SkillSwap. Use the code below to update your password:</p>
      <p style="font-size:1.5rem;font-weight:700;background:#f3f4f6;padding:12px 16px;border-radius:8px;display:inline-block">${code}</p>
      <p>This code expires in 15 minutes.</p>
      <p>If you did not request this, you can safely ignore this message.</p>
      <p>Thanks,<br/>The SkillSwap Team</p>
    </div>`,
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = createToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = createToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide the email associated with your account.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: 'If an account exists for that email, a reset code has been sent.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = code;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    await sendResetEmail({ email: user.email, name: user.name, code });

    res.json({ message: 'Password reset code sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to send password reset code.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Please provide email, code, and new password.' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetPasswordCode) {
      return res.status(400).json({ message: 'Invalid code or email.' });
    }

    if (user.resetPasswordCode !== code || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired reset code.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    await user.save();

    const token = createToken(user._id);
    res.json({
      message: 'Password updated successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to reset password.' });
  }
};
