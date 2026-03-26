import React from 'react'
import { Link } from 'react-router-dom'

const BlogCard = ({ blog }) => {
    const fallbackImage = 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=600&q=80'

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
            <img
                src={blog.coverImage || fallbackImage}
                alt={blog.title}
                className="w-full h-48 object-cover"
                onError={(e) => { e.target.src = fallbackImage }}
            />
            <div className="p-5 flex flex-col flex-1">
                {blog.category && (
                    <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">
                        {blog.category}
                    </span>
                )}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{blog.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-3 flex-1">{blog.description}</p>
                <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-400">By {blog.author}</span>
                    <Link
                        to={`/blog/${blog._id}`}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                        Read More →
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default BlogCard
