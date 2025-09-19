import { useState, useEffect } from "react"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { onboard, updateProfile } from "../lib/api"
import toast from "react-hot-toast"
import useAuthUser from "../hooks/useAuthUser"

export default function Onboard() {
  const { isLoading, isError, user } = useAuthUser();
  const navigate = useNavigate()
  const [serverError, setServerError] = useState("");
  const [profilPic, setProfilePic] = useState(null)
  const [file, setFile] = useState(null)
  const [form, setForm] = useState({
    name: "",
    bio: "",
    nativeLanguage: "",
    learningLanguage: "",
  })

  useEffect(() => {
    if (serverError) {
      const timer = setTimeout(() => {
        setServerError("");
      }, 3000);

      return () => clearTimeout(timer); // cleanup if component unmounts or error changes
    }
  }, [serverError]);

  // ✅ FIXED: Move useMutation before conditional returns
  const { mutate, isPending, error } = useMutation({
    mutationFn: (formData) =>
      user?.isOnborded ? updateProfile(formData) : onboard(formData),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(
          user?.isOnborded
            ? "Profile updated successfully"
            : "Profile set successfully"
        );
        setTimeout(() => navigate("/home"), 900);
      } else {
        setServerError(data.message || "Something went wrong ❌");
      }
    },
    onError: (err) => {
      setServerError(err.response?.data?.message || "Something went wrong ❌");
    },
  });

  if (isLoading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  if (isError || !user) {
    return <div className="text-center text-red-500">Not authenticated ❌</div>;
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFile(file)
      setProfilePic(URL.createObjectURL(file))
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const submit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    if (!user.isOnborded) {
      // First time onboarding (all fields required)
      formData.append("name", form.name);
      formData.append("bio", form.bio);
      formData.append("nativeLanguage", form.nativeLanguage);
      formData.append("learningLanguage", form.learningLanguage);
    
    } else {
      // Updating profile → fallback to old values if field is empty
      formData.append("name", form.name || user.name);
      formData.append("bio", form.bio || user.bio);
      formData.append("nativeLanguage", form.nativeLanguage || user.nativeLanguage);
      formData.append("learningLanguage", form.learningLanguage || user.learningLanguage);
    }

    if (file) {
      formData.append("avatar", file);
    } 

    mutate(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900">
      <div
        className="w-full max-w-4xl bg-base-100 shadow-2xl rounded-2xl overflow-hidden"
        data-theme="forest"
      >
        <div className="grid md:grid-cols-2">
          {/* Left side - Profile Upload */}
          <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-indigo-900 to-purple-900 text-white">
            <h2 className="text-2xl font-bold mb-2">Onboarding</h2>
            <p className="text-sm text-gray-300 mb-6 text-center">
              {user.isOnborded
                ? "Update your profile details ✨"
                : "Set up your profile to get started 🚀"}
            </p>

            <label className="avatar cursor-pointer">
              <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                {profilPic ? (
                  <img src={profilPic} alt="profile preview" />
                ) : user.isOnborded && user?.profilPic ? (
                  <img src={user.profilPic} alt="profile" />
                ) : (
                  <span className="flex items-center justify-center w-full h-full text-sm text-gray-400">
                    Upload
                  </span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>

          {/* Right side - Form */}
          <div className="p-8">
            <form onSubmit={submit} className="space-y-4">
              {serverError && (
                <p className="text-red-500 text-sm text-center">{serverError}</p>
              )}

              {/* Full Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Full Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={user.isOnborded ? form.name || user?.name : form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="input input-bordered w-full"
                />
              </div>

              {/* Bio */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Bio</span>
                </label>
                <textarea
                  name="bio"
                  value={user.isOnborded ? form.bio || user?.bio : form.bio}
                  onChange={handleChange}
                  placeholder="Write a short bio..."
                  className="textarea textarea-bordered h-24 resize-none w-full"
                />
              </div>

              {/* Languages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Native Language</span>
                  </label>
                  <select
                    name="nativeLanguage"
                    value={
                      user.isOnborded
                        ? form.nativeLanguage || user?.nativeLanguage
                        : form.nativeLanguage
                    }
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="">Select your native language</option>
                    <option>English</option>
                    <option>Spanish</option>
                    <option>Hindi</option>
                    <option>French</option>
                    <option>Chinese</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Learning Language</span>
                  </label>
                  <select
                    name="learningLanguage"
                    value={
                      user.isOnborded
                        ? form.learningLanguage || user?.learningLanguage
                        : form.learningLanguage
                    }
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="">Select a language to learn</option>
                    <option>English</option>
                    <option>Spanish</option>
                    <option>Hindi</option>
                    <option>French</option>
                    <option>Chinese</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 hover:to-blue-800 text-white font-medium transition-all"
              >
                {isPending
                  ? "Submitting..."
                  : user.isOnborded
                  ? "Update Profile"
                  : "Continue"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}