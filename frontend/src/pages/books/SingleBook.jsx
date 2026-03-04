import React, { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useDeleteBookMutation, useFetchBookByIdQuery } from '../../redux/features/books/booksApi'
import { getImgUrl } from '../../utils/getImgUrl'
import { FiShoppingCart } from "react-icons/fi"
import { HiEllipsisVertical } from "react-icons/hi2"

const SingleBook = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data: book, isLoading, isError } = useFetchBookByIdQuery(id)
    const [deleteBook] = useDeleteBookMutation()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this book?")) {
            try {
                await deleteBook(id).unwrap()
                alert("Book deleted successfully")
                navigate('/')
            } catch (err) {
                alert("Failed to delete book: " + (err.data?.message || err.message))
            }
        }
    }

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>
    if (isError) return <div className="flex justify-center items-center h-screen">Error loading book details</div>

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10 relative">
            <div className="absolute top-4 right-4">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <HiEllipsisVertical className="text-2xl text-gray-600" />
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg z-10">
                        <Link
                            to={`/books/edit/${id}`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Edit Book
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            Delete Book
                        </button>
                    </div>
                )}
            </div>
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2">
                    <img
                        src={getImgUrl(book?.thumbnail || book?.coverImage)}
                        alt={book?.title}
                        className="w-full h-auto rounded-lg shadow-sm"
                    />
                </div>
                <div className="md:w-1/2 flex flex-col justify-center">
                    <h1 className="text-3xl font-bold mb-4">{book?.title}</h1>
                    <div className="space-y-4 text-gray-700">
                        <p><span className="font-semibold">Author:</span> {book?.author}</p>
                        <p><span className="font-semibold">Category:</span> {book?.category}</p>
                        <p><span className="font-semibold">ISBN:</span> {book?.isbn}</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book?.price || book?.newPrice)}
                        </p>
                    </div>
                    <button className="mt-8 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-8 rounded-md flex items-center justify-center gap-2 transition-colors w-max">
                        <FiShoppingCart />
                        <span>Add to Cart</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SingleBook
