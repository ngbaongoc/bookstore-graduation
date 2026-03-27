import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFetchBookByIdQuery, useUpdateBookMutation } from '../../redux/features/books/booksApi'
import { useForm } from "react-hook-form"
import { MdArrowBack, MdCloudUpload } from 'react-icons/md'

const UpdateBook = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data: book, isLoading, isError } = useFetchBookByIdQuery(id)
    const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation()

    const { register, handleSubmit, setValue, formState: { errors } } = useForm()
    const [thumbnailPreview, setThumbnailPreview] = useState(null)
    const [uploadedImagePath, setUploadedImagePath] = useState(null)

    useEffect(() => {
        if (book) {
            setValue('title', book.title)
            setValue('author', book.author)
            setValue('isbn', book.isbn)
            setValue('category', book.category)
            setValue('price', book.price || book.newPrice)
            setValue('description', book.description)
            
            if (book.thumbnail) {
                setThumbnailPreview(book.thumbnail.startsWith('http') ? book.thumbnail : `http://localhost:5000${book.thumbnail}`)
                if (!book.thumbnail.startsWith('http')) {
                    setUploadedImagePath(book.thumbnail)
                }
            }
        }
    }, [book, setValue])

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
            setUploadedImagePath(data.filePath)
            setThumbnailPreview(`http://localhost:5000${data.filePath}`)
        } catch (error) {
            alert('Image upload failed: ' + error.message)
        }
    }

    const onSubmit = async (data) => {
        try {
            const updateData = {
                ...data,
                thumbnail: uploadedImagePath || book.thumbnail,
                id
            }
            await updateBook(updateData).unwrap()
            alert("Book updated successfully")
            navigate('/admin') // Redirect back to inventory
        } catch (err) {
            alert("Failed to update book: " + (err.data?.message || err.message))
        }
    }

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>
    if (isError) return <div className="flex justify-center items-center h-screen text-red-500">Error loading book data</div>

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-2xl border border-gray-100">
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={() => navigate('/admin')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                    title="Back to Inventory"
                >
                    <MdArrowBack size={24} />
                </button>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Edit Book Record</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Form Fields */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Book Title</label>
                            <input
                                {...register('title', { required: "Title is required" })}
                                className="block w-full border border-gray-200 rounded-xl shadow-sm p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="e.g. The Great Gatsby"
                            />
                            {errors.title && <span className="text-red-500 text-xs mt-1">{errors.title.message}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Author Name</label>
                            <input
                                {...register('author', { required: "Author is required" })}
                                className="block w-full border border-gray-200 rounded-xl shadow-sm p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="e.g. F. Scott Fitzgerald"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">ISBN (SKU)</label>
                                <input
                                    {...register('isbn', { required: "ISBN matches SKU" })}
                                    className="block w-full border border-gray-200 rounded-xl shadow-sm p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Price (VND)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('price', { required: "Price is required" })}
                                    className="block w-full border border-gray-200 rounded-xl shadow-sm p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-bold text-blue-600"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Category / Genre</label>
                            <input
                                {...register('category', { required: "Category is required" })}
                                className="block w-full border border-gray-200 rounded-xl shadow-sm p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="e.g. Fiction, Business"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Detailed Description</label>
                            <textarea
                                rows="6"
                                {...register('description', { required: "Description is required" })}
                                className="block w-full border border-gray-200 rounded-xl shadow-sm p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                placeholder="Synopsis of the book..."
                            />
                        </div>
                    </div>

                    {/* Right Column: Thumbnail Management */}
                    <div className="space-y-6 flex flex-col items-center">
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider self-start">Book Cover Thumbnail</label>
                        
                        <div className="relative group w-full max-w-[320px] aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center hover:border-blue-400 transition-all cursor-pointer">
                            {thumbnailPreview ? (
                                <img
                                    src={thumbnailPreview}
                                    alt="Book Cover"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="text-center p-6">
                                    <MdCloudUpload className="mx-auto text-4xl text-gray-400 mb-3" />
                                    <p className="text-sm text-gray-500 font-medium">Click to upload cover image</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                <span className="bg-white px-4 py-2 rounded-lg font-bold text-sm shadow-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">Change Image</span>
                            </div>
                        </div>
                        
                        <p className="text-xs text-center text-gray-400 italic">Recommended size: 600x800px. Supports JPG, PNG.</p>
                        
                        {uploadedImagePath && (
                            <div className="bg-green-50 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">New Image Staged</div>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 pt-8 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={isUpdating}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 px-8 rounded-2xl transition-all shadow-xl hover:shadow-blue-200 active:scale-95 disabled:bg-gray-400 flex items-center justify-center gap-2"
                    >
                        {isUpdating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Updating Record...</span>
                            </>
                        ) : "Save Changes"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin')}
                        className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold rounded-2xl transition-all active:scale-95"
                    >
                        Discard
                    </button>
                </div>
            </form>
        </div>
    )
}

export default UpdateBook
