const Message = require('../models/Message');
const User = require('../models/User');
const Request = require('../models/Request');

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.userId;

    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver and content are required.' });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ message: 'You cannot send messages to yourself.' });
    }

    // Check if users are connected (have accepted requests with each other)
    const connectionExists = await Request.findOne({
      $or: [
        { sender: senderId, receiver: receiverId, status: 'accepted' },
        { sender: receiverId, receiver: senderId, status: 'accepted' },
      ],
    });

    if (!connectionExists) {
      return res.status(403).json({ message: 'You can only chat with users you are connected with.' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found.' });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    // Check if users are connected
    const connectionExists = await Request.findOne({
      $or: [
        { sender: currentUserId, receiver: userId, status: 'accepted' },
        { sender: userId, receiver: currentUserId, status: 'accepted' },
      ],
    });

    if (!connectionExists) {
      return res.status(403).json({ message: 'You can only view messages with users you are connected with.' });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
      .populate('sender', 'name')
      .populate('receiver', 'name')
      .sort('timestamp');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.userId;

    // Find all accepted connections
    const connections = await Request.find({
      $or: [
        { sender: currentUserId, status: 'accepted' },
        { receiver: currentUserId, status: 'accepted' },
      ],
    }).populate('sender', 'name').populate('receiver', 'name');

    const conversations = [];

    for (const connection of connections) {
      const otherUser = connection.sender._id.toString() === currentUserId
        ? connection.receiver
        : connection.sender;

      // Get the latest message in this conversation
      const latestMessage = await Message.findOne({
        $or: [
          { sender: currentUserId, receiver: otherUser._id },
          { sender: otherUser._id, receiver: currentUserId },
        ],
      })
        .sort('-timestamp')
        .populate('sender', 'name');

      // Count unread messages
      const unreadCount = await Message.countDocuments({
        sender: otherUser._id,
        receiver: currentUserId,
        read: false,
      });

      conversations.push({
        user: otherUser,
        latestMessage,
        unreadCount,
        connectionId: connection._id,
      });
    }

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        read: false,
      },
      { read: true }
    );

    res.json({ message: 'Messages marked as read.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};