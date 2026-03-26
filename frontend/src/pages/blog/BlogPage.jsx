import React from 'react'
import { useFetchAllBlogsQuery } from '../../redux/features/blogs/blogsApi'
import BlogCard from '../../components/BlogCard'

const BlogPage = () => {
    const { data: blogs = [], isLoading, isError } = useFetchAllBlogsQuery()

    if (isLoading) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
    )

    if (isError) return (
        <div className="text-center py-20 text-gray-500">Failed to load blog posts. Please try again later.</div>
    )

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-3">Our Blog</h1>
                <p className="text-gray-500 text-lg max-w-xl mx-auto">
                    Book reviews, reading tips, new arrivals, and more from our team.
                </p>
            </div>

            {/* Blog Grid */}
            {blogs.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <p className="text-xl">No posts yet. Check back soon!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.map((blog) => (
                        <BlogCard key={blog._id} blog={blog} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default BlogPage
