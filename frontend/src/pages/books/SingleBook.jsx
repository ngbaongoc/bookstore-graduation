import React, { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useDeleteBookMutation, useFetchBookByIdQuery, useAddReviewMutation } from '../../redux/features/books/booksApi'
import { getImgUrl } from '../../utils/getImgUrl'
import { FiShoppingCart, FiStar } from "react-icons/fi"
import { HiEllipsisVertical } from "react-icons/hi2"
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/features/cart/cartSlice';

const SingleBook = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data: book, isLoading, isError } = useFetchBookByIdQuery(id)
    const [deleteBook] = useDeleteBookMutation()
    const [addReview, { isLoading: isAddingReview }] = useAddReviewMutation()

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [reviewText, setReviewText] = useState('')
    const [reviewScore, setReviewScore] = useState(5)

    const dispatch = useDispatch();

    const handleAddToCart = (product) => {
        dispatch(addToCart(product));
    }

    const handleReviewSubmit = async (e) => {
        e.preventDefault()
        try {
            await addReview({ id, review: reviewText, score: reviewScore }).unwrap()
            setReviewText('')
            setReviewScore(5)
            alert("Review posted successfully!")
        } catch (err) {
            alert("Failed to post review: " + (err.data?.message || err.message))
        }
    }

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this book?")) {
            try {
                await deleteBook(id).unwrap()
                alert("Book deleted successfully")
                navigate('/')
            } catch (err) {
                alert("Failed to delete book: " + (err.data?.message || err.message))
            }
        }
    }

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>
    if (isError) return <div className="flex justify-center items-center h-screen">Error loading book details</div>

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10 relative">
            <div className="absolute top-4 right-4">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <HiEllipsisVertical className="text-2xl text-gray-600" />
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg z-10">
                        <Link
                            to={`/books/edit/${id}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Edit Book
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            Delete Book
                        </button>
                    </div>
                )}
            </div>
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2">
                    <img
                        src={getImgUrl(book?.thumbnail || book?.coverImage)}
                        alt={book?.title}
                        className="w-full h-auto rounded-lg shadow-sm"
                    />
                </div>
                <div className="md:w-1/2 flex flex-col justify-center">
                    <h1 className="text-3xl font-bold mb-4">{book?.title}</h1>
                    <div className="space-y-4 text-gray-700">
                        <p><span className="font-semibold">Author:</span> {book?.author}</p>
                        <p><span className="font-semibold">Category:</span> {book?.category}</p>
                        <p><span className="font-semibold">ISBN:</span> {book?.isbn}</p>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Rating:</span>
                            <div className="flex items-center text-yellow-500">
                                <FiStar className="fill-current" />
                                <span className="ml-1 font-bold text-gray-900">{book?.average_review_score?.toFixed(1) || '0.0'}</span>
                            </div>
                            <span className="text-gray-500 text-sm">({book?.number_of_review || 0} reviews)</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book?.price || book?.newPrice)}
                        </p>
                    </div>
                    <button
                        onClick={() => handleAddToCart(book)}
                        className="mt-8 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-8 rounded-md flex items-center justify-center gap-2 transition-colors w-max">
                        <FiShoppingCart />
                        <span>Add to Cart</span>
                    </button>
                </div>
            </div>

            {/* Review Section */}
            <div className="mt-12 border-t pt-8">
                <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Display Reviews */}
                    <div className="space-y-6">
                        {book?.review_text?.length > 0 ? (
                            book.review_text.map((review, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-100 italic text-gray-700">
                                    "{review}"
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                        )}
                    </div>

                    {/* Review Form */}
                    <div className="bg-white p-6 rounded-lg border shadow-sm h-fit">
                        <h3 className="text-lg font-semibold mb-4">Post a Review</h3>
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                <select
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-yellow-400 outline-none"
                                    value={reviewScore}
                                    onChange={(e) => setReviewScore(e.target.value)}
                                >
                                    {[5, 4, 3, 2, 1].map(num => (
                                        <option key={num} value={num}>{num} Stars</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                                <textarea
                                    className="w-full border rounded-md p-2 h-32 focus:ring-2 focus:ring-yellow-400 outline-none resize-none"
                                    placeholder="Tell us what you think..."
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isAddingReview}
                                className="w-full bg-black text-white font-bold py-2 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                            >
                                {isAddingReview ? 'Posting...' : 'Post Review'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SingleBook
