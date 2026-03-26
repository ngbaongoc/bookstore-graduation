import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useFetchBlogByIdQuery } from '../../redux/features/blogs/blogsApi'

const SingleBlogPage = () => {
    const { id } = useParams()
    const { data: blog, isLoading, isError } = useFetchBlogByIdQuery(id)

    if (isLoading) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
    )

    if (isError || !blog) return (
        <div className="text-center py-20 text-gray-500">
            <p>Blog post not found.</p>
            <Link to="/blog" className="text-blue-500 hover:underline mt-4 inline-block">← Back to Blog</Link>
        </div>
    )

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <Link to="/blog" className="text-sm text-blue-500 hover:underline mb-6 inline-block">← Back to Blog</Link>

            {blog.coverImage && (
                <img
                    src={blog.coverImage}
                    alt={blog.title}
                    className="w-full h-72 object-cover rounded-xl mb-8 shadow-sm"
                />
            )}

            <div className="flex items-center gap-3 mb-4">
                {blog.category && (
                    <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                        {blog.category}
                    </span>
                )}
                <span className="text-gray-400 text-sm">By {blog.author}</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-6">{blog.title}</h1>

            <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {blog.description}
            </div>
        </div>
    )
}

export default SingleBlogPage
