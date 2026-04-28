import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AdminRoute = ({ children }) => {
    const { isAdmin, loading } = useAuth()

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>
    }

    // Silently redirect to home — gives no hint the admin page even exists
    if (!isAdmin) {
        return <Navigate to="/" replace />
    }

    return children ? children : <Outlet />
}

export default AdminRoute
