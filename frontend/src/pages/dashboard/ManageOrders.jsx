import React, { useState } from 'react'
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation, useApproveCancelOrderMutation, useDisapproveCancelOrderMutation } from '../../redux/features/orders/ordersApi'
import Swal from 'sweetalert2'
import { MdReceipt, MdInventory, MdLocalShipping, MdCheckCircle, MdHome, MdHistory, MdCancel } from 'react-icons/md'

const STAGES = ['Pending', 'Processing', 'Ready to pick up', 'Picked up', 'Delivery']

const STAGE_ICONS = [
    <MdReceipt />,
    <MdInventory />,
    <MdHistory />,
    <MdLocalShipping />,
    <MdHome />
]

const ManageOrders = () => {
    const { data: orders = [], isLoading, refetch } = useGetAllOrdersQuery()
    const [updateOrderStatus] = useUpdateOrderStatusMutation()
    const [approveCancel] = useApproveCancelOrderMutation()
    const [disapproveCancel] = useDisapproveCancelOrderMutation()

    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showCancelModal, setShowCancelModal] = useState(false)

    const handleAdvanceStage = async (orderId, currentStage) => {
        const currentIndex = STAGES.indexOf(currentStage)
        if (currentIndex < STAGES.length - 1) {
            const nextStage = STAGES[currentIndex + 1]
            try {
                await updateOrderStatus({ id: orderId, status: nextStage }).unwrap()
                Swal.fire({
                    title: 'Order Updated',
                    text: `Order moved to ${nextStage}`,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                })
                refetch()
            } catch (error) {
                if (error?.status === 401 || error?.status === 403) {
                    Swal.fire('Session Expired', 'Please log out and log back in.', 'warning').then(() => {
                        localStorage.removeItem('token')
                        window.location.href = '/admin/login'
                    })
                } else {
                    Swal.fire('Error', 'Failed to update order status', 'error')
                }
            }
        }
    }

    const handleApproveCancel = async (orderId) => {
        try {
            await approveCancel(orderId).unwrap()
            Swal.fire('Approved', 'Order has been cancelled and inventory restored.', 'success')
            setShowCancelModal(false)
            refetch()
        } catch (error) {
            Swal.fire('Error', 'Failed to approve cancellation', 'error')
        }
    }

    const handleDisapproveCancel = async (orderId) => {
        try {
            await disapproveCancel(orderId).unwrap()
            Swal.fire('Disapproved', 'Cancellation request has been rejected.', 'info')
            setShowCancelModal(false)
            refetch()
        } catch (error) {
            Swal.fire('Error', 'Failed to disapprove cancellation', 'error')
        }
    }

    if (isLoading) return <div className="p-8">Loading orders...</div>

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Manage Orders</h1>
            
            <div className="space-y-8">
                {orders.map(order => {
                    const currentStatus = order.status || 'Pending'
                    const currentIndex = STAGES.indexOf(currentStatus) >= 0 ? STAGES.indexOf(currentStatus) : 0

                    return (
                        <div key={order._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                        ORDER <span className="text-blue-500">#{order._id.slice(-8).toUpperCase()}</span>
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">{order.email} | {order.name}</p>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <p className="text-sm font-semibold text-gray-600">Total: ${order.totalPrice}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    {order.cancelRequest?.requested && (
                                        <button 
                                            onClick={() => { setSelectedOrder(order); setShowCancelModal(true); }}
                                            className="mt-2 flex items-center gap-1 px-4 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-bold hover:bg-red-100 transition-all shadow-sm group"
                                        >
                                            <MdCancel className="text-sm group-hover:scale-110 transition-transform" /> 
                                            Cancel Request
                                        </button>
                                    )}
                                </div>
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

                            <div className="relative pt-4 pb-12">
                                {/* Progress Bar Line Background */}
                                <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-200 rounded-full -translate-y-1/2 mt-[-24px]"></div>
                                
                                {/* Progress Bar Active Line */}
                                <div 
                                    className="absolute top-1/2 left-0 h-1.5 bg-purple-600 rounded-full -translate-y-1/2 mt-[-24px] transition-all duration-500"
                                    style={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
                                ></div>

                                <div className="flex justify-between relative z-10">
                                    {STAGES.map((stage, index) => {
                                        const isCompleted = index <= currentIndex;
                                        const isActive = index === currentIndex;
                                        
                                        return (
                                            <div key={stage} className="flex flex-col items-center" style={{ width: '20%' }}>
                                                {/* Circle Marker */}
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm transition-colors duration-300 ${isCompleted ? 'bg-purple-600 shadow-md shadow-purple-200' : 'bg-gray-300'}`}>
                                                    {isCompleted ? <MdCheckCircle /> : <span className="w-3 h-3 bg-white rounded-full opacity-60"></span>}
                                                </div>

                                                {/* Stage Label & Icon */}
                                                <div className="mt-4 flex flex-col items-center">
                                                    <div className={`text-3xl mb-2 ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                                                        {STAGE_ICONS[index]}
                                                    </div>
                                                    <p className={`text-xs font-semibold text-center transition-colors duration-500 ${isActive ? 'text-purple-700' : 'text-gray-500'}`}>
                                                        {stage}
                                                    </p>
                                                    <p className={`text-[10px] text-center mt-1 transition-opacity duration-500 ${isCompleted && order.stageDates && order.stageDates[stage] ? 'opacity-100 text-purple-600 font-medium' : 'opacity-0'}`}>
                                                        {order.stageDates && order.stageDates[stage] ? new Date(order.stageDates[stage]).toLocaleDateString('vi-VN') : ''}
                                                    </p>
                                                </div>

                                                {/* Action Button (only under active stage) */}
                                                {isActive && index < STAGES.length - 1 && (
                                                    <div className="absolute -bottom-10 mt-6">
                                                        <button 
                                                            onClick={() => handleAdvanceStage(order._id, currentStatus)}
                                                            className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm transition-colors"
                                                        >
                                                            Mark as done
                                                        </button>
                                                    </div>
                                                )}
                                                
                                                {/* Completed Action Logic */}
                                                {isActive && index === STAGES.length - 1 && (
                                                    <div className="absolute -bottom-10 mt-6">
                                                        <span className="px-4 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                                            Fully Delivered
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )
                })}

                {orders.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <p className="text-gray-500">No orders found.</p>
                    </div>
                )}
            </div>

            {/* Cancel Request Modal */}
            {showCancelModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-red-50 px-6 py-4 border-b border-red-100">
                            <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                                <MdCancel className="text-xl" /> There is a cancel request
                            </h3>
                            <p className="text-sm text-red-600 mt-1">Requested on {new Date(selectedOrder.cancelRequest.requestedAt).toLocaleString()}</p>
                        </div>
                        <div className="p-6">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-2">Reason provided by user:</p>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 italic">
                                "{selectedOrder.cancelRequest.reason}"
                            </div>
                            <p className="text-xs text-red-500 mt-4 font-medium italic">Approving this will permanently hide the order and restore product stock to in-house inventory.</p>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            <button 
                                onClick={() => handleDisapproveCancel(selectedOrder._id)}
                                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-semibold transition-colors"
                            >
                                Disapprove
                            </button>
                            <button 
                                onClick={() => handleApproveCancel(selectedOrder._id)}
                                className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-semibold transition-colors shadow-sm shadow-red-100"
                            >
                                Approve Cancellation
                            </button>
                            <button 
                                onClick={() => setShowCancelModal(false)}
                                className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ManageOrders
