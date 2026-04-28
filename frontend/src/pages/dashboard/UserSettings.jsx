import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from "react-hook-form";

const UserSettings = () => {
    const { currentUser, userProfile, updateUserProfile, syncProfile, loading } = useAuth();
    const [message, setMessage] = useState("");

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        if (userProfile) {
            setValue("username", userProfile.username);
            setValue("email", userProfile.email);
            setValue("phone", userProfile.phone);
            setValue("userId", userProfile.userId);
        } else if (currentUser) {
            setValue("email", currentUser.email);
            setValue("username", currentUser.displayName || "");
        }
    }, [userProfile, currentUser, setValue]);

    const onSubmit = async (data) => {
        try {
            if (userProfile) {
                await updateUserProfile(userProfile.email, {
                    username: data.username,
                    email: data.email,
                    phone: data.phone
                });
                setMessage("Profile updated successfully!");
            } else {
                // Initial sync for Firebase user - Auto-generate 6-digit userId
                const generatedUserId = Math.floor(100000 + Math.random() * 900000).toString();
                
                await syncProfile({
                    username: data.username,
                    userId: generatedUserId,
                    email: data.email,
                    phone: data.phone
                });
                setMessage(`Profile created successfully! Your User ID is ${generatedUserId}`);
            }
            setTimeout(() => setMessage(""), 3000);
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.response?.data?.message || "Failed to save profile. Please try again.";
            setMessage(errorMsg);
            console.error(error);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!currentUser) return <div>Please login to access settings.</div>;

    return (
        <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">User Settings</h2>
            {!userProfile && <p className="text-blue-600 mb-6 text-sm italic">Profile not found in database. Please complete your information below to create it.</p>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {userProfile && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">User ID (Immutable)</label>
                        <input
                            type="text"
                            value={userProfile.userId}
                            disabled
                            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm cursor-not-allowed"
                        />
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                        {...register("username", { required: true })}
                        type="text"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                        {...register("email", { required: true })}
                        type="email"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                        {...register("phone", { required: true })}
                        type="tel"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                {message && (
                    <p className={`text-sm ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
                        {message}
                    </p>
                )}
                <div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserSettings;
