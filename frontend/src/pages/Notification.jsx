import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckIcon, XIcon } from "lucide-react";
import { getreq, acceptreq, rejectreq } from "../lib/api";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Notifications = () => {
  const { data: notification, isLoading, error, refetch } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getreq,
  });

  const { mutate: acceptRequest } = useMutation({
    mutationFn: acceptreq,
    onSuccess: () => {
      toast.success("Friend request accepted!");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to accept request");
    },
  });

  const { mutate: rejectRequest } = useMutation({
    mutationFn: rejectreq,
    onSuccess: () => {
      toast.success("Friend request rejected");
      refetch();
    },
    onError: (error) => {
      toast.error("Failed to reject request");
    },
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-purple-950 via-indigo-950 to-blue-950 text-white">
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-3xl font-bold mb-8 text-white">Friend Requests</h1>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <p className="text-gray-400 text-lg ml-3">Loading...</p>
            </div>
          )}

          {error && (
            <div className="text-red-400 bg-red-900/20 border border-red-700 rounded-lg p-6 mb-6">
              <p>Failed to load friend requests</p>
            </div>
          )}

          {!isLoading && !error && (!notification?.friendRequests || notification.friendRequests.length === 0) && (
            <div className="text-center py-16">
              <div className="text-gray-500 text-6xl mb-6">📬</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No new friend requests</h3>
              <p className="text-gray-500">When someone sends you a friend request, it will appear here.</p>
            </div>
          )}

          {notification?.friendRequests && notification.friendRequests.length > 0 && (
            <div className="space-y-6">
              {notification.friendRequests.map((user) => (
                <div key={user._id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={user.profilPic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                        alt={user.name}
                        className="w-16 h-16 rounded-full border-2 border-gray-600"
                      />
                      <div>
                        <h3 className="font-bold text-white text-lg">{user.name}</h3>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => acceptRequest(user._id)}
                        className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-xl"
                      >
                        <CheckIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => rejectRequest(user._id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl"
                      >
                        <XIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Notifications;