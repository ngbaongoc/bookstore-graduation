import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFetchBookByIdQuery, useUpdateBookMutation } from '../../redux/features/books/booksApi'
import { useForm } from "react-hook-form"

const UpdateBook = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data: book, isLoading, isError } = useFetchBookByIdQuery(id)
    const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation()

    const { register, handleSubmit, setValue } = useForm()

    useEffect(() => {
        if (book) {
            setValue('title', book.title)
            setValue('author', book.author)
            setValue('isbn', book.isbn)
            setValue('category', book.category)
            setValue('price', book.price || book.newPrice)
            setValue('description', book.description)
        }
    }, [book, setValue])

    const onSubmit = async (data) => {
        try {
            await updateBook({ id, ...data }).unwrap()
            alert("Book updated successfully")
            navigate(`/books/${id}`)
        } catch (err) {
            alert("Failed to update book: " + (err.data?.message || err.message))
        }
    }

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>
    if (isError) return <div className="flex justify-center items-center h-screen">Error loading book data</div>

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <h2 className="text-2xl font-bold mb-6">Update Book Information</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        {...register('title', { required: true })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Author</label>
                    <input
                        {...register('author', { required: true })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ISBN</label>
                        <input
                            {...register('isbn', { required: true })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price (VND)</label>
                        <input
                            type="number"
                            step="0.01"
                            {...register('price', { required: true })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                        {...register('category', { required: true })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        rows="4"
                        {...register('description', { required: true })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                </div>
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={isUpdating}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors disabled:bg-gray-400"
                    >
                        {isUpdating ? "Updating..." : "Update Book"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`/books/${id}`)}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export default UpdateBook
