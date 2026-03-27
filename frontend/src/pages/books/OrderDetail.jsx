import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetOrdersByEmailQuery, useRequestCancelOrderMutation } from '../../redux/features/orders/ordersApi'
import { useAuth } from '../../context/AuthContext'
import { MdReceipt, MdInventory, MdLocalShipping, MdCheckCircle, MdHome, MdHistory, MdArrowBack, MdCancel } from 'react-icons/md'
import formatCurrency from '../../utils/formatCurrency'
import Swal from 'sweetalert2'

const STAGES = ['Pending', 'Processing', 'Ready to pick up', 'Picked up', 'Delivery']
const STAGE_ICONS = [<MdReceipt />, <MdInventory />, <MdHistory />, <MdLocalShipping />, <MdHome />]

const CANCEL_REASONS = [
    'Changed my mind',
    'Found a better price',
    'Ordered by mistake',
    'Delivery too slow',
    'Other',
]

const OrderDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { currentUser } = useAuth()
    const { data: orders = [], isLoading } = useGetOrdersByEmailQuery(currentUser?.email, { skip: !currentUser?.email })
    const [requestCancel] = useRequestCancelOrderMutation()

    const [showCancelModal, setShowCancelModal] = useState(false)
    const [selectedReason, setSelectedReason] = useState('')
    const [otherReason, setOtherReason] = useState('')

    const order = orders.find(o => o._id === id)

    if (isLoading) return <div className="p-8 max-w-4xl mx-auto">Loading order...</div>
    if (!order) return (
        <div className="max-w-4xl mx-auto p-6 mt-10 text-center">
            <p className="text-gray-500 text-lg mb-4">Order not found.</p>
            <button onClick={() => navigate('/orders')} className="text-blue-500 hover:underline">← Back to orders</button>
        </div>
    )

    const currentStatus = order.status || 'Pending'
    const currentIndex = STAGES.indexOf(currentStatus) >= 0 ? STAGES.indexOf(currentStatus) : 0
    const canCancel = currentStatus !== 'Delivery' && !order.cancelRequest?.requested && !order.cancelOrder

    const handleSubmitCancel = async () => {
        const reason = selectedReason === 'Other' ? otherReason.trim() : selectedReason
        if (!reason) {
            Swal.fire('Missing Reason', 'Please select or enter a reason for cancellation.', 'warning')
            return
        }
        try {
            await requestCancel({ id: order._id, reason }).unwrap()
            setShowCancelModal(false)
            Swal.fire({
                title: 'Request Submitted',
                text: 'Your cancellation request has been sent to the admin for review.',
                icon: 'success',
                timer: 2500,
                showConfirmButton: false,
            })
        } catch (error) {
            Swal.fire('Error', error?.data?.message || 'Failed to submit cancel request.', 'error')
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6 mt-10">
            {/* Back Button */}
            <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors">
                <MdArrowBack className="text-xl" /> Back to My Orders
            </button>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 pb-6 border-b border-gray-100 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Order <span className="font-mono text-blue-600">#{order._id.slice(-8).toUpperCase()}</span>
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div className="sm:text-right bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Order Total</p>
                        <p className="text-2xl font-bold text-gray-800">{formatCurrency(order.totalPrice)}</p>
                    </div>
                </div>

                {/* Cancellation Status Banners */}
                {order.cancelOrder ? (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-pulse">
                        <MdCancel className="text-red-600 text-2xl flex-shrink-0" />
                        <div>
                            <p className="font-bold text-red-800">THIS ORDER HAS BEEN CANCELED</p>
                            <p className="text-sm text-red-700 font-medium">Refund will be processed following our store policy.</p>
                        </div>
                    </div>
                ) : order.cancelRequest?.status === 'disapproved' ? (
                    <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                        <MdCancel className="text-gray-400 text-2xl flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-gray-800 tracking-tight">Your cancel request hasn't been approved</p>
                            <p className="text-xs text-gray-500 mt-1">Our team has reviewed your request and determined the order must proceed. Please contact support for further assistance.</p>
                        </div>
                    </div>
                ) : order.cancelRequest?.requested && (
                    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                        <MdCancel className="text-amber-600 text-2xl flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-amber-800">Cancel request pending</p>
                            <p className="text-sm text-amber-700">Your cancellation request is being reviewed by the admin. You'll be notified once it's processed.</p>
                        </div>
                    </div>
                )}

                {/* Order Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Customer</p>
                        <p className="text-sm font-medium text-gray-800">{order.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                        <p className="text-sm font-medium text-gray-800">{order.email}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Phone</p>
                        <p className="text-sm font-medium text-gray-800">{order.phone}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Address</p>
                        <p className="text-sm font-medium text-gray-800">
                            {order.shippingAddress ? 
                                `${order.shippingAddress.street || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.country || ''}` : 
                                (order.address ? `${order.address.street || ''}, ${order.address.city || ''}, ${order.address.country || ''}` : 'N/A')}
                        </p>
                    </div>
                </div>

                {/* Order Items */}
                <div className="mb-8 border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
                    <h4 className="font-bold text-gray-800 p-4 border-b border-gray-100 bg-white">Order Items</h4>
                    <div className="divide-y divide-gray-100">
                        {order.productIds?.map((item, idx) => {
                            const book = typeof item.productId === 'object' && item.productId !== null ? item.productId : {};
                            return (
                                <div key={idx} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                    <div className="h-16 w-12 bg-gray-200 rounded flex-shrink-0 relative overflow-hidden shadow-sm">
                                        {book.thumbnail && <img src={book.thumbnail} className="w-full h-full object-cover" alt={book.title || 'Book cover'} />}
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-semibold text-gray-800 leading-tight">{book.title || 'Unknown Title'}</h5>
                                        <p className="text-sm text-gray-500 mt-0.5">{book.author || 'Unknown Author'}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {book.isbn && (
                                                <span className="text-[11px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded shadow-sm">
                                                    ISBN: <span className="font-mono">{book.isbn}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right sm:ml-auto">
                                        <p className="text-sm font-semibold text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                                            Qty: {item.quantity}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Delivery Status */}
                <h4 className="font-semibold text-gray-700 mb-6">Delivery Status</h4>
                <div className="relative pt-4 pb-8 sm:pb-4 overflow-x-auto sm:overflow-visible px-4 sm:px-0">
                    <div className="min-w-[600px] sm:min-w-0">
                        <div className="absolute top-[26px] left-0 w-full h-1.5 bg-gray-200 rounded-full"></div>
                        <div 
                            className="absolute top-[26px] left-0 h-1.5 bg-purple-600 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
                        ></div>
                        <div className="flex justify-between relative z-10">
                            {STAGES.map((stage, i) => {
                                const isCompleted = i <= currentIndex;
                                const isActive = i === currentIndex;
                                return (
                                    <div key={stage} className="flex flex-col items-center" style={{ width: '20%' }}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg transition-colors duration-500 shadow-sm ${isCompleted ? 'bg-purple-600 shadow-purple-200 ring-4 ring-purple-50' : 'bg-gray-200'}`}>
                                            {isCompleted ? <MdCheckCircle className="text-xl" /> : <span className="w-3 h-3 bg-white rounded-full opacity-60"></span>}
                                        </div>
                                        <div className="mt-4 flex flex-col items-center">
                                            <div className={`text-2xl mb-2 transition-colors duration-500 ${isActive ? 'text-purple-600' : 'text-gray-400'}`}>
                                                {STAGE_ICONS[i]}
                                            </div>
                                            <p className={`text-xs font-semibold text-center transition-colors duration-500 ${isActive ? 'text-purple-700' : 'text-gray-500'}`}>
                                                {stage}
                                            </p>
                                            <p className={`text-[10px] text-center mt-1 transition-opacity duration-500 ${isCompleted && order.stageDates && order.stageDates[stage] ? 'opacity-100 text-purple-600 font-medium' : 'opacity-0'}`}>
                                                {order.stageDates && order.stageDates[stage] ? new Date(order.stageDates[stage]).toLocaleDateString('vi-VN') : ''}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Cancel Button */}
                {canCancel && (
                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={() => setShowCancelModal(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors font-semibold text-sm"
                        >
                            <MdCancel className="text-lg" /> Cancel Order
                        </button>
                    </div>
                )}
            </div>

            {/* Cancel Reason Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-red-50 px-6 py-4 border-b border-red-100">
                            <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                                <MdCancel className="text-xl" /> Cancel Order
                            </h3>
                            <p className="text-sm text-red-600 mt-1">Please select a reason for cancellation</p>
                        </div>
                        <div className="p-6 space-y-3">
                            {CANCEL_REASONS.map(reason => (
                                <label key={reason} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedReason === reason ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input
                                        type="radio"
                                        name="cancelReason"
                                        value={reason}
                                        checked={selectedReason === reason}
                                        onChange={() => setSelectedReason(reason)}
                                        className="accent-red-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">{reason}</span>
                                </label>
                            ))}
                            {selectedReason === 'Other' && (
                                <textarea
                                    value={otherReason}
                                    onChange={(e) => setOtherReason(e.target.value)}
                                    placeholder="Please describe your reason..."
                                    className="w-full mt-2 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300 resize-none"
                                    rows={3}
                                />
                            )}
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            <button onClick={() => { setShowCancelModal(false); setSelectedReason(''); setOtherReason(''); }} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm font-medium transition-colors">
                                Go Back
                            </button>
                            <button onClick={handleSubmitCancel} className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-semibold transition-colors shadow-sm">
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrderDetail
