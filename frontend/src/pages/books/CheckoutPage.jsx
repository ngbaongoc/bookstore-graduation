import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useCreateOrderMutation } from '../../redux/features/orders/ordersApi'
import { clearCart } from '../../redux/features/cart/cartSlice'
import Swal from 'sweetalert2'
import { useAuth } from '../../context/AuthContext'

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
            userId: userProfile?.userId || currentUser?.uid // Use 6-digit userId if available
        }

        try {
            await createOrder(orderData).unwrap();
            dispatch(clearCart());
            Swal.fire({
                title: "Order Placed!",
                text: "Your order has been placed successfully.",
                icon: "success",
                confirmButtonText: "OK"
            }).then(() => {
                navigate("/");
            });
        } catch (error) {
            console.error("Failed to place order", error);
            Swal.fire("Error", "Failed to place order. Please try again.", "error");
        }
    }

    if (loading || profileLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h2 className="text-2xl font-bold mb-4">Loading your profile...</h2>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (currentUser && !userProfile) {
        return (
            <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
                <h2 className="text-2xl font-bold mb-4">Profile Required</h2>
                <p className="text-gray-600 mb-6">You must complete your profile (Username, Phone Number) before placing an order.</p>
                <Link to="/settings" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
                    Go to Settings
                </Link>
            </div>
        )
    }

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <Link to="/" className="text-blue-600 hover:underline">Go back to shopping</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-6 bg-gray-100 flex items-center justify-center">
            <div className="container max-w-screen-lg mx-auto">
                <div>
                    <h2 className="font-semibold text-xl text-gray-600">Cash On Delivery</h2>
                    <p className="text-gray-500 mb-2">Total Price: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</p>
                    <p className="text-gray-500 mb-6 font-semibold">Items: {totalQuantity}</p>

                    <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6">
                        <form onSubmit={handlePlaceOrder} className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3">
                            <div className="text-gray-600">
                                <p className="font-medium text-lg">Personal Details</p>
                                <p>Please fill out all the fields.</p>
                            </div>

                            <div className="lg:col-span-2">
                                <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5">
                                    <div className="md:col-span-5">
                                        <label htmlFor="full_name">Full Name</label>
                                        <input
                                            type="text" name="name" id="full_name"
                                            className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-5">
                                        <label htmlFor="email">Email Address</label>
                                        <input
                                            type="email" name="email" id="email"
                                            className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                            placeholder="email@domain.com"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-5">
                                        <label htmlFor="phone">Phone Number</label>
                                        <input
                                            type="tel" name="phone" id="phone"
                                            className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                            placeholder="+123 456 7890"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-3">
                                        <label htmlFor="street">Address / Street</label>
                                        <input
                                            type="text" name="street" id="street"
                                            className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                            value={formData.street}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="city">City</label>
                                        <input
                                            type="text" name="city" id="city"
                                            className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="country">Country / region</label>
                                        <div className="h-10 bg-gray-50 flex border border-gray-200 rounded items-center mt-1">
                                            <input
                                                name="country" id="country" placeholder="Country"
                                                className="px-4 appearance-none outline-none text-gray-800 w-full bg-transparent"
                                                value={formData.country}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="state">State / province</label>
                                        <div className="h-10 bg-gray-50 flex border border-gray-200 rounded items-center mt-1">
                                            <input
                                                name="state" id="state" placeholder="State"
                                                className="px-4 appearance-none outline-none text-gray-800 w-full bg-transparent"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-1">
                                        <label htmlFor="zipcode">Zipcode</label>
                                        <input
                                            type="text" name="zipcode" id="zipcode"
                                            className="transition-all flex items-center h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                            value={formData.zipcode}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-5 mt-3">
                                        <div className="inline-flex items-center">
                                            <input
                                                type="checkbox" name="billing_same" id="billing_same"
                                                className="form-checkbox"
                                                checked={isChecked}
                                                onChange={() => setIsChecked(!isChecked)}
                                            />
                                            <label htmlFor="billing_same" className="ml-2">I am agree to the <Link className='underline underline-offset-2 text-blue-600'>Terms & Conditions</Link> and <Link className='underline underline-offset-2 text-blue-600'>Shoping Policy.</Link></label>
                                        </div>
                                    </div>

                                    <div className="md:col-span-5 text-right">
                                        <div className="inline-flex items-end">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
                                            >
                                                {isLoading ? "Placing Order..." : "Place an Order"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CheckoutPage
