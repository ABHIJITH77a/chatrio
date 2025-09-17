import { useSelector, useDispatch } from "react-redux";
import { clearIncomingCall, clearOutgoingCall } from "../../store/slice";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import user from "../../../backend/src/models/user";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPopup = () => {
  const { incomingCall, outgoingCall } = useSelector((state) => state.call);
 
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [channel, setChannel] = useState(null);

  // Initialize StreamChat channel if incoming/outgoing exists
  useEffect(() => {
    const initChannel = async () => {
      const client = StreamChat.getInstance(STREAM_API_KEY);

      if (incomingCall || outgoingCall) {
        const channelId = incomingCall?.channelId || outgoingCall?.channelId;
        const currChannel = client.channel("messaging", channelId);
        await currChannel.watch();
        setChannel(currChannel);
      }
    };

    initChannel();
  }, [incomingCall, outgoingCall]);

  if (!incomingCall && !outgoingCall) return null;
  if (!channel) return null; // wait until channel is ready

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-black p-6 rounded-xl shadow-xl">
        {/* Incoming Call */}
        {incomingCall && (
          <>
            <h2 className="text-lg font-semibold">
              {incomingCall.fromUser?.name || "Someone"} is calling...
            </h2>
            <div className="flex gap-3 mt-4">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  channel.sendEvent({
                    type: "call_accept",
                    channelId: incomingCall.channelId,
                  });
                  navigate(`/call/${incomingCall.channelId}`);
                  dispatch(clearIncomingCall());
                }}
              >
                Accept
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  channel.sendEvent({
                    type: "call_reject",
                    channelId: incomingCall.channelId,
                  });
                  dispatch(clearIncomingCall());
                }}
              >
                Reject
              </button>
            </div>
          </>
        )}

        {/* Outgoing Call */}
        {outgoingCall && (
          <>
            <h2 className="text-lg font-semibold">
              Calling ...
            </h2>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded mt-4"
              onClick={() => {
                channel.sendEvent({
                  type: "call_cancel",
                  channelId: outgoingCall.channelId,
                });
                dispatch(clearOutgoingCall());
              }}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CallPopup;
