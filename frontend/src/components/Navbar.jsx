import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { FaBell, FaShoppingCart, FaUser, FaGlobe } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import logo from '../assets/logo.png';

import { useAuth } from '../context/AuthContext';
import { useGetInventoryAlertsQuery } from '../redux/features/inventory/inventoryApi';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    
    const cartItems = useSelector(state => state.cart.cartItems);
    const totalQuantity = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
    const location = useLocation();

    const { currentUser, logoutUser, isAdmin } = useAuth();
    const { data: alerts } = useGetInventoryAlertsQuery(undefined, { skip: !isAdmin, pollingInterval: 60000 });
    const totalAlerts = (alerts?.lowStockBooksCount || 0) + (alerts?.newOrdersCount || 0);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Products", href: "/books" },
        { name: "About us", href: "/about" },
        { name: "Blog", href: "/blog" },
        { name: "Contact", href: "/contact" },
    ];

    const userNavigation = [
        ...(isAdmin ? [{ name: "Dashboard", href: "/admin" }] : []),
        { name: "My Orders", href: "/orders" },
        { name: "Cart Page", href: "/cart" },
        ...(currentUser ? [{ name: "Settings", href: "/settings" }] : []),
    ];

    const handleLogOut = () => {
        logoutUser();
        localStorage.removeItem('token');
        setIsUserDropdownOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm font-sans">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
                        <img src={logo} alt="BookShare" className="h-10 w-10" />
                        <span className="text-2xl font-bold tracking-tight text-[#008080] italic">BookShare</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className={`text-sm font-semibold transition-colors duration-200 ${
                                    isActive(link.href) ? 'text-[#008080]' : 'text-gray-600 hover:text-[#008080]'
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        
                        {/* Language Selector (Placeholder) */}
                        <button className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-[#008080] transition-colors">
                            <FaGlobe className="text-xs" />
                            <span>Language</span>
                        </button>

                        {/* Functional Icons */}
                        <div className="flex items-center gap-5 ml-4 pl-8 border-l border-gray-100">
                            {/* Admin Alerts */}
                            {isAdmin && (
                                <div className="relative">
                                    <button 
                                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                        className="text-gray-500 hover:text-blue-600 transition-colors pt-1"
                                    >
                                        <FaBell className={`w-5 h-5 ${totalAlerts > 0 ? 'text-blue-600 animate-pulse' : ''}`} />
                                        {totalAlerts > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                                {totalAlerts}
                                            </span>
                                        )}
                                    </button>
                                    
                                    {isNotificationsOpen && (
                                        <div className="absolute right-0 mt-4 w-64 bg-white shadow-2xl rounded-xl border border-gray-100 py-4 px-5 z-50">
                                            <h3 className="text-sm font-bold text-gray-800 mb-3 border-b pb-2">Admin Alerts</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${alerts?.newOrdersCount > 0 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                                    <p className="text-sm text-gray-700">{alerts?.newOrdersCount || 0} New Orders</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${alerts?.lowStockBooksCount > 0 ? 'bg-red-500' : 'bg-gray-200'}`}></div>
                                                    <p className="text-sm text-gray-700">{alerts?.lowStockBooksCount || 0} Low Stock Alert</p>
                                                </div>
                                            </div>
                                            <Link to="/admin" onClick={() => setIsNotificationsOpen(false)} className="block text-center mt-4 pt-3 text-xs text-blue-600 border-t hover:underline">
                                                Go to Dashboard →
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* User Account */}
                            <div className="relative">
                                {currentUser || isAdmin ? (
                                    <>
                                        <button 
                                            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                            className="flex items-center pt-1"
                                        >
                                            <img src="https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff" alt="" className="h-7 w-7 rounded-full ring-2 ring-gray-100 hover:ring-[#008080] transition-all" />
                                        </button>
                                        {isUserDropdownOpen && (
                                            <div className="absolute right-0 mt-4 w-48 bg-white shadow-2xl rounded-xl border border-gray-100 py-2 z-50 overflow-hidden text-sm font-medium">
                                                {userNavigation.map((item) => (
                                                    <Link key={item.name} to={item.href} onClick={() => setIsUserDropdownOpen(false)} className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#008080]">
                                                        {item.name}
                                                    </Link>
                                                ))}
                                                <button onClick={handleLogOut} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 border-t mt-1">
                                                    Logout
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link to="/login" className="text-gray-500 hover:text-[#008080] transition-colors">
                                        <FaUser className="w-5 h-5" />
                                    </Link>
                                )}
                            </div>

                            {/* Cart */}
                            <Link to="/cart" className="relative text-gray-500 hover:text-[#008080] transition-colors pt-1">
                                <FaShoppingCart className="w-6 h-6" />
                                {totalQuantity > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                        {totalQuantity}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center gap-4">
                        <Link to="/cart" className="relative text-gray-500">
                             <FaShoppingCart className="w-6 h-6" />
                             {totalQuantity > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] rounded-full h-3 w-3 flex items-center justify-center font-bold">{totalQuantity}</span>}
                        </Link>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
                            {isMenuOpen ? <HiX className="h-8 w-8" /> : <HiMenu className="h-8 w-8" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="lg:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-1 animate-in slide-in-from-top duration-300">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={`block px-3 py-2.5 rounded-md text-base font-semibold ${
                                isActive(link.href) ? 'bg-gray-50 text-[#008080]' : 'text-gray-700 hover:bg-gray-50 hover:text-[#008080]'
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="pt-4 border-t border-gray-100 flex gap-4 px-3">
                         <Link to="/login" className="text-sm font-bold text-gray-800">Account</Link>
                         <button className="text-sm font-bold text-gray-600">Language</button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;