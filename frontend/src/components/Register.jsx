import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaGoogle } from "react-icons/fa";
import { useForm } from "react-hook-form"
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import getBaseUrl from '../utils/baseURL';

const Register = () => {
    const { t } = useTranslation();
    const [message, setMessage] = useState("");
    const { registerUser, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm()

    const onSubmit = async (data) => {
        try {
            // Auto-generate 6-digit userId
            const generatedUserId = Math.floor(100000 + Math.random() * 900000).toString();

            // Register with Firebase first
            await registerUser(data.email, data.password);

            // Then register in our MongoDB backend for additional fields
            await axios.post(`${getBaseUrl()}/api/users/register`, {
                username: data.username,
                userId: generatedUserId,
                email: data.email,
                password: data.password,
                phone: data.phone
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            alert(t("register.success", { userId: generatedUserId }));
            navigate("/")
        } catch (error) {
            setMessage(t("register.error"))
            console.error(error)
        }
    }

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
            alert(t("login.success"));
            navigate("/")
        } catch (error) {
            alert(t("login.googleError"))
            console.error(error)
        }
    }

    return (
        <div className='h-[calc(100vh-120px)] flex justify-center items-center '>
            <div className='w-full max-w-sm mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'>
                <h2 className='text-xl font-semibold mb-4'>{t("register.title")}</h2>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor="username">{t("register.usernameLabel")}</label>
                        <input
                            {...register("username", { required: true })}
                            type="text" name="username" id="username" placeholder={t("register.usernamePlaceholder")}
                            className='shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow'
                        />
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor="email">{t("register.emailLabel")}</label>
                        <input
                            {...register("email", { required: true })}
                            type="email" name="email" id="email" placeholder={t("register.emailPlaceholder")}
                            className='shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow'
                        />
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor="password">{t("register.passwordLabel")}</label>
                        <input
                            {...register("password", { required: true })}
                            type="password" name="password" id="password" placeholder={t("register.passwordPlaceholder")}
                            className='shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow'
                        />
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor="phone">{t("register.phoneLabel")}</label>
                        <input
                            {...register("phone", { required: true })}
                            type="tel" name="phone" id="phone" placeholder={t("register.phonePlaceholder")}
                            className='shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow'
                        />
                    </div>
                    {
                        message && <p className='text-red-500 text-xs italic mb-3'>{message}</p>
                    }
                    <div>
                        <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded focus:outline-none'>{t("register.button")}</button>
                    </div>
                </form>
                <p className='align-baseline font-medium mt-4 text-sm'>{t("register.haveAccount")} <Link to="/login" className='text-blue-500 hover:text-blue-700'>{t("register.loginLink")}</Link></p>

                {/* google sign in */}
                <div className='mt-4'>
                    <button
                        onClick={handleGoogleSignIn}
                        className='w-full flex flex-wrap gap-1 items-center justify-center bg-secondary hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none'>
                        <FaGoogle className='mr-2' />
                        {t("login.googleSignIn")}
                    </button>
                </div>

                <p className='mt-5 text-center text-gray-500 text-xs'>{t("login.footer")}</p>
            </div>
        </div>
    )
}

export default Register
