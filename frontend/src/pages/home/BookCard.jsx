import React from 'react'
import { FiShoppingCart } from "react-icons/fi"
import { getImgUrl } from '../../utils/getImgUrl'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addToCart } from '../../redux/features/cart/cartSlice'
import { addToWishlist } from '../../redux/features/wishlist/wishlistSlice'
import { FaRegHeart } from "react-icons/fa";
import formatCurrency from '../../utils/formatCurrency'
import { useTranslation } from 'react-i18next'

const BookCard = ({ book }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const handleAddToCart = (product) => {
        if (inHouseQty > 0) {
            dispatch(addToCart(product));
        }
    }

    const handleAddToWishlist = (product) => {
        dispatch(addToWishlist(product));
    }

    // Handle both mockup data (newPrice, oldPrice, coverImage) and real data (price, thumbnail)
    const price = book?.newPrice || book?.price;
    const oldPrice = book?.oldPrice;
    const image = book?.coverImage || book?.thumbnail;
    const inHouseQty = book?.inventory?.inHouseQuantity || 0;
    const isLowStock = inHouseQty > 0 && inHouseQty < 10;
    const isOutOfStock = inHouseQty <= 0;

    return (
        <div className="rounded-lg transition-shadow duration-300 bg-white shadow-sm border p-4 m-2 flex flex-col sm:flex-row items-center gap-4 w-full max-w-[450px] relative overflow-hidden">
            {/* Out of Stock Overlay/Badge */}
            {isOutOfStock && (
                <div className="absolute top-0 right-0 bg-gray-500 text-white px-3 py-1 text-[10px] font-bold uppercase z-10 rounded-bl-lg shadow-sm">
                    {t('books.outOfStock')}
                </div>
            )}
            
            <div className="w-32 h-44 sm:h-60 sm:w-44 flex-shrink-0 border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center relative">
                <Link to={`/books/${book._id}`}>
                    <img
                        src={getImgUrl(image)}
                        alt={book?.title}
                        className={`w-full h-full object-cover transition-transform hover:scale-105 duration-200 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
                    />
                </Link>
            </div>

            <div className="flex flex-col justify-between h-full text-left flex-1">
                <div>
                    {isLowStock && (
                        <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-[11px] font-extrabold uppercase tracking-widest border border-red-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                            {t('books.onlyLeft', { count: inHouseQty })}
                        </div>
                    )}
                    <Link to={`/books/${book._id}`}>
                        <h3 className="text-lg font-bold hover:text-blue-600 mb-1 line-clamp-2">
                            {book?.title}
                        </h3>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <p className="font-bold text-gray-900">
                        {formatCurrency(price)}
                        {oldPrice && <span className="line-through font-normal text-gray-400 text-xs ml-2">
                            {formatCurrency(oldPrice)}
                        </span>}
                    </p>
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <button
                        onClick={() => handleAddToCart(book)}
                        disabled={isOutOfStock}
                        className={`font-semibold py-2 px-4 rounded-md flex items-center gap-2 transition-all text-sm
                            ${isOutOfStock 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                : 'bg-[#FFCE1A] hover:bg-yellow-500 text-black shadow-sm active:scale-95'
                            }`}
                    >
                        <FiShoppingCart />
                        <span>{isOutOfStock ? t('books.outOfStock') : t('single.addToCart')}</span>
                    </button>
                    <button
                        onClick={() => handleAddToWishlist(book)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2.5 rounded-md transition-colors active:scale-95"
                        title={t('wishlist.title')}
                    >
                        <FaRegHeart className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BookCard
