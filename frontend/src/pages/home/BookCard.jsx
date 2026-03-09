import React from 'react'
import { FiShoppingCart } from "react-icons/fi"
import { getImgUrl } from '../../utils/getImgUrl'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../../redux/features/cart/cartSlice'
import { addToWishlist } from '../../redux/features/wishlist/wishlistSlice'
import { FaRegHeart } from "react-icons/fa";

const BookCard = ({ book }) => {
    const dispatch = useDispatch();

    const handleAddToCart = (product) => {
        dispatch(addToCart(product));
    }

    const handleAddToWishlist = (product) => {
        dispatch(addToWishlist(product));
    }

    // Handle both mockup data (newPrice, oldPrice, coverImage) and real data (price, thumbnail)
    const price = book?.newPrice || book?.price;
    const oldPrice = book?.oldPrice;
    const image = book?.coverImage || book?.thumbnail;

    return (
        <div className="rounded-lg transition-shadow duration-300 bg-white shadow-sm border p-4 m-2 flex flex-col sm:flex-row items-center gap-4 w-full max-w-[450px]">
            <div className="w-32 h-44 sm:h-60 sm:w-44 flex-shrink-0 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
                <Link to={`/books/${book._id}`}>
                    <img
                        src={getImgUrl(image)}
                        alt={book?.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-200"
                    />
                </Link>
            </div>

            <div className="flex flex-col justify-between h-full text-left">
                <div>
                    <Link to={`/books/${book._id}`}>
                        <h3 className="text-xl font-semibold hover:text-blue-600 mb-2 line-clamp-2">
                            {book?.title}
                        </h3>
                    </Link>
                    <p className="text-gray-600 mb-4 text-sm">
                        {book?.description?.length > 60 ? `${book.description.slice(0, 60)}...` : book?.description}
                    </p>
                </div>

                <div>
                    <p className="font-medium mb-4 text-gray-800">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                        {oldPrice && <span className="line-through font-normal text-gray-400 ml-2">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(oldPrice)}
                        </span>}
                    </p>
                    <button
                        onClick={() => handleAddToCart(book)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-md flex items-center gap-2 transition-colors">
                        <FiShoppingCart />
                        <span>Add to Cart</span>
                    </button>
                    <button
                        onClick={() => handleAddToWishlist(book)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded-md transition-colors"
                        title="Add to wishlist"
                    >
                        <FaRegHeart className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BookCard
