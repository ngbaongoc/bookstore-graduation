import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useGetOrdersByUserIdQuery } from '../../redux/features/orders/ordersApi'
import { MdReceipt, MdInventory, MdLocalShipping, MdCheckCircle, MdHome, MdHistory, MdArrowBack } from 'react-icons/md'
import formatCurrency from '../../utils/formatCurrency'

const STAGES = ['Pending', 'Processing', 'Ready to pick up', 'Picked up', 'Delivery']

const STAGE_ICONS = [
    <MdReceipt />,
    <MdInventory />,
    <MdHistory />,
    <MdLocalShipping />,
    <MdHome />
]

const UserOrders = () => {
    const { userId } = useParams()
    const { data: orders = [], isLoading } = useGetOrdersByUserIdQuery(userId, { skip: !userId })

    // Filter only DELIVERED orders as requested
    const deliveredOrders = orders.filter(order => order.status === 'Delivery')

    if (isLoading) return <div className="p-8">Loading user orders...</div>

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link to="/admin/manage-users" className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition">
                    <MdArrowBack className="text-xl" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Delivered Orders for ID: <span className="text-blue-600">{userId}</span></h1>
            </div>
            
            <div className="space-y-8">
                {deliveredOrders.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-gray-500 text-lg">This user has no delivered orders yet.</p>
                    </div>
                ) : (
                    deliveredOrders.map((order, index) => {
                        const currentStatus = order.status || 'Pending'
                        const currentIndex = STAGES.indexOf(currentStatus) >= 0 ? STAGES.indexOf(currentStatus) : STAGES.length - 1

                        return (
                            <div key={order._id} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 pb-6 border-b border-gray-100 gap-4">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                                                Order #{index + 1}
                                            </span>
                                            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 mt-2">
                                            ID: <span className="font-mono text-gray-600">{order._id}</span>
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">{order.email} | {order.name}</p>
                                    </div>
                                    <div className="sm:text-right bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Order Total</p>
                                        <p className="text-2xl font-bold text-gray-800">{formatCurrency(order.totalPrice)}</p>
                                    </div>
                                </div>

                                {/* Order Items Section */}
                                <div className="mb-8 border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
                                    <h4 className="font-bold text-gray-800 p-4 border-b border-gray-100 bg-white">Purchased Items</h4>
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

                                <h4 className="font-semibold text-gray-700 mb-6">Delivery Timeline</h4>
                                
                                <div className="relative pt-4 pb-8 sm:pb-4 overflow-x-auto sm:overflow-visible px-4 sm:px-0">
                                    <div className="min-w-[600px] sm:min-w-0">
                                        <div className="absolute top-[26px] left-0 w-full h-1.5 bg-gray-200 rounded-full"></div>
                                        <div 
                                            className="absolute top-[26px] left-0 h-1.5 bg-green-500 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `100%` }}
                                        ></div>

                                        <div className="flex justify-between relative z-10">
                                            {STAGES.map((stage, i) => {
                                                const isCompleted = i <= currentIndex;
                                                const isActive = i === currentIndex;
                                                
                                                return (
                                                    <div key={stage} className="flex flex-col items-center" style={{ width: '20%' }}>
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg transition-colors duration-500 shadow-sm ${isCompleted ? 'bg-green-500 shadow-green-200 ring-4 ring-green-50' : 'bg-gray-200'}`}>
                                                            {isCompleted ? <MdCheckCircle className="text-xl" /> : <span className="w-3 h-3 bg-white rounded-full opacity-60"></span>}
                                                        </div>

                                                        <div className="mt-4 flex flex-col items-center">
                                                            <div className={`text-2xl mb-2 transition-colors duration-500 ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                                                {STAGE_ICONS[i]}
                                                            </div>
                                                            <p className={`text-xs font-semibold text-center transition-colors duration-500 ${isActive ? 'text-green-700' : 'text-gray-500'}`}>
                                                                {stage}
                                                            </p>
                                                            <p className={`text-[10px] text-center mt-1 transition-opacity duration-500 ${isCompleted && order.stageDates && order.stageDates[stage] ? 'opacity-100 text-green-600 font-medium' : 'opacity-0'}`}>
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

export default UserOrders
