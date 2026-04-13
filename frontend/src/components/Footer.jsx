import React from 'react'
import { Link } from 'react-router-dom'
import { FaLinkedin, FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa'
import logo from '../assets/logo.png'
import mapImg from '../assets/map.png'
import badgeImg from '../assets/badge.png'

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-[#0A0D0F] text-white py-12 px-4 md:px-12 font-sans">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-800 pb-12 mb-8">
                {/* ABOUT */}
                <div>
                    <h3 className="text-gray-400 font-bold mb-6 tracking-wider uppercase text-sm">About</h3>
                    <ul className="space-y-3 text-sm">
                        <li><button onClick={scrollToTop} className="hover:text-cyan-400 transition-colors">Home</button></li>
                       
                        <li><Link to="/about" className="hover:text-cyan-400 transition-colors">About us</Link></li>
                        <li><Link to="/blog" className="hover:text-cyan-400 transition-colors">Blog</Link></li>
                        <li><Link to="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link></li>
                        <li><Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy policy</Link></li>
                    </ul>
                </div>

                {/* PRODUCTS */}
                <div>
                    <h3 className="text-gray-400 font-bold mb-6 tracking-wider uppercase text-sm">Products</h3>
                    <ul className="space-y-3 text-sm">
                        
                        <li><Link to="/skoolib" className="hover:text-cyan-400 transition-colors">SkooLib</Link></li>
                        <li><Link to="/handy-library" className="hover:text-cyan-400 transition-colors">Handy Library</Link></li>
                
                    </ul>
                </div>

                {/* GET IN TOUCH */}
                <div>
                    <h3 className="text-gray-400 font-bold mb-6 tracking-wider uppercase text-sm">Get in touch</h3>
                    <div className="space-y-3 text-sm">
                        <p>Bookshare Co., Ltd</p>
                        <p className="text-gray-300">support@bookshare.app</p>
                        <p className="text-gray-300">(+84) 346-097-901</p>
                       
                    </div>
                </div>

                {/* LOCATION */}
                <div>
                    <h3 className="text-gray-400 font-bold mb-6 tracking-wider uppercase text-sm">Location</h3>
                    <div className="space-y-4 text-sm">
                        <p className="text-gray-300 leading-relaxed">
                            Software Park No. 2, Nhu Nguyet Street, Hai Chau Ward, Da Nang City
                        </p>
                        <div className="rounded-lg overflow-hidden h-32 w-full border border-gray-800">
                            <img src={mapImg} alt="Da Nang Location Map" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="BookShare Logo" className="h-10 w-10" />
                    <span className="text-2xl font-bold tracking-tight text-white italic">BookShare</span>
                </div>

                <div className="flex items-center gap-6 text-xl text-gray-400">
                    <a href="#" className="hover:text-white transition-colors"><FaLinkedin /></a>
                    <a href="#" className="hover:text-white transition-colors"><FaTwitter /></a>
                    <a href="#" className="hover:text-white transition-colors"><FaFacebook /></a>
                    <a href="#" className="hover:text-white transition-colors"><FaInstagram /></a>
                </div>

                <p className="text-gray-500 text-xs">
                    ©2026 BookShare. All right reserved.
                </p>
            </div>
        </footer>
    )
}

export default Footer
