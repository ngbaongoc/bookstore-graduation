import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useCreateOrderMutation } from '../../redux/features/orders/ordersApi'
import { clearCart } from '../../redux/features/cart/cartSlice'
import Swal from 'sweetalert2'
import { useAuth } from '../../context/AuthContext'
import formatCurrency from '../../utils/formatCurrency'
import { getImgUrl } from '../../utils/getImgUrl'
import { FiLock, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'

const CheckoutPage = () => {
    const { currentUser, userProfile, loading, profileLoading } = useAuth();
    const cartItems = useSelector(state => state.cart.cartItems);
    const totalPrice = cartItems.reduce((acc, item) => acc + (item.newPrice || item.price) * (item.quantity || 1), 0).toFixed(0);
    const totalQuantity = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

    const [createOrder, { isLoading }] = useCreateOrderMutation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: userProfile?.username || '',
        email: currentUser?.email || '',
        phone: userProfile?.phone || '',
        street: '',
        city: '',
        country: '',
        state: '',
        zipcode: ''
    });

    React.useEffect(() => {
        if (userProfile) {
            setFormData(prev => ({
                ...prev,
                name: userProfile.username || prev.name,
                email: currentUser?.email || prev.email,
                phone: userProfile.phone || prev.phone
            }))
        }
    }, [userProfile, currentUser])

    const [isChecked, setIsChecked] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (!isChecked) {
            Swal.fire("Warning", "Please agree to the Terms & Conditions", "warning");
            return;
        }

        const orderData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            shippingAddress: {
                street: formData.street,
                city: formData.city,
                country: formData.country,
                state: formData.state,
                zipcode: formData.zipcode,
            },
            totalPrice: Number(totalPrice),
            productIds: cartItems.map(item => ({ productId: item._id, quantity: item.quantity || 1 })),
            userId: userProfile?.userId || currentUser?.uid
        }

        try {
            await createOrder(orderData).unwrap();
            dispatch(clearCart());
            Swal.fire({
                title: "Order Placed!",
                text: "Your order has been placed successfully.",
                icon: "success",
                confirmButtonText: "OK",
                confirmButtonColor: "#008080"
            }).then(() => {
                navigate("/orders");
            });
        } catch (error) {
            console.error("Failed to place order", error);
            Swal.fire("Error", "Failed to place order. Please try again.", "error");
        }
    }

    if (loading || profileLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#008080] mb-4"></div>
                <p className="text-gray-500">Loading your profile...</p>
            </div>
        )
    }

    if (currentUser && !userProfile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl">👤</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Required</h2>
                <p className="text-gray-500 mb-6 max-w-md">Please complete your profile (Username, Phone Number) before placing an order.</p>
                <Link to="/settings" className="bg-[#008080] hover:bg-[#006666] text-white font-bold px-8 py-3 rounded-xl transition-colors">
                    Go to Settings
                </Link>
            </div>
        )
    }

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl">🛒</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">Add some books before checking out.</p>
                <Link to="/" className="bg-[#008080] hover:bg-[#006666] text-white font-bold px-8 py-3 rounded-xl transition-colors">
                    Browse Books
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Back link */}
            <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#008080] mb-6 transition-colors">
                <FiArrowLeft /> Back to Cart
            </Link>

            <h1 className="text-2xl font-bold text-gray-800 mb-8">Checkout</h1>

            <div className="grid lg:grid-cols-5 gap-8">
                {/* Form */}
                <div className="lg:col-span-3">
                    <form onSubmit={handlePlaceOrder} className="space-y-6">
                        {/* Personal Details */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-8 h-8 bg-[#008080] rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                                <h2 className="font-bold text-gray-800">Personal Details</h2>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                    <input
                                        type="text" name="name"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 outline-none transition-all text-sm bg-gray-50"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                                    <input
                                        type="email" name="email"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 outline-none transition-all text-sm bg-gray-50"
                                        placeholder="email@domain.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                                    <input
                                        type="tel" name="phone"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 outline-none transition-all text-sm bg-gray-50"
                                        placeholder="+84 xxx xxx xxx"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-8 h-8 bg-[#008080] rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                                <h2 className="font-bold text-gray-800">Shipping Address</h2>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Street Address</label>
                                    <input
                                        type="text" name="street"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 outline-none transition-all text-sm bg-gray-50"
                                        placeholder="123 Nguyen Hue Street"
                                        value={formData.street}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                                    <input
                                        type="text" name="city"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 outline-none transition-all text-sm bg-gray-50"
                                        placeholder="Da Nang"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">State / Province</label>
                                    <input
                                        type="text" name="state"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 outline-none transition-all text-sm bg-gray-50"
                                        placeholder="Hai Chau"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                                    <input
                                        type="text" name="country"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 outline-none transition-all text-sm bg-gray-50"
                                        placeholder="Vietnam"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Zipcode</label>
                                    <input
                                        type="text" name="zipcode"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#008080] focus:ring-2 focus:ring-[#008080]/20 outline-none transition-all text-sm bg-gray-50"
                                        placeholder="550000"
                                        value={formData.zipcode}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment & Submit */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-8 h-8 bg-[#008080] rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                                <h2 className="font-bold text-gray-800">Payment</h2>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
                                <p className="text-sm text-amber-700 font-medium">Cash on Delivery (COD)</p>
                                <p className="text-xs text-amber-600 mt-0.5">Pay when you receive your order.</p>
                            </div>

                            <div className="flex items-start gap-3 mb-6">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    className="mt-1 w-4 h-4 accent-[#008080] rounded"
                                    checked={isChecked}
                                    onChange={() => setIsChecked(!isChecked)}
                                />
                                <label htmlFor="terms" className="text-sm text-gray-600">
                                    I agree to the <span className="text-[#008080] font-medium">Terms & Conditions</span> and <span className="text-[#008080] font-medium">Shopping Policy</span>.
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#008080] hover:bg-[#006666] disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Placing Order...
                                    </>
                                ) : (
                                    <>
                                        <FiLock className="text-sm" />
                                        Place Order — {formatCurrency(totalPrice)}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
                        <h3 className="font-bold text-gray-800 mb-5">Order Summary</h3>

                        {/* Items */}
                        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                            {cartItems.map((item) => (
                                <div key={item._id} className="flex gap-3">
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={getImgUrl(item.coverImage || item.thumbnail)}
                                            alt={item.title}
                                            className="w-16 h-20 object-cover rounded-lg"
                                        />
                                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#008080] text-white text-xs rounded-full flex items-center justify-center font-bold">
                                            {item.quantity || 1}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.title}</p>
                                        <p className="text-xs text-gray-400 capitalize mt-0.5">{item.category}</p>
                                        <p className="text-sm font-bold text-gray-700 mt-1">
                                            {formatCurrency((item.newPrice || item.price) * (item.quantity || 1))}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="border-t border-gray-100 mt-5 pt-5 space-y-3 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal ({totalQuantity} items)</span>
                                <span>{formatCurrency(totalPrice)}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Shipping</span>
                                <span className="text-[#008080] font-medium">Free</span>
                            </div>
                            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-800 text-lg">
                                <span>Total</span>
                                <span className="text-[#008080]">{formatCurrency(totalPrice)}</span>
                            </div>
                        </div>

                        {/* Trust badges */}
                        <div className="border-t border-gray-100 mt-5 pt-5 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <FiCheckCircle className="text-green-500" />
                                <span>Secure checkout</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <FiCheckCircle className="text-green-500" />
                                <span>Free shipping nationwide</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <FiCheckCircle className="text-green-500" />
                                <span>Easy returns within 30 days</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CheckoutPage
