import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import { useAddBookMutation } from '../../redux/features/books/booksApi'
import { useNavigate } from 'react-router-dom'
import { MdArrowBack, MdCloudUpload, MdCheckCircle } from 'react-icons/md'
import getBaseUrl from '../../utils/baseURL'
import { useTranslation } from 'react-i18next'

export const MOOD_OPTIONS = [
    { id: 'bitter_reality', labelKey: 'moods.bitter_reality', emoji: '🔪' },
    { id: 'existential_crisis', labelKey: 'moods.existential_crisis', emoji: '🌪️' },
    { id: 'hanoi_polite', labelKey: 'moods.hanoi_polite', emoji: '🍵' },
    { id: 'french_sadness', labelKey: 'moods.french_sadness', emoji: '🍷' },
    { id: 'urban_loneliness', labelKey: 'moods.urban_loneliness', emoji: '🏙️' },
    { id: 'window_staring', labelKey: 'moods.window_staring', emoji: '🌃' },
    { id: 'german_cold', labelKey: 'moods.german_cold', emoji: '❄️' },
    { id: 'noir_detective', labelKey: 'moods.noir_detective', emoji: '🕵️' },
    { id: 'not_on_earth', labelKey: 'moods.not_on_earth', emoji: '🚀' }
]

const AddBook = () => {
    const { t } = useTranslation()
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
            const response = await fetch(`${getBaseUrl()}/api/upload`, {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                throw new Error('Failed to upload image')
            }

            const data = await response.json()
            setUploadedImagePath(data.filePath)
            setThumbnailPreview(data.filePath.startsWith('http') ? data.filePath : `${getBaseUrl()}${data.filePath}`)
        } catch (error) {
            alert('Image upload failed: ' + error.message)
        }
    }

    const onSubmit = async (data) => {
        try {
            const bookData = {
                ...data,
                moods: data.moods || [],
                thumbnail: uploadedImagePath || "https://via.placeholder.com/150",
                published_year: parseInt(data.published_year),
                num_pages: parseInt(data.num_pages),
                price: parseFloat(data.price),
                inHouseQuantity: parseInt(data.inHouseQuantity) || 0,
                binLocation: data.binLocation || "General Shelf",
                isbn: data.isbn,
                moodPlaylistUrl: data.moodPlaylistUrl || "",
                cinemaLink: data.cinemaLink || "",
                cinemaComparison: data.cinemaComparison || "",
                featuredQuote: data.featuredQuote || ""
            }
            await addBook(bookData).unwrap()
            alert("Book added successfully!")
            reset()
            setThumbnailPreview(null)
            setUploadedImagePath(null)
            navigate('/admin') // Redirect to Inventory
        } catch (err) {
            alert("Failed to add book: " + (err.data?.message || err.message))
        }
    }

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
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Register New Book</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Form Fields */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Book Title</label>
                            <input
                                {...register('title', { required: "Title is required" })}
                                className="block w-full border border-gray-200 rounded-xl shadow-sm p-3.5 focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all"
                                placeholder="Enter book title"
                            />
                            {errors.title && <span className="text-red-500 text-xs mt-1">{errors.title.message}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Author Name</label>
                            <input
                                {...register('author', { required: "Author is required" })}
                                className="block w-full border border-gray-200 rounded-xl shadow-sm p-3.5 focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all"
                                placeholder="Author name"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">ISBN (SKU)</label>
                                <input
                                    {...register('isbn', { required: "ISBN matches SKU" })}
                                    className="block w-full border border-gray-200 rounded-xl shadow-sm p-3.5 focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all font-mono"
                                    placeholder="000000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Price (VND)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('price', { required: "Price is required" })}
                                    className="block w-full border border-gray-200 rounded-xl shadow-sm p-3.5 focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all font-bold text-emerald-600"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Category</label>
                                <input
                                    {...register('category', { required: "Category is required" })}
                                    className="block w-full border border-gray-200 rounded-xl shadow-sm p-3.5 focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all"
                                    placeholder="e.g. Fiction"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Published Year</label>
                                <input
                                    type="number"
                                    {...register('published_year', { required: true })}
                                    className="block w-full border border-gray-200 rounded-xl shadow-sm p-3.5 focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all"
                                    placeholder={new Date().getFullYear()}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Moods / Vibes</label>
                            <div className="grid grid-cols-2 gap-2">
                                {MOOD_OPTIONS.map(mood => (
                                    <label key={mood.id} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                                        <input type="checkbox" value={mood.id} {...register('moods')} className="rounded text-[#008080] focus:ring-[#008080] w-4 h-4" />
                                        <span className="text-sm text-gray-700">{mood.emoji} {t(mood.labelKey)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Description</label>
                            <textarea
                                rows="4"
                                {...register('description', { required: "Description is required" })}
                                className="block w-full border border-gray-200 rounded-xl shadow-sm p-3.5 focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all resize-none"
                                placeholder="Syncopsis of the book..."
                            />
                        </div>

                        {/* Aesthetic Settings Box */}
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                                🎨 Aesthetic Settings (Tùy chọn nghệ thuật)
                            </h3>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Featured Quote (Trích dẫn tâm đắc)</label>
                                <textarea
                                    rows="2"
                                    {...register('featuredQuote')}
                                    className="block w-full border border-gray-200 rounded-xl shadow-sm p-2.5 focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all text-sm italic"
                                    placeholder="Một câu trích dẫn hay trong sách..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Mood Playlist (Spotify URL)</label>
                                    <input
                                        {...register('moodPlaylistUrl')}
                                        className="block w-full border border-gray-200 rounded-xl shadow-sm p-2.5 focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all text-sm"
                                        placeholder="https://open.spotify.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Cinema Trailer (YouTube URL)</label>
                                    <input
                                        {...register('cinemaLink')}
                                        className="block w-full border border-gray-200 rounded-xl shadow-sm p-2.5 focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all text-sm"
                                        placeholder="https://www.youtube.com/..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Góc nhìn điện ảnh (Cinema Comparison)</label>
                                <textarea
                                    rows="2"
                                    {...register('cinemaComparison')}
                                    className="block w-full border border-gray-200 rounded-xl shadow-sm p-2.5 focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all text-sm"
                                    placeholder="Đánh giá ngắn so sánh giữa truyện và phim..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Image and Secondary Info */}
                    <div className="space-y-6 flex flex-col items-center">
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider self-start">Book Cover Thumbnail</label>
                        
                        <div className="relative group w-full max-w-[320px] aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center hover:border-[#008080] transition-all cursor-pointer">
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
                        </div>

                        <div className="w-full grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Pages</label>
                                <input
                                    type="number"
                                    {...register('num_pages', { required: true })}
                                    className="block w-full border border-gray-200 rounded-xl shadow-sm p-3.5 focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">In-House Qty</label>
                                <input
                                    type="number"
                                    {...register('inHouseQuantity')}
                                    className="block w-full border border-gray-200 rounded-xl shadow-sm p-3.5 focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="w-full">
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Bin Location</label>
                            <input
                                {...register('binLocation')}
                                className="block w-full border border-gray-200 rounded-xl shadow-sm p-3.5 focus:ring-2 focus:ring-[#008080] focus:border-transparent transition-all"
                                placeholder="General Shelf"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-8 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-[#008080] hover:bg-[#006666] text-white font-extrabold py-4 px-8 rounded-2xl transition-all shadow-xl hover:shadow-[#00808022] active:scale-95 disabled:bg-gray-400 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <MdCheckCircle className="text-xl" />
                                <span>Create Book Record</span>
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin')}
                        className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold rounded-2xl transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AddBook
