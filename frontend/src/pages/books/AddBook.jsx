import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import { useAddBookMutation } from '../../redux/features/books/booksApi'
import { useNavigate } from 'react-router-dom'

const AddBook = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm()
    const [addBook, { isLoading }] = useAddBookMutation()
    const navigate = useNavigate()
    const [thumbnailPreview, setThumbnailPreview] = useState(null)
    const [uploadedImagePath, setUploadedImagePath] = useState(null)

    const handleImageUpload = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('coverImage', file)

        try {
            const response = await fetch('http://localhost:5000/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Failed to upload image')
            }

            const data = await response.json()
            setUploadedImagePath(data.filePath) // Save the uploaded image path
            setThumbnailPreview(`http://localhost:5000${data.filePath}`) // Set preview URL
        } catch (error) {
            alert('Image upload failed: ' + error.message)
        }
    }

    const onSubmit = async (data) => {
        try {
            const bookData = {
                ...data,
                thumbnail: uploadedImagePath || "https://via.placeholder.com/150",
                published_year: parseInt(data.published_year),
                num_pages: parseInt(data.num_pages),
                price: parseFloat(data.price),
                isbn: parseInt(data.isbn)
            }
            await addBook(bookData).unwrap()
            alert("Book added successfully!")
            reset()
            setThumbnailPreview(null)
            setUploadedImagePath(null)
            navigate('/')
        } catch (err) {
            alert("Failed to add book: " + (err.data?.message || err.message))
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <h2 className="text-2xl font-bold mb-6">Add New Book</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        {...register('title', { required: "Title is required" })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="Book Title"
                    />
                    {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Author</label>
                    <input
                        {...register('author', { required: "Author is required" })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="Author Name"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ISBN</label>
                        <input
                            type="number"
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

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <input
                            {...register('category', { required: true })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            placeholder="e.g. Fiction"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
                        <input
                            {...register('thumbnail')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                            placeholder="Image URL"
                            disabled
                            value={uploadedImagePath || ""}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Published Year</label>
                        <input
                            type="number"
                            {...register('published_year', { required: true })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Number of Pages</label>
                        <input
                            type="number"
                            {...register('num_pages', { required: true })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        rows="4"
                        {...register('description', { required: true })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="Brief summary of the book"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Upload Cover Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                    {thumbnailPreview && (
                        <img
                            src={thumbnailPreview}
                            alt="Thumbnail Preview"
                            className="mt-2 w-32 h-32 object-cover"
                        />
                    )}
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors disabled:bg-gray-400"
                    >
                        {isLoading ? "Adding..." : "Add Book"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AddBook
