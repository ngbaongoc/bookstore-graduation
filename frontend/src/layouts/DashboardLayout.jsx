import React, { useState } from 'react'
import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MdDashboard, MdInventory, MdOutlineShoppingCart, MdClose, MdMenu, MdLogout, MdArticle, MdLocalShipping } from 'react-icons/md'

const DashboardLayout = () => {
    const { isAdmin, loading } = useAuth()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>
    }

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/')
        window.location.reload()
    }

    const navLinks = [
        { to: '/admin', label: 'Dashboard', icon: <MdDashboard className="text-xl" /> },
        { to: '/admin/e-logistics', label: 'E-Logistics', icon: <MdLocalShipping className="text-xl" /> },
        { to: '/admin/manage-users', label: 'Manage Users', icon: <MdDashboard className="text-xl opacity-70" /> },
        { to: '/admin/add-book', label: 'Add New Book', icon: <MdInventory className="text-xl" /> },
        { to: '/admin/add-blog', label: 'Blog Posts', icon: <MdArticle className="text-xl" /> },
        { to: '/admin/orders', label: 'Orders', icon: <MdOutlineShoppingCart className="text-xl" /> },
    ]

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} bg-gray-900 text-white flex flex-col transition-all duration-300 shrink-0`}>
                {/* Logo/Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    {sidebarOpen && <span className="font-bold text-lg tracking-wide">Admin Panel</span>}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="ml-auto text-gray-400 hover:text-white transition-colors">
                        {sidebarOpen ? <MdClose className="text-xl" /> : <MdMenu className="text-xl" />}
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 py-4">
                    {navLinks.map(({ to, label, icon }) => (
                        <Link
                            key={to}
                            to={to}
                            className="flex items-center gap-4 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                            title={!sidebarOpen ? label : ''}
                        >
                            {icon}
                            {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 w-full text-gray-300 hover:text-red-400 transition-colors"
                        title={!sidebarOpen ? 'Logout' : ''}
                    >
                        <MdLogout className="text-xl" />
                        {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default DashboardLayout
