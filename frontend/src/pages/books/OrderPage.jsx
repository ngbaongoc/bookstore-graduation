import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetOrdersByEmailQuery } from '../../redux/features/orders/ordersApi'
import { useAuth } from '../../context/AuthContext'
import { MdReceipt, MdInventory, MdLocalShipping, MdCheckCircle, MdHome, MdHistory, MdCancel } from 'react-icons/md'

const STAGES = ['Pending', 'Processing', 'Ready to pick up', 'Picked up', 'Delivery']

const STAGE_ICONS = [
    <MdReceipt />,
    <MdInventory />,
    <MdHistory />,
    <MdLocalShipping />,
    <MdHome />
]

const OrderPage = () => {
    const { currentUser } = useAuth()
    const navigate = useNavigate()
    const { data: orders = [], isLoading } = useGetOrdersByEmailQuery(currentUser?.email, {
        skip: !currentUser?.email
    })

    if (isLoading) return <div className="p-8 max-w-4xl mx-auto">Loading your orders...</div>

    return (
        <div className="max-w-4xl mx-auto p-6 mt-10">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">My Orders History</h1>
            
            <div className="space-y-10">
                {orders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-gray-500 text-lg">You haven't placed any orders yet.</p>
                    </div>
                ) : (
                    orders.map((order, index) => {
                        const currentStatus = order.status || 'Pending'
                        const currentIndex = STAGES.indexOf(currentStatus) >= 0 ? STAGES.indexOf(currentStatus) : 0

                        return (
                            <div key={order._id} onClick={() => navigate(`/orders/${order._id}`)} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 pb-6 border-b border-gray-100 gap-4">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                                                Order #{index + 1}
                                            </span>
                                            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 mt-2">
                                            ID: <span className="font-mono text-gray-600">{order._id}</span>
                                        </h3>
                                    </div>
                                    <div className="sm:text-right bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Order Total</p>
                                        <p className="text-2xl font-bold text-gray-800">${order.totalPrice}</p>
                                    </div>
                                    {order.cancelOrder ? (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg self-center">
                                            <MdCancel className="text-red-500" />
                                            <span className="text-xs font-bold text-red-700">ORDER CANCELED</span>
                                        </div>
                                    ) : order.cancelRequest?.status === 'disapproved' ? (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg self-center group relative cursor-help">
                                            <MdCancel className="text-gray-400" />
                                            <span className="text-xs font-semibold text-gray-600">Cancel Refused</span>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-gray-800 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                                Your cancel request wasn't approved
                                            </div>
                                        </div>
                                    ) : order.cancelRequest?.requested && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg self-center">
                                            <MdCancel className="text-amber-600" />
                                            <span className="text-xs font-semibold text-amber-700">Cancel Pending</span>
                                        </div>
                                    )}
                                </div>

                                {/* Order Items Section */}
                                <div className="mb-8 border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
                                    <h4 className="font-bold text-gray-800 p-4 border-b border-gray-100 bg-white">Order Items</h4>
                                    <div className="divide-y divide-gray-100">
                                        {order.productIds?.map((item, idx) => {
                                            // Handle RTK Query cached state where productId might still be a string
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
                                                            {book.inventory?.binLocation && (
                                                                <span className="text-[11px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded shadow-sm font-semibold">
                                                                    Shelf: {book.inventory.binLocation}
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

                                <h4 className="font-semibold text-gray-700 mb-6">Delivery Status</h4>
                                
                                <div className="relative pt-4 pb-8 sm:pb-4 overflow-x-auto sm:overflow-visible px-4 sm:px-0">
                                    <div className="min-w-[600px] sm:min-w-0">
                                        {/* Progress Bar Line Background */}
                                        <div className="absolute top-[26px] left-0 w-full h-1.5 bg-gray-200 rounded-full"></div>
                                        
                                        {/* Progress Bar Active Line */}
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
                                                        {/* Circle Marker */}
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg transition-colors duration-500 shadow-sm ${isCompleted ? 'bg-purple-600 shadow-purple-200 ring-4 ring-purple-50' : 'bg-gray-200'}`}>
                                                            {isCompleted ? <MdCheckCircle className="text-xl" /> : <span className="w-3 h-3 bg-white rounded-full opacity-60"></span>}
                                                        </div>

                                                        {/* Stage Label & Icon */}
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
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default OrderPage
