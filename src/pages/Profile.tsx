// src/pages/Profile.tsx
import { useState } from "react";
import { useUserStore } from "../stores/useUserStore";
import ProfileEdit from "../components/ProfileEdit";
import AddressList from "../components/AddressList";
import OrderHistory from "../components/OrderHistory";

type TabType = "profile" | "addresses" | "orders";

const ProfilePage = () => {
  const { user, logout } = useUserStore();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [isEditing, setIsEditing] = useState(false);

  // This check is now redundant since ProtectedRoute handles it,
  // but keeping it for safety
  if (!user) {
    return null;
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "addresses", label: "Addresses" },
    { id: "orders", label: "Order History" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">My Account</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsEditing(false);
              }}
              className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "profile" && (
          <>
            {isEditing ? (
              <ProfileEdit
                onCancel={() => setIsEditing(false)}
                onSave={() => setIsEditing(false)}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-4 mb-6">
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-20 h-20 rounded-full"
                    />
                  )}
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-gray-600 text-sm">User ID</label>
                    <p className="text-gray-800 font-medium">{user.id}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-600 text-sm">
                        First Name
                      </label>
                      <p className="text-gray-800 font-medium">
                        {user.firstName}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-600 text-sm">Last Name</label>
                      <p className="text-gray-800 font-medium">
                        {user.lastName}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm">Email</label>
                    <p className="text-gray-800 font-medium">{user.email}</p>
                  </div>
                  {user.phone && (
                    <div>
                      <label className="text-gray-600 text-sm">Phone</label>
                      <p className="text-gray-800 font-medium">{user.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-gray-600 text-sm">
                      Member Since
                    </label>
                    <p className="text-gray-800 font-medium">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-600 text-sm">
                      Last Updated
                    </label>
                    <p className="text-gray-800 font-medium">
                      {new Date(user.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === "addresses" && <AddressList />}

        {activeTab === "orders" && <OrderHistory />}
      </div>
    </div>
  );
};

export default ProfilePage;
