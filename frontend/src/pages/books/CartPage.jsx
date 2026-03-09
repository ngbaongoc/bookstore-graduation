import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getImgUrl } from '../../utils/getImgUrl';
import { clearCart, removeFromCart, updateQuantity } from '../../redux/features/cart/cartSlice';

const CartPage = () => {
    const cartItems = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();

    const totalPrice = cartItems.reduce((acc, item) => acc + (item.newPrice || item.price) * (item.quantity || 1), 0).toFixed(0);

    const handleRemoveFromCart = (product) => {
        dispatch(removeFromCart(product));
    }

    const handleClearCart = () => {
        dispatch(clearCart());
    }

    const handleUpdateQuantity = (id, currentQty, amount) => {
        dispatch(updateQuantity({ id, quantity: currentQty + amount }));
    }

    return (
        <div className="flex mt-12 h-full flex-col overflow-hidden bg-white shadow-xl">
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                <div className="flex items-start justify-between">
                    <h2 className="text-lg font-medium text-gray-900">Shopping cart</h2>
                    <div className="ml-3 flex h-7 items-center ">
                        <button
                            type="button"
                            onClick={handleClearCart}
                            className="relative -m-2 py-1 px-2 bg-red-500 text-white rounded-md hover:bg-secondary transition-all duration-200  "
                        >
                            <span className="">Clear Cart</span>
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flow-root">
                        {
                            cartItems.length > 0 ? (
                                <ul role="list" className="-my-6 divide-y divide-gray-200">
                                    {
                                        cartItems.map((product) => (
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
                                                        <div className="flex items-center gap-2">
                                                            <strong>Qty:</strong>
                                                            <button
                                                                onClick={() => handleUpdateQuantity(product._id, product.quantity || 1, -1)}
                                                                className="px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300">-</button>
                                                            <span>{product.quantity || 1}</span>
                                                            <button
                                                                onClick={() => handleUpdateQuantity(product._id, product.quantity || 1, 1)}
                                                                className="px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300">+</button>
                                                        </div>

                                                        <div className="flex">
                                                            <button
                                                                onClick={() => handleRemoveFromCart(product)}
                                                                type="button" className="font-medium text-indigo-600 hover:text-indigo-500">
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))
                                    }
                                </ul>
                            ) : (<p className="text-center py-10">No product found in cart!</p>)
                        }
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                    </p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                <div className="mt-6">
                    <Link
                        to="/checkout"
                        className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                    >
                        Checkout
                    </Link>
                </div>
                <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                    <p>
                        or
                        <Link to="/">
                            <button
                                type="button"
                                className="font-medium text-indigo-600 hover:text-indigo-500 ml-1"
                            >
                                Continue Shopping
                                <span aria-hidden="true"> &rarr;</span>
                            </button>
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default CartPage
