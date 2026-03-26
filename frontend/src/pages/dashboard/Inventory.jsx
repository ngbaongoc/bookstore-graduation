import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { MdInventory, MdOutlineShoppingCart, MdLibraryBooks, MdAddCircleOutline } from 'react-icons/md'
import { useFetchAllBooksQuery } from '../../redux/features/books/booksApi'
import { useAdjustStockMutation } from '../../redux/features/inventory/inventoryApi'

const Inventory = () => {
    const { data: books = [], refetch: refetchBooks } = useFetchAllBooksQuery()
    const [adjustStock] = useAdjustStockMutation()

    const [adjustModalOpen, setAdjustModalOpen] = useState(false)
    const [selectedBook, setSelectedBook] = useState(null)
    const [adjustQty, setAdjustQty] = useState(0)

    const handleAdjust = async () => {
        const qty = parseInt(adjustQty);
        if (!selectedBook || isNaN(qty) || qty === 0) {
            Swal.fire('Invalid Quantity', 'Please enter a valid non-zero number to adjust the stock.', 'warning');
            return;
        }
        try {
            await adjustStock({ id: selectedBook._id, quantityToAdd: qty }).unwrap();
            setAdjustModalOpen(false)
            setAdjustQty(0)
            Swal.fire({
                title: 'Stock Adjusted!', 
                text: `Successfully registered inventory change for "${selectedBook.title}".`, 
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            refetchBooks()
        } catch (error) {
            if (error?.status === 401 || error?.status === 403) {
                Swal.fire({
                    title: 'Session Expired',
                    text: 'Your security token has expired (it lasts 1 hour). Redirecting to login...',
                    icon: 'warning',
                    timer: 2500,
                    showConfirmButton: false
                }).then(() => {
                    localStorage.removeItem('token');
                    window.location.href = '/admin/login';
                });
            } else {
                Swal.fire({
                    title: 'Error', 
                    text: error?.data?.message || 'Failed to adjust stock. Please try again.', 
                    icon: 'error'
                });
            }
        }
    }

    const openAdjust = (book) => {
        setSelectedBook(book)
        setAdjustQty(0)
        setAdjustModalOpen(true)
    }

    const lowStockBooks = books.filter(b => (b.inventory?.inHouseQuantity || 0) < 5)

    const getStockBadge = (qty) => {
        if (qty >= 5) return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Good ({qty})</span>
        if (qty > 0) return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full cursor-help" title="Warning: Low Stock!">Low ({qty})</span>
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full animate-pulse shadow-sm shadow-red-200">Out of Stock</span>
    }

    const stats = [
        {
            label: 'Total Books',
            value: books.length,
            icon: <MdLibraryBooks className="text-3xl text-blue-500" />,
            link: '/admin/add-book',
            linkLabel: 'Add New Book',
        },
        {
            label: 'Categories',
            value: [...new Set(books.map(b => b.category))].length,
            icon: <MdInventory className="text-3xl text-green-500" />,
            link: '/admin/add-book',
            linkLabel: 'Manage Books',
        },
        {
            label: 'View Orders',
            value: '—',
            icon: <MdOutlineShoppingCart className="text-3xl text-yellow-500" />,
            link: '/admin/orders',
            linkLabel: 'All Orders',
        },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Inventory</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map(({ label, value, icon, link, linkLabel }) => (
                    <div key={label} className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-3 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm font-medium">{label}</span>
                            {icon}
                        </div>
                        <p className="text-4xl font-bold text-gray-900">{value}</p>
                        <Link to={link} className="text-blue-500 hover:underline text-sm">{linkLabel} →</Link>
                    </div>
                ))}
            </div>

            {/* Low Stock Warning Banner */}
            {lowStockBooks.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                       <span className="text-3xl drop-shadow-sm">⚠️</span>
                       <div>
                           <p className="font-bold text-red-800">Critical Inventory Warning</p>
                           <p className="text-red-700 text-sm mt-0.5">There are <b>{lowStockBooks.length}</b> book(s) with an in-house quantity under 5 units. Please restock immediately to avoid blocking customer orders.</p>
                       </div>
                    </div>
                </div>
            )}

            {/* Live Shelf Inventory Table */}
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
                        {books.map((book) => {
                            const isLowStock = (book.inventory?.inHouseQuantity || 0) < 5;
                            return (
                            <tr key={book._id} className={`border-b last:border-0 transition ${isLowStock ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}>
                                <td className="py-3 text-gray-500">{book.isbn || 'N/A'}</td>
                                <td className="py-3 font-medium text-gray-800 truncate max-w-[200px]">{book.title}</td>
                                <td className="py-3 text-gray-600">{book.inventory?.binLocation || 'General Shelf'}</td>
                                <td className="py-3">
                                    {getStockBadge(book.inventory?.inHouseQuantity || 0)}
                                </td>
                                <td className="py-3 text-gray-600">{book.inventory?.reservedQuantity || 0}</td>
                                <td className="py-3 text-right">
                                    <button onClick={() => openAdjust(book)} className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center justify-end gap-1 ml-auto bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition">
                                        <MdAddCircleOutline /> Adjust
                                    </button>
                                </td>
                            </tr>
                            )
                        })}
                    </tbody>
                </table>
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

export default Inventory
