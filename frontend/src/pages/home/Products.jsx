import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import BookCard from './BookCard';
import { useFetchAllBooksQuery } from '../../redux/features/books/booksApi';
import { useAuth } from '../../context/AuthContext';

const categories = ["Choose a genre", "Business", "Fiction", "Horror", "Adventure", "Marketing"]

const Products = () => {
    const { isAdmin } = useAuth();
    const [selectedCategory, setSelectedCategory] = useState("Choose a genre");
    const [currentPage, setCurrentPage] = useState(0);
    const [direction, setDirection] = useState(0);

    const { data: books = [], isLoading, isError } = useFetchAllBooksQuery();

    const filteredBooks = selectedCategory === "Choose a genre" 
        ? books 
        : books.filter(book => book.category === selectedCategory);

    const pageSize = 9;
    const totalPages = Math.ceil(filteredBooks.length / pageSize);

    // Reset page when category changes
    useEffect(() => {
        setCurrentPage(0);
    }, [selectedCategory]);

    const displayedBooks = filteredBooks.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

    const handleNext = () => {
        if (currentPage < totalPages - 1) {
            setDirection(1);
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 0) {
            setDirection(-1);
            setCurrentPage(prev => prev - 1);
        }
    };

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    };

    if (isLoading) return <div className="h-60 flex items-center justify-center">Loading...</div>
    if (isError) return <div className="h-60 flex items-center justify-center text-red-500">Error loading books</div>

    return (
        <div className='py-16 relative'>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h2 className='text-3xl font-bold text-gray-900 mb-2'>Products</h2>
                    {totalPages > 1 && (
                        <p className="text-sm text-gray-500 font-medium">
                            Showing page {currentPage + 1} of {totalPages}
                        </p>
                    )}
                </div>
                
                <div className="flex items-center gap-4">
                    {isAdmin && (
                        <Link
                            to="/admin/add-book"
                            className="bg-[#008080] hover:bg-[#006666] text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-sm flex items-center gap-2">
                            <span>+ Add New Book</span>
                        </Link>
                    )}
                    
                    <select
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        name="category" 
                        id="category" 
                        className='border border-gray-200 bg-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#008080] transition-shadow text-sm font-medium text-gray-700'
                        value={selectedCategory}
                    >
                        {categories.map((category, index) => (
                            <option key={index} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Slider Container */}
            <div className="relative overflow-hidden min-h-[800px]">
                <AnimatePresence initial={false} custom={direction}>
                    {displayedBooks.length > 0 ? (
                        <motion.div
                            key={currentPage + selectedCategory}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            className="w-full"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {displayedBooks.map((book, index) => (
                                    <div key={book._id || index} className="flex justify-center">
                                        <BookCard book={book} />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-60 flex flex-col items-center justify-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200"
                        >
                            <p className="text-lg font-medium">No books found in this genre</p>
                            <button 
                                onClick={() => setSelectedCategory("Choose a genre")}
                                className="mt-2 text-[#008080] hover:underline font-semibold"
                            >
                                View all products
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation Arrows */}
                {totalPages > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            disabled={currentPage === 0}
                            className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow-lg border border-gray-100 transition-all ${currentPage === 0 ? 'opacity-0 cursor-default' : 'hover:bg-gray-50 hover:scale-110 active:scale-95 text-[#008080]'}`}
                        >
                            <MdChevronLeft size={32} />
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages - 1}
                            className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow-lg border border-gray-100 transition-all ${currentPage === totalPages - 1 ? 'opacity-0 cursor-default' : 'hover:bg-gray-50 hover:scale-110 active:scale-95 text-[#008080]'}`}
                        >
                            <MdChevronRight size={32} />
                        </button>
                    </>
                )}
            </div>

            {/* Pagination Dots */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12 text-black">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setDirection(i > currentPage ? 1 : -1);
                                setCurrentPage(i);
                            }}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentPage ? 'bg-[#008080] w-8' : 'bg-gray-300 hover:bg-gray-400'}`}
                            aria-label={`Go to page ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default Products
