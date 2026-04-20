import React from 'react'
import { Link } from 'react-router-dom'
import { FaBookOpen, FaTruck, FaHeadset, FaShieldAlt } from 'react-icons/fa'

const stats = [
    { label: 'Books Available', value: '10,000+' },
    { label: 'Happy Customers', value: '5,000+' },
    { label: 'Orders Delivered', value: '15,000+' },
    { label: 'Years of Service', value: '5+' },
]

const values = [
    {
        icon: <FaBookOpen className="text-3xl text-[#008080]" />,
        title: 'Curated Collection',
        description: 'Every book in our store is carefully selected to ensure quality content that inspires, educates, and entertains.',
    },
    {
        icon: <FaTruck className="text-3xl text-[#008080]" />,
        title: 'Fast Delivery',
        description: 'We partner with trusted logistics providers to deliver your books safely and swiftly to your doorstep.',
    },
    {
        icon: <FaShieldAlt className="text-3xl text-[#008080]" />,
        title: 'Best Prices',
        description: 'Enjoy competitive pricing and regular promotions. Great books should be accessible to everyone.',
    },
    {
        icon: <FaHeadset className="text-3xl text-[#008080]" />,
        title: '24/7 Support',
        description: 'Our dedicated support team is always ready to help you with any questions or concerns.',
    },
]

const About = () => {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#008080] to-[#005f5f] text-white py-20 px-4 rounded-2xl">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">About Our Bookstore</h1>
                    <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                        We believe that books have the power to change lives. Our mission is to connect readers
                        with stories that inspire, educate, and spark imagination.
                    </p>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Founded with a simple idea — to make quality books accessible to everyone — our bookstore
                                has grown from a small passion project into a thriving community of book lovers.
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                We started by curating a small collection of must-read titles and have since expanded
                                to offer thousands of books across every genre imaginable. From timeless classics to
                                the latest bestsellers, we have something for every reader.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                What sets us apart is our dedication to the reading experience. We don't just sell books
                                — we help you discover your next favorite story.
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-8 flex items-center justify-center">
                            <div className="text-center">
                                <span className="text-8xl">📚</span>
                                <p className="mt-4 text-gray-500 italic text-lg">"A reader lives a thousand lives before he dies."</p>
                                <p className="text-gray-400 mt-2">— George R.R. Martin</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="bg-gray-50 py-16 px-4 rounded-2xl">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">By the Numbers</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <p className="text-3xl md:text-4xl font-bold text-[#008080]">{stat.value}</p>
                                <p className="text-gray-500 mt-2 text-sm">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">Why Choose Us</h2>
                    <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
                        We're committed to providing the best experience for every book lover.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-8">
                        {values.map((value, index) => (
                            <div key={index} className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                                <div className="w-14 h-14 bg-[#008080]/10 rounded-xl flex items-center justify-center mb-4">
                                    {value.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">{value.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-gradient-to-br from-[#008080] to-[#005f5f] text-white py-16 px-4 rounded-2xl mb-4">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Find Your Next Read?</h2>
                    <p className="text-white/80 mb-8">Browse our collection and discover books that will captivate your mind.</p>
                    <Link
                        to="/"
                        className="inline-block bg-white text-[#008080] font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                    >
                        Explore Books
                    </Link>
                </div>
            </section>
        </div>
    )
}

export default About
