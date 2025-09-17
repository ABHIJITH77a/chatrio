import user from "../models/user.js";

export const getRecomendusers = async (req, res) => {
  try {
    const userid = req.user.id;
    const currentUser = req.user;

    const recomendusers = await user.find({
      _id: { $ne: userid, $nin: currentUser.friends },
      isOnborded: true,
    });

    res.json({ sucess: true, recomendusers });
  } catch (error) {
    res.json({ sucess: false, message: error.message });
  }
};

export const getFriends = async (req, res) => {
  try {
    const currentUser = req.user;
    const friends = await user
      .find({ _id: { $in: currentUser.friends } })
      .select("name email profilPic nativeLanguage learningLanguage");

    res.json({ sucess: true, friends });
  } catch (error) {
    res.json({ sucess: false, message: error.message });
  }
};

export const sendFriendRequest = async (req, res) => {
  try {
    const friendId = req.params.id;
    const currentUserId = req.user.id;

    if (friendId === currentUserId.toString()) {
      return res.status(400).json({ message: "You cannot send request to yourself" });
    }

    const friend = await user.findById(friendId);
    const currentUser = await user.findById(currentUserId);

    if (!friend) return res.status(404).json({ message: "User not found" });

    if (friend.friends.includes(currentUserId)) {
      return res.status(400).json({ message: "Already friends" });
    }

    if (friend.friendRequests.includes(currentUserId)) {
      return res.status(400).json({ message: "Request already sent" });
    }

    friend.friendRequests.push(currentUserId);
    currentUser.sentRequests.push(friendId);

    await friend.save();
    await currentUser.save();

    res.status(200).json({ message: "Friend request sent" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { id } = req.params; // Changed from requesterId to id
    const currentUserId = req.user._id;

    const currentUser = await user.findById(currentUserId);
    const requester = await user.findById(id);

    if (!requester) return res.status(404).json({ message: "Requester not found" });

    // Remove from friend requests
    currentUser.friendRequests = currentUser.friendRequests.filter(
      (reqId) => reqId.toString() !== id
    );

    // Remove from requester's sent requests
    requester.sentRequests = requester.sentRequests.filter(
      (reqId) => reqId.toString() !== currentUserId.toString()
    );

    // Add to friends
    currentUser.friends.push(id);
    requester.friends.push(currentUserId);

    await currentUser.save();
    await requester.save();

    res.status(200).json({ message: "Friend request accepted" });
  } catch (err) {
    console.error("Accept friend request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const rejectFriendRequest = async (req, res) => {
  try {
    const { id } = req.params; // Changed from requesterId to id
    const currentUserId = req.user._id;

    const currentUser = await user.findById(currentUserId);
    const requester = await user.findById(id);

    if (!requester) return res.status(404).json({ message: "Requester not found" });

    // Remove from friend requests
    currentUser.friendRequests = currentUser.friendRequests.filter(
      (reqId) => reqId.toString() !== id
    );

    // Remove from requester's sent requests
    requester.sentRequests = requester.sentRequests.filter(
      (reqId) => reqId.toString() !== currentUserId.toString()
    );

    await currentUser.save();
    await requester.save();

    res.status(200).json({ message: "Friend request rejected" });
  } catch (err) {
    console.error("Reject friend request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUser = await user.findById(currentUserId).populate("friendRequests", "name");

    res.json({ friendRequests: currentUser.friendRequests });
  } catch (error) {
    res.json({ sucess: false, message: error.message });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUser = await user.findById(currentUserId);
    const pendingRequests = await currentUser.populate("sentRequests", "name profilPic");

    res.json({ pendingRequests });
  } catch (error) {
    res.json({ sucess: false, message: error.message });
  }
};
