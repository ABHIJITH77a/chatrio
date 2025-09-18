import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import ChatLoader from "../components/ChatLoader";
import { StreamChat } from "stream-chat";
import Sidebar from "../components/Sidebar";
import "stream-chat-react/dist/css/v2/index.css";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const Messages = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthUser();

  const [chatClient, setChatClient] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(userId);

  const { data: tokenData, error: tokenError } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!user,
    retry: 3,
  });

  // Memoized function to get other user from channel members
  const getOtherUser = useCallback((members) => {
    if (!members || !user?._id) return null;
    const otherId = Object.keys(members).find((id) => id !== user._id);
    return members[otherId]?.user || null;
  }, [user?._id]);

  // Memoized function to format timestamps
  const formatTime = useMemo(() => {
    return (timestamp) => {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = Math.abs(now - date) / (1000 * 60 * 60);

      return diffInHours < 24
        ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : date.toLocaleDateString();
    };
  }, []);

  // Initialize chat client and fetch channels
  useEffect(() => {
    let isMounted = true;
    let client = null;

    const initChat = async () => {
      if (!user?._id || !tokenData?.token) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        setLoading(true);

        client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: user._id,
            name: user.name || user.username || "Anonymous",
            image:
              user.profilePic ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name || "User"
              )}&background=6366f1&color=fff`,
          },
          tokenData.token
        );

        if (!isMounted) {
          await client.disconnectUser();
          return;
        }

        const filter = { members: { $in: [user._id] } };
        const sort = { last_message_at: -1 };
        const options = {
          watch: true,
          state: true,
          presence: true,
          limit: 20,
        };

        const channelList = await client.queryChannels(filter, sort, options);

        if (isMounted) {
          setChatClient(client);
          setChannels(channelList);
        }
      } catch (err) {
        console.error("Error initializing chat:", err);
        if (isMounted) {
          setError("Failed to initialize chat. Please try again.");
        }
        if (client) {
          try {
            await client.disconnectUser();
          } catch (disconnectError) {
            console.error("Error disconnecting client:", disconnectError);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initChat();

    return () => {
      isMounted = false;
      if (client) {
        client.disconnectUser().catch(console.error);
      }
    };
  }, [tokenData?.token, user?._id, user?.name, user?.username, user?.profilePic]);

  // Handle friend selection with navigation
  const handleFriendSelect = useCallback((friendId) => {
    if (!friendId) return;
    setSelectedUserId(friendId);
    navigate(`/chat/${friendId}`);
  }, [navigate]);

  // Retry function for error recovery
  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    // Trigger re-initialization by clearing and setting states
    setChatClient(null);
    setChannels([]);
  }, []);

  // Handle loading state
  if (loading) return <ChatLoader />;

  // Handle token error
  if (tokenError) {
    return (
      <div className="h-[93vh] min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-purple-950 via-indigo-950 to-blue-950 text-white">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-400">
            <div className="w-16 h-16 bg-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-lg mb-2">Authentication Error</p>
            <p className="text-sm text-gray-400">Failed to get chat token</p>
            <button
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle general error state
  if (error) {
    return (
      <div className="h-[93vh] min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-purple-950 via-indigo-950 to-blue-950 text-white">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-red-400">
            <div className="w-16 h-16 bg-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <p className="text-lg mb-2">Something went wrong</p>
            <p className="text-sm text-gray-400 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[93vh] min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-purple-950 via-indigo-950 to-blue-950 text-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Conversations Panel */}
      <div className="flex-1 flex flex-col bg-indigo-900/50 border-l border-indigo-800">
        {/* Header */}
        <header className="p-4 border-b border-blue-800 bg-gray-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-white">Messages</h1>
          </div>
          <p className="text-sm text-gray-300" aria-label={`${channels.length} conversations`}>
            {channels.length} conversations
          </p>
        </header>

        {/* Conversation List */}
        <main className="flex-1 overflow-y-auto" role="main">
          {channels.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl" role="img" aria-label="Chat emoji">💬</span>
                </div>
                <p className="text-lg">No conversations yet</p>
                <p className="text-sm mt-1 text-gray-500">Start a new chat to begin messaging!</p>
              </div>
            </div>
          ) : (
            <div role="list" aria-label="Conversations">
              {channels.map((channelItem) => {
                const otherUser = getOtherUser(channelItem.state.members);
                const lastMessage =
                  channelItem.state.messages?.[
                    channelItem.state.messages.length - 1
                  ];
                const isSelected = selectedUserId === otherUser?.id;
                const unreadCount = channelItem.state.unreadCount || 0;

                // Skip rendering if otherUser is not available
                if (!otherUser) return null;

                return (
                  <div
                    key={channelItem.id}
                    role="listitem"
                    onClick={() => handleFriendSelect(otherUser.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleFriendSelect(otherUser.id);
                      }
                    }}
                    tabIndex={0}
                    className={`flex items-center p-4 hover:bg-white/10 cursor-pointer border-b border-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset ${
                      isSelected ? "bg-gray-700/40" : ""
                    }`}
                    aria-label={`Conversation with ${otherUser.name || "Unknown User"}`}
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <img
                        src={
                          otherUser.profilPic ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            otherUser.name || "User"
                          )}&background=6366f1&color=fff`
                        }
                        alt={`${otherUser.name || "User"}'s profile picture`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-indigo-700"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            otherUser.name || "User"
                          )}&background=6366f1&color=fff`;
                        }}
                      />
                      <div 
                        className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-indigo-950 rounded-full"
                        aria-label="Online status"
                        title="Online"
                      ></div>
                    </div>

                    {/* Info */}
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h2 className="font-semibold truncate text-white">
                          {otherUser.name || "Unknown User"}
                        </h2>
                        <time 
                          className="text-xs text-gray-400 ml-2 flex-shrink-0"
                          dateTime={lastMessage?.created_at}
                        >
                          {formatTime(lastMessage?.created_at)}
                        </time>
                      </div>
                      <p className="text-sm text-gray-400 truncate mt-1">
                        {lastMessage?.text || "No messages yet"}
                      </p>
                    </div>

                    {/* Unread Badge */}
                    {unreadCount > 0 && (
                      <div 
                        className="ml-2 min-w-[20px] h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center px-1"
                        aria-label={`${unreadCount} unread messages`}
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Messages;