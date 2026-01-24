const User = require('../models/User');
const Room = require('../models/Room');
const Message = require('../models/Message');

const getUnreadCount = async (type, from, to) => {
    const filter = type === 'room' ? [to] : [from, to];
    const messageReaders = await Message
        .find({ sender: { $ne: from } }) // sender is not self
        .all('users', filter)
        .select(['readers'])
        .sort({ createdAt: -1 })
        .lean();

    // count messages where user is NOT in readers
    return messageReaders.filter(({ readers }) => readers.indexOf(from) === -1).length || 0;
};

const getMessageInfo = async (type, from, to) => {
    const filter = type === 'room' ? [to] : [from, to];
    const message = await Message
        .findOne()
        .all('users', filter)
        .select(['message', 'sender', 'updatedAt', 'readers'])
        .sort({ createdAt: -1 })
        .lean();

    const unreadCount = await getUnreadCount(type, from, to);

    return {
        latestMessage: message?.message || null,
        latestMessageSender: message?.sender || null,
        latestMessageUpdatedAt: message?.updatedAt || null,
        unreadCount
    };
};

exports.getUserContacts = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) return res.status(400).json({ message: 'Missing required information.' });

        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Role-based filtering
        // If current user is 'civilian' (or 'user'), show them 'lawyer' and 'law_student'
        // If current user is 'lawyer' or 'law_student', show them 'civilian' (or 'user')
        // Adjust role strings based on your User model schema enum values

        let targetRoles = [];
        if (currentUser.role === 'user' || currentUser.role === 'civilian') {
            targetRoles = ['lawyer'];
        } else {
            // Approximating that lawyers want to help normal users
            targetRoles = ['user', 'civilian'];
        }


        const users = await User
            .find({ _id: { $ne: userId }, role: { $in: targetRoles } })
            .select(['name', 'role', 'profilePicture', 'email', 'phone'])
            .sort({ updatedAt: -1 })
            .lean();

        // Deduplicate by name
        const uniqueUsers = [];
        const seenNames = new Set();

        users.forEach(u => {
            if (!seenNames.has(u.name)) {
                seenNames.add(u.name);
                uniqueUsers.push(u);
            }
        });

        console.log(`[Courtroom] User: ${currentUser.name} (${currentUser.role}) searching for: ${targetRoles}`);
        console.log(`[Courtroom] Found ${users.length} raw matches, ${uniqueUsers.length} unique.`);

        const formattedUsers = uniqueUsers.map(u => ({
            ...u,
            avatarImage: u.profilePicture || '',
            chatType: 'user'
        }));

        // Removed Room fetching logic completely as per request

        // Get unread counts for these users
        const contactWithMessages = await Promise.all(
            formattedUsers.map(async (contact) => {
                const { _id, chatType: type } = contact;
                const messageInfo = await getMessageInfo(type, userId, _id.toString());

                return {
                    ...contact,
                    ...messageInfo
                };
            })
        );

        return res.status(200).json({ data: contactWithMessages });
    } catch (err) {
        return res.status(404).json({ message: err.message });
    }
};

exports.getUserMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const { type, chatId } = req.query;

        if (!userId || !type || !chatId) {
            return res.status(400).json({ message: 'Missing required information.' });
        }

        const filter = type === 'room' ? [chatId] : [userId, chatId];
        const messages = await Message
            .find()
            .all('users', filter)
            .sort({ createdAt: 1 })
            .lean();

        const messagesWithAvatar = await Promise.all(
            messages.map(async (msg) => {
                const senderId = msg.sender;
                const user = await User.findById(senderId).lean();
                return {
                    ...msg,
                    avatarImage: user?.profilePicture || ''
                };
            })
        );

        return res.status(200).json({ data: messagesWithAvatar });
    } catch (err) {
        return res.status(404).json({ message: err.message });
    }
};

// CREATE
exports.postUserMessage = async (req, res) => {
    try {
        const { userId } = req.params;
        const { chatId } = req.query;
        const { message } = req.body;

        if (!userId || !chatId || !message) {
            return res.status(400).json({ message: 'Missing required information.' });
        }

        const newMessage = await Message.create({
            message,
            users: [userId, chatId],
            sender: userId,
            readers: []
        });

        return res.status(200).json({ data: newMessage });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

exports.postRoom = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, users, avatarImage } = req.body;

        if (!userId || !name || !users || !avatarImage) {
            return res.status(400).json({ message: 'Missing required information.' });
        }

        const data = await Room.create({
            name,
            users: [...users, userId],
            avatarImage,
            chatType: 'room'
        });

        return res.json({ data, messages: 'Successfully created a room.' });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// UPDATE
exports.updateMessageReadStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { type, chatId } = req.query;

        if (!userId || !type || !chatId) {
            return res.status(400).json({ message: 'Missing required information.' });
        }

        const filter = type === 'room' ? [chatId] : [userId, chatId];

        // Find all messages where sender is NOT userId
        const messages = await Message
            .find({ sender: { $ne: userId } })
            .all('users', filter)
            .sort({ createdAt: 1 });

        const messageReaderMap = messages.reduce((prev, curr) => {
            return { ...prev, [curr._id.toString()]: curr.readers };
        }, {});

        Object.entries(messageReaderMap).forEach(([key, value]) => {
            const userHasRead = value.indexOf(userId) > -1;
            if (!userHasRead) messageReaderMap[key].push(userId);
        });

        await Promise.all(
            Object.keys(messageReaderMap).map(async (msgId) => {
                return await Message
                    .findByIdAndUpdate({ _id: msgId }, { readers: messageReaderMap[msgId] }, { new: true })
                    .lean();
            })
        );

        return res.status(200).json({ data: null, message: 'Successfully updated.' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
