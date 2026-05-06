import React, { useState } from 'react'
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useDeleteBookMutation, useFetchBookByIdQuery } from '../../redux/features/books/booksApi'
import { usePostReviewMutation, useGetReviewsByBookIdQuery } from '../../redux/features/reviews/reviewsApi'
import { getImgUrl } from '../../utils/getImgUrl'
import { FiShoppingCart, FiMusic, FiFilm, FiEdit3 } from "react-icons/fi"
import { HiEllipsisVertical } from "react-icons/hi2"
import { FaStar, FaRegStar, FaQuoteLeft } from "react-icons/fa"
import { useDispatch } from 'react-redux';
import { addToCart } from '../../redux/features/cart/cartSlice';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    const { isAdmin, currentUser } = useAuth();
    const { id } = useParams()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
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

    React.useEffect(() => {
        if (searchParams.get('vote') === 'true') {
            Swal.fire({
                title: t('books.voteThanksTitle', 'Thanks for voting! 🎁'),
                text: t('books.voteThanksDesc', 'Use code CURATE10 for 10% off your next purchase.'),
                icon: 'success',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Awesome!'
            }).then(() => {
                // Remove the vote and source params
                searchParams.delete('vote');
                searchParams.delete('source');
                setSearchParams(searchParams, { replace: true });
            });
        }
        
        if (searchParams.get('mystery') === 'true') {
            Swal.fire({
                title: t('books.mysteryTitle', 'Surprise! You found it! 🎉'),
                text: t('books.mysteryDesc', 'Use code MYSTERY20 for 20% off your next purchase.'),
                icon: 'success',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Awesome!'
            }).then(() => {
                // Remove the mystery param
                searchParams.delete('mystery');
                setSearchParams(searchParams, { replace: true });
            });
        }
    }, [searchParams, setSearchParams, t]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault()
        if (!currentUser) {
            alert(t("single.loginRequired"))
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
            alert(t("single.postError") + ": " + (err.data?.message || err.message))
        }
    }

    const handleDelete = async () => {
        if (window.confirm(t("single.deleteConfirm"))) {
            try {
                await deleteBook(id).unwrap()
                alert(t("single.deleteSuccess"))
                navigate('/')
            } catch (err) {
                alert(t("single.deleteError") + ": " + (err.data?.message || err.message))
            }
        }
    }

    if (isLoading) return <div className="flex justify-center items-center h-screen">{t("nav.loading")}...</div>
    if (isError) return <div className="flex justify-center items-center h-screen">{t("books.loadingError")}</div>

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
                                    {t("single.editBook")}
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                    {t("single.deleteBook")}
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
                        <p><span className="font-semibold">{t("single.author")}:</span> {book?.author}</p>
                        <p><span className="font-semibold">{t("single.category")}:</span> {book?.category}</p>
                        <p><span className="font-semibold">{t("single.isbn")}:</span> {book?.isbn}</p>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">{t("single.reviews")}:</span>
                            <span className="text-gray-600 text-sm">{t("single.reviewsCount", { count: reviews.length })}</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book?.price || book?.newPrice)}
                        </p>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <button
                            onClick={() => handleAddToCart(book)}
                            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-8 rounded-md flex items-center justify-center gap-2 transition-colors">
                            <FiShoppingCart />
                            <span>{t("single.addToCart")}</span>
                        </button>

                        {book?.cinemaLink && (
                            <a 
                                href={book.cinemaLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 font-semibold py-3 px-6 rounded-md flex items-center justify-center gap-2 transition-colors"
                            >
                                <FiFilm />
                                <span>Cinematic</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Featured Quote Art Section */}
            {book?.featuredQuote && (
                <div className="mt-12 bg-gray-50 p-8 rounded-2xl border-l-4 border-black relative overflow-hidden group">
                    <FaQuoteLeft className="absolute -top-4 -left-2 text-8xl text-gray-100 z-0" />
                    <div className="relative z-10">
                        <p className="text-xl italic font-serif leading-relaxed text-gray-800 mb-4">
                            "{book.featuredQuote}"
                        </p>
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">— {book.author}</p>
                            <button 
                                onClick={() => Swal.fire('Coming Soon', 'Tính năng xuất ảnh nghệ thuật đang được phát triển!', 'info')}
                                className="text-xs text-gray-400 flex items-center gap-1 hover:text-black transition-colors"
                            >
                                <FiEdit3 /> Chia sẻ ảnh
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-12 border-t pt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <h2 className="text-2xl font-bold mb-4">Mô tả</h2>
                    <p className="text-gray-700 leading-relaxed">
                        {book?.description || t("single.noDescription")}
                    </p>
                </div>
                
                {book?.cinemaComparison && (
                    <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 h-fit">
                        <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                            <FiFilm className="text-blue-500" /> Góc nhìn điện ảnh
                        </h3>
                        <p className="text-sm text-blue-800 leading-relaxed italic">
                            "{book.cinemaComparison}"
                        </p>
                    </div>
                )}
            </div>

            {/* Customer Reviews */}
            <div className="mt-12 border-t pt-8">
                <h2 className="text-2xl font-bold mb-6">{t("single.customerReviews")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Review List */}
                    <div className="space-y-4">
                        {isLoadingReviews ? (
                            <p className="text-gray-400">{t("single.loadingReviews")}</p>
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
                            <p className="text-gray-500">{t("single.noReviews")}</p>
                        )}
                    </div>

                    {/* Review Form - only shown to logged-in users */}
                    {currentUser ? (
                        <div className="bg-white p-6 rounded-lg border shadow-sm h-fit">
                            <h3 className="text-lg font-semibold mb-4">{t("single.postReview")}</h3>
                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("single.yourRating")}</label>
                                    <StarPicker rating={rating} setRating={setRating} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("single.yourReview")}</label>
                                    <textarea
                                        className="w-full border rounded-md p-2 h-32 focus:ring-2 focus:ring-yellow-400 outline-none resize-none"
                                        placeholder={t("single.reviewPlaceholder")}
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
                                    {isPosting ? t("single.posting") : t("single.postButton")}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-6 rounded-lg border text-center text-gray-500">
                            <p>{t("single.loginToReview").split('log in')[0]} <Link to="/login" className="text-blue-500 underline">{t("login.loginLink")}</Link> {t("single.loginToReview").split('log in')[1]}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Association Rule Recommendations */}
            {book?.recommendedBooks?.length > 0 && (
                <div className="mt-12 border-t pt-8">
                    <h2 className="text-2xl font-bold mb-2">{t("single.alsoBought")}</h2>
                    <p className="text-sm text-gray-400 mb-6">{t("single.mbaPowered")}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {book.recommendedBooks.map((rec) => (
                            <Link
                                key={rec._id}
                                to={`/books/${rec._id}`}
                                className="group bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                            >
                                <div className="aspect-[3/4] overflow-hidden bg-gray-50">
                                    <img
                                        src={getImgUrl(rec.thumbnail)}
                                        alt={rec.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-3">
                                    <p className="font-bold text-sm text-gray-800 truncate">{rec.title}</p>
                                    <p className="text-xs text-gray-500 truncate">{rec.author}</p>
                                    <p className="text-sm font-bold text-emerald-600 mt-1">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rec.price)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default SingleBook
