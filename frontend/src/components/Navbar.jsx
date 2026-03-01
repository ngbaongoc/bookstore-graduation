import React from 'react'
import { Link } from 'react-router-dom';
import { FaBars } from "react-icons/fa";
import { TfiSearch } from "react-icons/tfi";
import { FaRegHeart } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import { GiShoppingCart } from "react-icons/gi";


const Navbar = () => {
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
        <button><FaRegHeart className="w-6 h-6" /></button>
        <button><GiShoppingCart className="w-8 h-8" /></button>
      </div>
    </header>
  )
}

export default Navbar;