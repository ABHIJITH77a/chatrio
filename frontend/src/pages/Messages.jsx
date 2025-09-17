import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import ChatLoader from "../components/ChatLoader";
import { StreamChat } from "stream-chat";
import { HiArrowLeft } from "react-icons/hi";
import Sidebar from "../components/Sidebar"; // ✅ Import Sidebar
import "stream-chat-react/dist/css/v2/index.css";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const Messages = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthUser();

  const [chatClient, setChatClient] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(userId);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!user,
  });

  // Initialize chat client + fetch channels
  useEffect(() => {
    const initChat = async () => {
      if (!user?._id || !tokenData?.token) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: user._id,
            name: user.name || user.username || "Anonymous",
            image:
              user.profilePic ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name || "User"
              )}`,
          },
          tokenData.token
        );

        const filter = { members: { $in: [user._id] } };
        const sort = { last_message_at: -1 };
        const channelList = await client.queryChannels(filter, sort, {
          watch: true,
          state: true,
          presence: true,
        });

        setChatClient(client);
        setChannels(channelList);
      } catch (err) {
        console.error("Error initializing chat:", err);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (chatClient) chatClient.disconnectUser();
    };
  }, [tokenData?.token, user?._id]);

  const handleFriendSelect = (friendId) => {
    setSelectedUserId(friendId);
    navigate(`/chat/${friendId}`);
  };

  const getOtherUser = (members) => {
    const otherId = Object.keys(members).find((id) => id !== user._id);
    return members[otherId]?.user;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / (1000 * 60 * 60);

    return diffInHours < 24
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString();
  };

  if (loading) return <ChatLoader />;

  return (
    <div className="h-[93vh] min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-purple-950 via-indigo-950 to-blue-950 text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Conversations Panel */}
      <div className="flex-1 flex flex-col bg-indigo-900/50 border-l border-indigo-800">
        {/* Header */}
        <div className="p-4 border-b border-blue-800 bg-gray-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
           
            <h2 className="text-xl font-semibold text-white">Messages</h2>
          </div>
          <p className="text-sm text-gray-300">
            {channels.length} conversations
          </p>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {channels.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <p>No conversations yet</p>
                <p className="text-sm mt-1">Start a new chat!</p>
              </div>
            </div>
          ) : (
            channels.map((channelItem) => {
              const otherUser = getOtherUser(channelItem.state.members);
              const lastMessage =
                channelItem.state.messages[
                  channelItem.state.messages.length - 1
                ];
              const isSelected = selectedUserId === otherUser?.id;

              return (
                <div
                  key={channelItem.id}
                  onClick={() => handleFriendSelect(otherUser.id)}
                  className={`flex items-center p-4 hover:bg-white/10 cursor-pointer border-b border-gray-800 transition-colors ${
                    isSelected ? "bg-gray-700/40" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={
                        otherUser?.profilPic ||
                        `https://ui-avatars.com/api/?name=${
                          otherUser?.name || "User"
                        }&background=6366f1&color=fff`
                      }
                      alt={otherUser?.name || "User"}
                      className="w-12 h-12 rounded-full object-cover border-2 border-indigo-700"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-indigo-950 rounded-full"></div>
                  </div>

                  {/* Info */}
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">
                        {otherUser?.name || "Unknown User"}
                      </h3>
                      <span className="text-xs text-gray-400 ml-2">
                        {formatTime(lastMessage?.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate mt-1">
                      {lastMessage?.text || "No messages yet"}
                    </p>
                  </div>

                  {/* Unread Badge */}
                  {channelItem.state.unreadCount > 0 && (
                    <div className="ml-2 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                      {channelItem.state.unreadCount}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
