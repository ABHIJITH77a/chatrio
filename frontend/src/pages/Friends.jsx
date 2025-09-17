import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { getFriends, getRecommendedUsers, sendreq, getAuthUser } from "../lib/api";
import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

const Friends = () => {
  const [friends, setFriends] = useState([]);
  const [users, setUsers] = useState([]);

  // ---- Auth User Query (using useQuery for better caching) ----
  const {
    data: currentUser,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser
  } = useQuery({
    queryKey: ['authUser'],
    queryFn: getAuthUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // ---- Friends Query ----
  const {
    data: friendsData,
    isLoading: friendsLoading,
    error: friendsError,
    refetch: refetchFriends
  } = useQuery({
    queryKey: ['friends'],
    queryFn: getFriends,
    onSuccess: (data) => {
      setFriends(data?.friends || []);
    },
  });

  // ---- Recommended Users Query ----
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['recommendedUsers'],
    queryFn: getRecommendedUsers,
    onSuccess: (data) => {
      setUsers(data?.recomendusers || []);
    },
  });

  // ---- Send Friend Request Mutation ----
  const {
    mutate: sendFriendRequest,
    isPending: isSendingRequest,
  } = useMutation({
    mutationFn: sendreq,
    onSuccess: () => {
      toast.success("Friend request sent!");
      // Refetch both users and auth user to update UI
      refetchUsers();
      refetchUser();
    },
    onError: (error) => {
      console.error("Error sending friend request:", error);
      toast.error(error?.message || "Failed to send friend request");
    },
  });

  // ---- Update state when queries succeed ----
  useEffect(() => {
    if (friendsData?.friends) {
      setFriends(friendsData.friends);
    }
  }, [friendsData]);

  useEffect(() => {
    if (usersData?.recomendusers) {
      setUsers(usersData.recomendusers);
    }
  }, [usersData]);

  // ---- Helper function to check if request is already sent ----
  const isRequestSent = useCallback((userId) => {
    return currentUser?.user?.sentRequests?.includes(userId);
  }, [currentUser]);

  // ---- Handle send friend request ----
  const handleSendRequest = useCallback((userId) => {
    if (!isRequestSent(userId) && !isSendingRequest) {
      sendFriendRequest(userId);
    }
  }, [isRequestSent, isSendingRequest, sendFriendRequest]);

  const authUser = currentUser?.user;

  return (
    <>
  <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-purple-950 via-indigo-950 to-blue-950 text-white">
    {/* Sidebar (collapsible on mobile) */}
    <div className="w-64 flex-shrink-0 hidden md:block">
      <Sidebar />
    </div>

    {/* For mobile: Sidebar overlays */}
    <div className="md:hidden">
      <Sidebar />
    </div>

    {/* Main Content Area */}
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
        {/* Your Friends */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white">Your Friends</h2>

          {friendsLoading && (
            <div className="flex items-center gap-2 text-gray-300">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <p>Loading friends...</p>
            </div>
          )}

          {friendsError && (
            <div className="text-red-400 bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
              <p>Failed to load friends: {friendsError.message}</p>
              <button 
                onClick={() => refetchFriends()}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Friends Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.isArray(friends) && friends.length > 0 ? (
              friends.map((friend) => (
                <div
                  key={friend._id}
                  className="group relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-6 border border-gray-700 hover:border-indigo-500 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1"
                >
                  {/* Profile Picture */}
                  <div className="flex flex-col items-center mb-4">
                    <div className="relative">
                      <img
                        src={friend.profilPic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.name}`}
                        alt={`${friend.name}'s profile`}
                        className="w-16 h-16 rounded-full border-2 border-gray-600 group-hover:border-green-500 transition-colors duration-300"
                      />
                      {friend.isLogged &&(<div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-800"></div>)}
                    </div>
                    <h3 className="font-semibold text-white mt-3 text-lg">{friend.name}</h3>
                    <p className="text-gray-400 text-sm">Native:{friend.nativeLanguage}</p>
                    <p className="text-gray-400 text-sm">Learning:{friend.learningLanguage}</p>
                  </div>

                  {/* Message Button */}
                  <Link 
                    to={`/chat/${friend._id}`} 
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 
                               text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 
                               transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 
                        4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 
                        15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Message
                  </Link>
                </div>
              ))
            ) : (
              !friendsLoading && (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-500 text-5xl mb-4">👥</div>
                  <p className="text-gray-400 text-lg">No friends found yet.</p>
                  <p className="text-gray-500 text-sm">Start by sending some friend requests below!</p>
                </div>
              )
            )}
          </div>
        </section>

        {/* Meet New Learners */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-white">Meet New Learners</h2>
          <p className="mb-8 text-gray-400 text-base sm:text-lg">
            Discover perfect language exchange partners based on your profile
          </p>

          {/* Users Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(users) && users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user._id}
                  className="group bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-1"
                >
                  {/* Profile + Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={user.profilPic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-14 h-14 rounded-full border-2 border-gray-600 group-hover:border-blue-500"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg truncate">{user.name}</h3>
                     <p className="text-gray-400 text-sm">Native:{user.nativeLanguage}</p>
                    <p className="text-gray-400 text-sm">Learning:{user.learningLanguage}</p>
                    </div>
                  </div>

                  {/* Action */}
                  <button
  onClick={() => handleSendRequest(user._id)}
  disabled={isSendingRequest || isRequestSent(user._id)} // disable if already sent
  className={`w-full font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform ${
    isRequestSent(user._id)
      ? "bg-gray-500 cursor-not-allowed"
      : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white hover:scale-105"
  }`}
>
  {isRequestSent(user._id)
    ? "Pending" 
    : "Send Friend Request"}
</button>

                </div>
              ))
            ) : (
              !usersLoading && (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-500 text-5xl mb-4">🌍</div>
                  <p className="text-gray-400 text-lg">No recommended users found.</p>
                  <p className="text-gray-500 text-sm">Check back later for new partners!</p>
                </div>
              )
            )}
          </div>
        </section>
      </main>

    </div>
  </div>
  
      {/* Footer */}
      <Footer />
  </>
);

};

export default Friends;