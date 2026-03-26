import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { MdInventory, MdLocalShipping, MdHistory, MdAddCircleOutline, MdCheckCircle } from 'react-icons/md'
import { useFetchAllBooksQuery } from '../../redux/features/books/booksApi'
import { 
    useGetInventoryLogsQuery, 
    useAdjustStockMutation, 
    useConfirm3PLPickupMutation, 
    usePackOrderMutation 
} from '../../redux/features/inventory/inventoryApi'

const ELogisticsDashboard = () => {
    const { data: books = [], refetch: refetchBooks } = useFetchAllBooksQuery()
    const { data: logs = [], refetch: refetchLogs } = useGetInventoryLogsQuery()
    const [adjustStock] = useAdjustStockMutation()
    const [confirmPickup] = useConfirm3PLPickupMutation()
    const [packOrder] = usePackOrderMutation()

    const [adjustModalOpen, setAdjustModalOpen] = useState(false)
    const [selectedBook, setSelectedBook] = useState(null)
    const [adjustQty, setAdjustQty] = useState(0)

    const handleAdjust = async () => {
        if (!selectedBook || adjustQty === 0) return;
        await adjustStock({ id: selectedBook._id, quantityToAdd: parseInt(adjustQty) })
        setAdjustModalOpen(false)
        setAdjustQty(0)
        refetchBooks()
        refetchLogs()
    }

    const handleConfirmPickup = async (bookId, qty) => {
        if(window.confirm(`Confirm handing over ${qty} units to 3PL?`)) {
            await confirmPickup({ id: bookId, quantityPickedUp: qty })
            refetchBooks()
            refetchLogs()
        }
    }

    const handlePack = async (bookId) => {
        await packOrder(bookId)
        refetchLogs()
        alert('Marked as packed!')
    }

    const openAdjust = (book) => {
        setSelectedBook(book)
        setAdjustQty(0)
        setAdjustModalOpen(true)
    }

    const readyForHandover = books.filter(b => b.inventory?.reservedQuantity > 0)

    const getStockBadge = (qty) => {
        if (qty > 5) return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Good ({qty})</span>
        if (qty > 0) return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Low ({qty})</span>
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Out of Stock</span>
    }

    return (
        <div className="flex flex-col xl:flex-row gap-6">
            <div className="flex-1 space-y-6">
                <h1 className="text-3xl font-bold text-gray-800">E-Logistics Control</h1>

                {/* Ready for Handover List */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <MdLocalShipping className="text-2xl text-blue-500" />
                        <h2 className="text-xl font-semibold text-gray-800">Pick & Pack List (Ready for 3PL)</h2>
                    </div>
                    {readyForHandover.length === 0 ? (
                        <p className="text-gray-500 italic">No orders waiting for pickup.</p>
                    ) : (
                        <div className="space-y-4">
                            {readyForHandover.map(book => (
                                <div key={book._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                    <div>
                                        <p className="font-semibold text-gray-800">{book.title}</p>
                                        <p className="text-sm text-gray-500">Bin: {book.inventory?.binLocation || 'N/A'}</p>
                                        <p className="text-sm text-gray-500">Reserved: <span className="font-bold text-red-500">{book.inventory?.reservedQuantity}</span> unit(s)</p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => handlePack(book._id)} className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm flex items-center gap-1 w-full justify-center">
                                            <MdCheckCircle /> Mark as Packed
                                        </button>
                                        <button onClick={() => handleConfirmPickup(book._id, book.inventory.reservedQuantity)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-1 w-full justify-center">
                                            <MdLocalShipping /> Confirm Handover
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main Inventory Table */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 overflow-x-auto">
                    <div className="flex items-center gap-2 mb-4">
                        <MdInventory className="text-2xl text-green-500" />
                        <h2 className="text-xl font-semibold text-gray-800">Live Shelf Inventory</h2>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="text-gray-400 border-b">
                                <th className="pb-3 font-medium">SKU (ISBN)</th>
                                <th className="pb-3 font-medium">Title</th>
                                <th className="pb-3 font-medium">Bin Location</th>
                                <th className="pb-3 font-medium">In-House Qty</th>
                                <th className="pb-3 font-medium">Reserved</th>
                                <th className="pb-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.map((book) => (
                                <tr key={book._id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="py-3 text-gray-500">{book.isbn || 'N/A'}</td>
                                    <td className="py-3 font-medium text-gray-800 truncate max-w-[200px]">{book.title}</td>
                                    <td className="py-3 text-gray-600">{book.inventory?.binLocation || 'General Shelf'}</td>
                                    <td className="py-3">
                                        {getStockBadge(book.inventory?.inHouseQuantity || 0)}
                                    </td>
                                    <td className="py-3 text-gray-600">{book.inventory?.reservedQuantity || 0}</td>
                                    <td className="py-3 text-right">
                                        <button onClick={() => openAdjust(book)} className="text-blue-500 hover:text-blue-700 font-medium text-sm flex items-center justify-end gap-1 ml-auto">
                                            <MdAddCircleOutline /> Adjust
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Inventory Sync Sidebar */}
            <div className="w-full xl:w-80 bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col xl:h-[calc(100vh-100px)] h-96">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                    <MdHistory className="text-2xl text-purple-500" />
                    <h2 className="text-xl font-semibold text-gray-800">Inventory Sync Log</h2>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {logs.map(log => (
                        <div key={log._id} className="border-l-2 border-purple-500 pl-3 py-1">
                            <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</p>
                            <p className="text-sm font-medium text-gray-800">{log.actionType}</p>
                            <p className="text-xs text-gray-600 truncate">{log.bookId?.title || 'Unknown Book'}</p>
                            <p className="text-xs text-gray-500 mt-1">{log.description}</p>
                        </div>
                    ))}
                    {logs.length === 0 && <p className="text-sm text-gray-500 italic">No sync history yet.</p>}
                </div>
            </div>

            {/* Adjust Stock Modal */}
            {adjustModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Adjust In-House Stock</h3>
                        <p className="text-sm text-gray-600 mb-4">You are adjusting the shelf quantity for <b>{selectedBook?.title}</b>. Enter a positive number to add, or negative to reduce.</p>
                        <input 
                            type="number" 
                            className="w-full border p-2 rounded mb-4" 
                            value={adjustQty} 
                            onChange={(e) => setAdjustQty(e.target.value)} 
                            placeholder="Quantity (+/-)" 
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setAdjustModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                            <button onClick={handleAdjust} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ELogisticsDashboard
