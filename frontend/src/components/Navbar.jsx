import React from 'react'
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaBars } from "react-icons/fa";
import { TfiSearch } from "react-icons/tfi";
import { FaRegHeart } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import { GiShoppingCart } from "react-icons/gi";


import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
  const cartItems = useSelector(state => state.cart.cartItems);
  const wishlistItems = useSelector(state => state.wishlist.wishlistItems);

  const totalQuantity = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const { currentUser, logoutUser, isAdmin } = useAuth()

  const navigation = [
    ...(isAdmin ? [{ name: "Dashboard", href: "/admin" }] : []),
    ...(isAdmin ? [{ name: "Add New Book", href: "/admin/add-book" }] : []),
    { name: "Orders", href: "/orders" },
    { name: "Cart Page", href: "/cart" },
    { name: "Check Out", href: "/checkout" },
    ...(currentUser ? [{ name: "Settings", href: "/settings" }] : []),
  ]

  const handleLogOut = () => {
    logoutUser()
    localStorage.removeItem('token')
  }

  return (
    <header className="max-w-screen-2xl mx-auto px-4 py-6 flex justify-between items-center">
      {/* left side */}
      <div className="flex items-center md:gap-16 gap-4">
        <Link to="/">
          <FaBars className="w-6 h-6 " />
        </Link>

        {/* Blog link */}
        <Link to="/blog" className="hidden md:block text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
          Blog
        </Link>

        {/* search input */}
        <div className="relative sm:w-72 w-40 space-x-2">
          <TfiSearch className="absolute inline-block left-3 bottom-1.5" />
          <input
            type="text"
            placeholder="Search here"
            className="bg-[#EAEAEA] w-full py-1 md:px-10 px-10 rounded-md focus:outline-none"
          />
        </div>
      </div>

      {/* right side */}
      <div className="flex items-center space-x-5 px-10">
        <div>
          {
            (currentUser || isAdmin) ? <>
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <img src="https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff" alt="" className={`size-7 rounded-full ${(currentUser || isAdmin) ? 'ring-2 ring-blue-500' : ''}`} />
              </button>
              {/* show dropdowns */}
              {
                isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-40">
                    <ul className="py-2">
                      {
                        navigation.map((item) => (
                          <li key={item.name} onClick={() => setIsDropdownOpen(false)}>
                            <Link to={item.href} className="block px-4 py-2 text-sm hover:bg-gray-100">
                              {item.name}
                            </Link>
                          </li>
                        ))
                      }
                      <li>
                        <button
                          onClick={handleLogOut}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Logout</button>
                      </li>
                    </ul>
                  </div>
                )
              }
            </> : <Link to="/login"> <FaUser className="size-6" /></Link>
          }
        </div>

        <Link to="/wishlist" className="relative">
          <FaRegHeart className="w-6 h-6" />
          {wishlistItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {wishlistItems.length}
            </span>
          )}
        </Link>
        <Link to="/cart" className="relative">
          <GiShoppingCart className="w-8 h-8" />
          {totalQuantity > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {totalQuantity}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}

export default Navbar;