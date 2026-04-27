import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const BlogCard = ({ blog }) => {
    const { i18n } = useTranslation();
    const fallbackImage = 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=600&q=80'

    return (
        <Link to={`/blog/${blog._id}`} className="group">
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                <div className="relative overflow-hidden h-52">
                    <img
                        src={blog.coverImage || fallbackImage}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => { e.target.src = fallbackImage }}
                    />
                    {blog.category && (
                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#008080] text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                            {blog.category}
                        </span>
                    )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#008080] transition-colors">
                        {blog.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-3 flex-1 leading-relaxed">{blog.description}</p>
                    <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-50">
                        <div className="w-7 h-7 bg-[#008080] rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {blog.author?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1">
                            <span className="text-xs font-medium text-gray-700">{blog.author}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                            {blog.createdAt && new Date(blog.createdAt).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default BlogCard
