import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getImgUrl } from '../../utils/getImgUrl';
import { clearCart, removeFromCart, updateQuantity } from '../../redux/features/cart/cartSlice';
import formatCurrency from '../../utils/formatCurrency';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowLeft } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'

const CartPage = () => {
    const { t } = useTranslation();
    const cartItems = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();

    const totalPrice = cartItems.reduce((acc, item) => acc + (item.newPrice || item.price) * (item.quantity || 1), 0).toFixed(0);
    const totalQuantity = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

    const handleRemoveFromCart = (product) => {
        dispatch(removeFromCart(product));
    }

    const handleClearCart = () => {
        dispatch(clearCart());
    }

    const handleUpdateQuantity = (id, currentQty, amount) => {
        dispatch(updateQuantity({ id, quantity: currentQty + amount }));
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <FiShoppingBag className="text-4xl text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("cart.emptyTitle")}</h2>
                <p className="text-gray-500 mb-8">{t("cart.emptyDesc")}</p>
                <Link to="/" className="bg-[#008080] hover:bg-[#006666] text-white font-bold py-3 px-8 rounded-xl transition-colors">
                    {t("cart.browseBooks")}
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{t("cart.title")}</h1>
                    <p className="text-sm text-gray-500 mt-1">{totalQuantity} {totalQuantity === 1 ? t("cart.itemSingle") : t("cart.itemPlural")}</p>
                </div>
                <button
                    onClick={handleClearCart}
                    className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1.5 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                >
                    <FiTrash2 className="text-sm" />
                    {t("cart.clearCart")}
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map((product) => (
                        <div key={product?._id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 hover:shadow-md transition-shadow">
                            <Link to={`/books/${product?._id}`} className="flex-shrink-0">
                                <img
                                    src={`${getImgUrl(product?.coverImage || product?.thumbnail)}`}
                                    alt={product?.title}
                                    className="w-24 h-32 object-cover rounded-xl hover:scale-105 transition-transform duration-200"
                                />
                            </Link>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <Link to={`/books/${product?._id}`} className="font-bold text-gray-800 hover:text-[#008080] transition-colors line-clamp-1">
                                            {product?.title}
                                        </Link>
                                        <p className="text-xs text-gray-400 mt-1 capitalize">{product?.category}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveFromCart(product)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>

                                <div className="flex items-end justify-between mt-4">
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleUpdateQuantity(product._id, product.quantity || 1, -1)}
                                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                        >
                                            <FiMinus className="text-sm" />
                                        </button>
                                        <span className="w-10 text-center font-medium text-gray-800">{product.quantity || 1}</span>
                                        <button
                                            onClick={() => handleUpdateQuantity(product._id, product.quantity || 1, 1)}
                                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                        >
                                            <FiPlus className="text-sm" />
                                        </button>
                                    </div>
                                    <p className="font-bold text-gray-800 text-lg">
                                        {formatCurrency((product?.newPrice || product?.price) * (product.quantity || 1))}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
                        <h3 className="font-bold text-gray-800 mb-4">{t("cart.summaryTitle")}</h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>{t("cart.subtotalCount", { count: totalQuantity })}</span>
                                <span>{formatCurrency(totalPrice)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>{t("cart.shipping")}</span>
                                <span className="text-[#008080] font-medium">{t("cart.free")}</span>
                            </div>
                            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-800 text-base">
                                <span>{t("cart.total")}</span>
                                <span className="text-[#008080]">{formatCurrency(totalPrice)}</span>
                            </div>
                        </div>

                        <Link
                            to="/checkout"
                            className="mt-6 w-full bg-[#008080] hover:bg-[#006666] text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            {t("cart.checkout")}
                        </Link>

                        <Link
                            to="/"
                            className="mt-3 w-full text-gray-500 hover:text-[#008080] font-medium py-2 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <FiArrowLeft className="text-sm" />
                            {t("cart.continueShopping")}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CartPage
