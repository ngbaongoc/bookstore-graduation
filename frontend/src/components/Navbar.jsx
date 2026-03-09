import React from 'react'
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaBars } from "react-icons/fa";
import { TfiSearch } from "react-icons/tfi";
import { FaRegHeart } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import { GiShoppingCart } from "react-icons/gi";


const Navbar = () => {
  const cartItems = useSelector(state => state.cart.cartItems);
  const wishlistItems = useSelector(state => state.wishlist.wishlistItems);

  const totalQuantity = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <header className="max-w-screen-2xl mx-auto px-4 py-6 flex justify-between items-center">
      {/* left side */}
      <div className="flex items-center md:gap-16 gap-4">
        <Link to="/">
          <FaBars className="w-6 h-6 " />
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
        <button><FaUser className="w-6 h-6" /></button>
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