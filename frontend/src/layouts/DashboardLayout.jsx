import React, { useState } from 'react'
import { Link, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MdDashboard, MdInventory, MdOutlineShoppingCart, MdClose, MdMenu, MdLogout, MdArticle, MdTrendingUp } from 'react-icons/md'
import { FaBell } from 'react-icons/fa'
import { useGetInventoryAlertsQuery } from '../redux/features/inventory/inventoryApi'

const DashboardLayout = () => {
    const { isAdmin, loading } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

    // Admin Alerts Polling
    const { data: alerts } = useGetInventoryAlertsQuery(undefined, { skip: !isAdmin || loading, pollingInterval: 60000 });
    const totalAlerts = (alerts?.lowStockBooksCount || 0) + (alerts?.newOrdersCount || 0) + (alerts?.cancelRequestsCount || 0);

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
        { to: '/admin', label: 'Inventory', icon: <MdInventory className="text-xl" /> },
        { to: '/admin/manage-users', label: 'Manage Users', icon: <MdDashboard className="text-xl opacity-70" /> },
        { to: '/admin/add-blog', label: 'Blog Posts', icon: <MdArticle className="text-xl" /> },
        { to: '/admin/orders', label: 'Orders', icon: <MdOutlineShoppingCart className="text-xl" /> },
        { to: '/admin/sales', label: 'Sales Intelligence', icon: <MdTrendingUp className="text-xl text-blue-400" /> },
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

            {/* Main Content with Top Nav */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
                {/* Admin Top Header (For Notifications) */}
                <header className="bg-white border-b border-gray-200 h-16 shrink-0 flex justify-end items-center px-8 shadow-sm relative z-20">
                    <div className="relative">
                        <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="relative flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition">
                            <FaBell className={`w-5 h-5 transition ${totalAlerts > 0 ? 'text-blue-600 animate-pulse' : 'text-gray-500'}`} />
                            {totalAlerts > 0 && (
                                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow ring-2 ring-white">
                                    {totalAlerts}
                                </span>
                            )}
                        </button>
                        
                        {isNotificationsOpen && (
                            <div className="absolute right-0 mt-3 w-72 bg-white shadow-2xl rounded-xl border border-gray-100 py-4 px-5 z-50">
                                <h3 className="text-sm font-extrabold text-gray-800 mb-3 border-b pb-2">Admin Alerts Dashboard</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${alerts?.newOrdersCount > 0 ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-gray-300'}`}></div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{alerts?.newOrdersCount || 0} New Orders</p>
                                            <p className="text-xs text-gray-500 leading-tight">Placed recently</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${alerts?.lowStockBooksCount > 0 ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'bg-gray-300'}`}></div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{alerts?.lowStockBooksCount || 0} Low Stock Alert</p>
                                            <p className="text-xs text-gray-500 leading-tight">Items dropping under 10 units</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 border-t pt-3">
                                        <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${alerts?.cancelRequestsCount > 0 ? 'bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.5)]' : 'bg-gray-300'}`}></div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{alerts?.cancelRequestsCount || 0} Cancel Requests</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-gray-500 leading-tight">Pending review</p>
                                                {alerts?.cancelRequestsCount > 0 && <Link to="/admin/orders" onClick={() => setIsNotificationsOpen(false)} className="text-[10px] text-orange-600 font-bold hover:underline bg-orange-50 px-1.5 py-0.5 rounded">Review →</Link>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {totalAlerts > 0 && location.pathname !== '/admin' && (
                                    <Link to="/admin" onClick={() => setIsNotificationsOpen(false)} className="block text-center mt-5 pt-3 text-[13px] text-blue-600 border-t hover:underline font-bold">
                                        Go to Inventory →
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-8 overflow-y-auto flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default DashboardLayout
