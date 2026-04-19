const Request = require('../models/Request');
const User = require('../models/User');

exports.createRequest = async (req, res) => {
  try {
    const { receiverId, skill, message } = req.body;
    const senderId = req.userId;

    if (!receiverId || !skill) {
      return res.status(400).json({ message: 'Receiver and skill are required.' });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ message: 'You cannot request yourself.' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found.' });
    }

    const existingRequest = await Request.findOne({
      sender: senderId,
      receiver: receiverId,
      skill,
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending request for this skill.' });
    }

    const request = await Request.create({
      sender: senderId,
      receiver: receiverId,
      skill,
      message: message || `I want to learn ${skill} from you.`,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      $or: [{ sender: req.userId }, { receiver: req.userId }],
    })
      .populate('sender', 'name email skillsOffered skillsWanted')
      .populate('receiver', 'name email skillsOffered skillsWanted')
      .sort('-createdAt');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be accepted or rejected.' });
    }

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' });
    }

    if (request.receiver.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the receiver can accept or reject this request.' });
    }

    request.status = status;
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
