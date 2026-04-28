import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getImgUrl } from '../../utils/getImgUrl';
import { removeFromWishlist, clearWishlist } from '../../redux/features/wishlist/wishlistSlice';
import { addToCart } from '../../redux/features/cart/cartSlice';

const WishlistPage = () => {
    const wishlistItems = useSelector(state => state.wishlist.wishlistItems);
    const dispatch = useDispatch();

    const handleRemoveFromWishlist = (product) => {
        dispatch(removeFromWishlist(product));
    }

    const handleClearWishlist = () => {
        dispatch(clearWishlist());
    }

    const handleAddToCart = (product) => {
        dispatch(addToCart(product));
        dispatch(removeFromWishlist(product));
    }

    return (
        <div className="flex mt-12 h-full flex-col overflow-hidden bg-white shadow-xl">
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                <div className="flex items-start justify-between">
                    <h2 className="text-lg font-medium text-gray-900">My Wishlist</h2>
                    <div className="ml-3 flex h-7 items-center ">
                        <button
                            type="button"
                            onClick={handleClearWishlist}
                            className="relative -m-2 py-1 px-2 bg-red-500 text-white rounded-md hover:bg-secondary transition-all duration-200"
                        >
                            <span>Clear Wishlist</span>
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flow-root">
                        {
                            wishlistItems.length > 0 ? (
                                <ul role="list" className="-my-6 divide-y divide-gray-200">
                                    {
                                        wishlistItems.map((product) => (
                                            <li key={product?._id} className="flex py-6">
                                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                    <Link to={`/books/${product?._id}`}>
                                                        <img
                                                            src={`${getImgUrl(product?.coverImage || product?.thumbnail)}`}
                                                            alt={product?.title}
                                                            className="h-full w-full object-cover object-center hover:scale-105 transition-all duration-200"
                                                        />
                                                    </Link>
                                                </div>

                                                <div className="ml-4 flex flex-1 flex-col">
                                                    <div>
                                                        <div className="flex flex-wrap justify-between text-base font-medium text-gray-900">
                                                            <h3>
                                                                <Link to={`/books/${product?._id}`} className="hover:text-blue-600">
                                                                    {product?.title}
                                                                </Link>
                                                            </h3>
                                                            <p className="ml-4">
                                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product?.newPrice || product?.price)}
                                                            </p>
                                                        </div>
                                                        <p className="mt-1 text-sm text-gray-500 capitalize"><strong>Category: </strong>{product?.category}</p>
                                                    </div>
                                                    <div className="flex flex-1 flex-wrap items-end justify-between text-sm">
                                                        <div className="flex gap-4">
                                                            <button
                                                                onClick={() => handleAddToCart(product)}
                                                                className="font-medium text-indigo-600 hover:text-indigo-500">
                                                                Move to Cart
                                                            </button>
                                                            <button
                                                                onClick={() => handleRemoveFromWishlist(product)}
                                                                className="font-medium text-red-600 hover:text-red-500">
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))
                                    }
                                </ul>
                            ) : (<p className="text-center py-10">Your wishlist is empty!</p>)
                        }
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 px-4 py-6 sm:px-6 flex justify-center text-center text-sm text-gray-500">
                <Link to="/">
                    <button
                        type="button"
                        className="font-medium text-indigo-600 hover:text-indigo-500 ml-1"
                    >
                        Continue Shopping
                        <span aria-hidden="true"> &rarr;</span>
                    </button>
                </Link>
            </div>
        </div>
    )
}

export default WishlistPage
