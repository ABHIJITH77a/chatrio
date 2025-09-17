import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import Navbar from "../components/Navbar.jsx";
import { Link } from "react-router";
import { HiArrowLeft } from "react-icons/hi";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";

// Redux
import { useDispatch } from "react-redux";
import {
  showIncomingCall,
  showOutgoingCall,
  clearOutgoingCall,
  clearIncomingCall,
} from "../../store/slice.js";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuthUser();
  console.log(user)

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!user,
  });

  // 📌 Init Stream chat client
  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !user) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: user._id,
            name: user.name || user.username,
            image:
              user.profilePic ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name || user.username
              )}&background=random`,
          },
          tokenData.token
        );

        const channelId = [user._id, targetUserId].sort().join("-");
        const currChannel = client.channel("messaging", channelId, {
          members: [user._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, user, targetUserId]);

  // 📌 Handle call-related events
  useEffect(() => {
    if (!channel) return;

    const handleEvent = (event) => {
      if (event.type === "call_invite" && event.user.id !== user._id) {
        dispatch(
          showIncomingCall({
            fromUser: event.user,
            channelId: channel.id,
          })
        );
      }

      if (event.type === "call_accept") {
        navigate(`/call/${event.channelId}`);
        dispatch(clearOutgoingCall());
      }

      if (event.type === "call_reject") {
        toast.error("Call rejected");
        dispatch(clearOutgoingCall());
      }

      if (event.type === "call_cancel") {
        toast("Call cancelled");
        dispatch(clearIncomingCall());
        dispatch(clearOutgoingCall());
      }
    };

    channel.on(handleEvent);
    return () => channel.off(handleEvent);
  }, [channel, navigate, dispatch]);

  // 📌 Start a call
  const handleVideoCall = async () => {
    if (!channel) return;

    await channel.sendEvent({
      type: "call_invite",
      user: { id: user._id, name: user.name },
      channelId: channel.id,
    });

    dispatch(
      showOutgoingCall({
        toUser: targetUserId,
        channelId: channel.id,
      })
    );

    toast.success("Calling...");
  };
    



  // 📌 Cancel call
  const cancelCall = () => {
    if (!channel) return;
    channel.sendEvent({ type: "call_cancel", channelId: channel.id });
    dispatch(clearOutgoingCall());
  };
   console.log(channel,chatClient)
  if ( !channel) return <ChatLoader />;

  return (
  <div className="h-[93vh] bg-gradient-to-br from-purple-950 via-indigo-950 to-blue-950 text-white">
    <Navbar />

    {/* Back Button */}
    <div className="px-4 pt-4">
  <Link
    to="/messages"
    className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
    title="Back to Messages"
  >
    <HiArrowLeft className="w-5 h-5" />
    <span className="ml-2 text-sm font-medium">Back</span>
  </Link>
</div>

    {/* Chat UI */}
    <Chat client={chatClient} theme="messaging dark">
      <Channel channel={channel}>
        <div className="w-full h-full px-4 flex flex-col gap-2">
          <div className="mb-2">
            <CallButton handleVideoCall={handleVideoCall} />
          </div>

          <div className="flex-1 bg-indigo-950 rounded-xl overflow-hidden border border-indigo-800 shadow-md">
            <Window>
              <ChannelHeader className="bg-indigo-900 text-white border-b border-indigo-800 px-4 py-3" />
              <MessageList className="text-white px-2" />
              <MessageInput
                focus
                className="bg-indigo-950 border-t border-indigo-800 px-4 py-3"
              />
            </Window>
            <Thread className="bg-indigo-950 text-white border-l border-indigo-800" />
          </div>
        </div>
      </Channel>
    </Chat>
  </div>
);

};

export default ChatPage;
