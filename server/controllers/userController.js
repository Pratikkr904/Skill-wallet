const User = require('../models/User');

exports.searchUsers = async (req, res) => {
  try {
    const { skill } = req.query;
    const query = {};

    if (skill) {
      const regex = new RegExp(skill, 'i');
      query.$or = [
        { skillsOffered: regex },
        { skillsWanted: regex },
      ];
    }

    const users = await User.find(query).select('name email skillsOffered skillsWanted bio avatar');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, skillsOffered, skillsWanted, avatar } = req.body;
    const update = {};

    if (name !== undefined) update.name = name;
    if (bio !== undefined) update.bio = bio;
    if (avatar !== undefined) update.avatar = avatar;
    if (skillsOffered !== undefined) {
      update.skillsOffered = Array.isArray(skillsOffered)
        ? skillsOffered.map((skill) => skill.trim()).filter(Boolean)
        : skillsOffered.split(',').map((skill) => skill.trim()).filter(Boolean);
    }
    if (skillsWanted !== undefined) {
      update.skillsWanted = Array.isArray(skillsWanted)
        ? skillsWanted.map((skill) => skill.trim()).filter(Boolean)
        : skillsWanted.split(',').map((skill) => skill.trim()).filter(Boolean);
    }

    const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
