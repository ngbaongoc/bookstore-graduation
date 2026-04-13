import React from 'react'
import { Link } from 'react-router-dom'
import { MdInventory, MdOutlineShoppingCart, MdLibraryBooks } from 'react-icons/md'
import formatCurrency from '../../utils/formatCurrency'
import { useFetchAllBooksQuery } from '../../redux/features/books/booksApi'

const Dashboard = () => {
    const { data: books = [] } = useFetchAllBooksQuery()

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
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Books</h2>
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="text-gray-400 border-b">
                            <th className="pb-3 font-medium">Title</th>
                            <th className="pb-3 font-medium">Author</th>
                            <th className="pb-3 font-medium">Category</th>
                            <th className="pb-3 font-medium text-right">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.slice(0, 8).map((book) => (
                            <tr key={book._id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="py-3 font-medium text-gray-800 truncate max-w-[200px]">{book.title}</td>
                                <td className="py-3 text-gray-600">{book.author}</td>
                                <td className="py-3 text-gray-600">{book.category}</td>
                                <td className="py-3 text-right text-gray-800">
                                    {formatCurrency(book.price || book.newPrice)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Dashboard
