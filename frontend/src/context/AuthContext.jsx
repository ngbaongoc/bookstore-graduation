import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase.config";
import axios from 'axios';
import getBaseUrl from '../utils/baseURL';
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut
} from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
}

const googleProvider = new GoogleAuthProvider();

// authProvider
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // register user
    const registerUser = async (email, password) => {
        return await createUserWithEmailAndPassword(auth, email, password);
    }

    // login user
    const loginUser = async (email, password) => {
        return await signInWithEmailAndPassword(auth, email, password);
    }

    // sign up with google
    const signInWithGoogle = async () => {
        return await signInWithPopup(auth, googleProvider);
    }

    // logout user
    const logoutUser = () => {
        localStorage.removeItem('token')
        setIsAdmin(false)
        setUserProfile(null)
        return signOut(auth);
    }

    // call this after storing a token to sync isAdmin state
    const checkAdmin = () => {
        const token = localStorage.getItem('token');
        setIsAdmin(!!token);
    }

    const fetchUserProfile = async (email) => {
        setProfileLoading(true);
        try {
            const response = await axios.get(`${getBaseUrl()}/api/users/profile/${email}`);
            setUserProfile(response.data);
        } catch (error) {
            console.error("Error fetching user profile", error);
            setUserProfile(null);
        } finally {
            setProfileLoading(false);
        }
    }

    // manage user
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                await fetchUserProfile(user.email);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        // Check for admin token
        const token = localStorage.getItem('token');
        if (token) {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }

        return () => unsubscribe();
    }, []);

    const updateUserProfile = async (email, data) => {
        setProfileLoading(true);
        try {
            const response = await axios.put(`${getBaseUrl()}/api/users/profile/${email}`, data);
            setUserProfile(response.data.user);
            return response.data;
        } catch (error) {
            console.error("Error updating user profile", error);
            throw error;
        } finally {
            setProfileLoading(false);
        }
    }

    const syncProfile = async (data) => {
        setProfileLoading(true);
        try {
            const response = await axios.post(`${getBaseUrl()}/api/users/sync-profile`, data);
            setUserProfile(response.data.user);
            return response.data;
        } catch (error) {
            console.error("Error syncing user profile", error);
            throw error;
        } finally {
            setProfileLoading(false);
        }
    }

    const value = {
        currentUser,
        userProfile,
        loading,
        profileLoading,
        isAdmin,
        checkAdmin,
        registerUser,
        loginUser,
        signInWithGoogle,
        logoutUser,
        updateUserProfile,
        syncProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
