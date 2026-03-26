import React, { useState } from 'react'
import { useAddBlogMutation, useFetchAllBlogsQuery, useDeleteBlogMutation } from '../../redux/features/blogs/blogsApi'

const AddBlog = () => {
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: '',
        author: '',
        coverImage: '',
    })
    const [successMsg, setSuccessMsg] = useState('')
    const [errorMsg, setErrorMsg] = useState('')

    const { data: blogs = [] } = useFetchAllBlogsQuery()
    const [addBlog, { isLoading: isAdding }] = useAddBlogMutation()
    const [deleteBlog] = useDeleteBlogMutation()

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSuccessMsg('')
        setErrorMsg('')
        try {
            await addBlog(form).unwrap()
            setSuccessMsg('Blog post created successfully!')
            setForm({ title: '', description: '', category: '', author: '', coverImage: '' })
        } catch (err) {
            setErrorMsg('Failed to create blog post. ' + (err.data?.message || ''))
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm('Delete this blog post?')) {
            try {
                await deleteBlog(id).unwrap()
            } catch {
                alert('Failed to delete blog post.')
            }
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Blog Posts</h1>

            {/* Create Form */}
            <div className="bg-white rounded-xl border shadow-sm p-6 mb-10 max-w-2xl">
                <h2 className="text-xl font-semibold mb-5">Create New Post</h2>
                {successMsg && <p className="text-green-600 mb-4 text-sm">{successMsg}</p>}
                {errorMsg && <p className="text-red-500 mb-4 text-sm">{errorMsg}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input
                            name="title" value={form.title} onChange={handleChange} required
                            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                            placeholder="Blog post title"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content / Description *</label>
                        <textarea
                            name="description" value={form.description} onChange={handleChange} required
                            rows={6}
                            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none resize-none"
                            placeholder="Write your blog content here..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <input
                                name="category" value={form.category} onChange={handleChange}
                                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                                placeholder="e.g. New Arrivals"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                            <input
                                name="author" value={form.author} onChange={handleChange} required
                                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                                placeholder="Your name"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                        <input
                            name="coverImage" value={form.coverImage} onChange={handleChange}
                            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                            placeholder="https://..."
                        />
                    </div>
                    <button
                        type="submit" disabled={isAdding}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isAdding ? 'Publishing...' : 'Publish Post'}
                    </button>
                </form>
            </div>

            {/* Existing Posts */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Published Posts ({blogs.length})</h2>
                {blogs.length === 0 ? (
                    <p className="text-gray-400 text-sm">No posts yet.</p>
                ) : (
                    <ul className="divide-y">
                        {blogs.map((blog) => (
                            <li key={blog._id} className="flex items-center justify-between py-3 text-sm">
                                <div>
                                    <p className="font-medium text-gray-800">{blog.title}</p>
                                    <p className="text-gray-400 text-xs">{blog.category} · By {blog.author}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(blog._id)}
                                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                                >Delete</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default AddBlog
