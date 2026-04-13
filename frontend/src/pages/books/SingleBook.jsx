import React, { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useDeleteBookMutation, useFetchBookByIdQuery } from '../../redux/features/books/booksApi'
import { usePostReviewMutation, useGetReviewsByBookIdQuery } from '../../redux/features/reviews/reviewsApi'
import { getImgUrl } from '../../utils/getImgUrl'
import { FiShoppingCart } from "react-icons/fi"
import { HiEllipsisVertical } from "react-icons/hi2"
import { FaStar, FaRegStar } from "react-icons/fa"
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/features/cart/cartSlice';
import { useAuth } from '../../context/AuthContext';

const StarPicker = ({ rating, setRating }) => (
    <div className="flex gap-1 text-2xl">
        {[1, 2, 3, 4, 5].map((star) => (
            <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
            >
                {star <= rating
                    ? <FaStar className="text-yellow-400" />
                    : <FaRegStar className="text-yellow-400" />}
            </button>
        ))}
    </div>
)

const SingleBook = () => {
    const { isAdmin, currentUser } = useAuth();
    const { id } = useParams()
    const navigate = useNavigate()
    const { data: book, isLoading, isError } = useFetchBookByIdQuery(id)
    const { data: reviews = [], isLoading: isLoadingReviews } = useGetReviewsByBookIdQuery(id)
    const [deleteBook] = useDeleteBookMutation()
    const [postReview, { isLoading: isPosting }] = usePostReviewMutation()

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [comment, setComment] = useState('')
    const [rating, setRating] = useState(5)

    const dispatch = useDispatch();

    const handleAddToCart = (product) => {
        dispatch(addToCart(product));
    }

    const handleReviewSubmit = async (e) => {
        e.preventDefault()
        if (!currentUser) {
            alert("Please log in to post a review.")
            return
        }
        try {
            await postReview({
                bookId: id,
                userId: currentUser.uid,
                email: currentUser.email,
                rating: Number(rating),
                comment
            }).unwrap()
            setComment('')
            setRating(5)
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
            {
                isAdmin && (
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
                )
            }
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
                            <span className="font-semibold">Reviews:</span>
                            <span className="text-gray-600 text-sm">({reviews.length} reviews)</span>
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
                    {/* Review List */}
                    <div className="space-y-4">
                        {isLoadingReviews ? (
                            <p className="text-gray-400">Loading reviews...</p>
                        ) : reviews.length > 0 ? (
                            reviews.map((review) => (
                                <div key={review._id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            s <= review.rating
                                                ? <FaStar key={s} className="text-yellow-400 text-sm" />
                                                : <FaRegStar key={s} className="text-yellow-400 text-sm" />
                                        ))}
                                        <span className="ml-2 text-xs text-gray-500">
                                            {review.email || 'User'}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 italic">"{review.comment}"</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                        )}
                    </div>

                    {/* Review Form - only shown to logged-in users */}
                    {currentUser ? (
                        <div className="bg-white p-6 rounded-lg border shadow-sm h-fit">
                            <h3 className="text-lg font-semibold mb-4">Post a Review</h3>
                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating</label>
                                    <StarPicker rating={rating} setRating={setRating} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                                    <textarea
                                        className="w-full border rounded-md p-2 h-32 focus:ring-2 focus:ring-yellow-400 outline-none resize-none"
                                        placeholder="Tell us what you think..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isPosting}
                                    className="w-full bg-black text-white font-bold py-2 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                                >
                                    {isPosting ? 'Posting...' : 'Post Review'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-6 rounded-lg border text-center text-gray-500">
                            <p>Please <Link to="/login" className="text-blue-500 underline">log in</Link> to leave a review.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SingleBook
