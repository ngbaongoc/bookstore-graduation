import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFetchAllBlogsQuery } from '../../redux/features/blogs/blogsApi'
import BlogCard from '../../components/BlogCard'
import { useTranslation } from 'react-i18next'

const BlogPage = () => {
    const { t, i18n } = useTranslation();
    const { data: allBlogs = [], isLoading, isError } = useFetchAllBlogsQuery()
    
    // Filter blogs by language
    const blogs = allBlogs.filter(blog => {
        const blogLang = blog.language || 'en';
        return blogLang === i18n.language;
    });

    const [selectedCategory, setSelectedCategory] = useState(t('blog.allCategory'))

    const categories = [t('blog.allCategory'), ...new Set(blogs.map(b => b.category).filter(Boolean))]
    const filteredBlogs = selectedCategory === t('blog.allCategory')
        ? blogs
        : blogs.filter(b => b.category === selectedCategory)

    // Featured blog = most recent
    const featuredBlog = blogs[0]
    const remainingBlogs = selectedCategory === t('blog.allCategory')
        ? filteredBlogs.slice(1)
        : filteredBlogs

    if (isLoading) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#008080]"></div>
        </div>
    )

    if (isError) return (
        <div className="text-center py-20 text-gray-500">{t('blog.loadingError')}</div>
    )

    return (
        <div className="min-h-screen">
            {/* Hero Header */}
            <section className="bg-gradient-to-br from-[#008080] to-[#005f5f] text-white py-16 px-4 rounded-2xl mb-12">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('blog.heroTitle')}</h1>
                    <p className="text-white/80 text-lg max-w-xl mx-auto">
                        {t('blog.heroDesc')}
                    </p>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 pb-16">
                {/* Featured Post */}
                {featuredBlog && selectedCategory === t('blog.allCategory') && (
                    <section className="mb-16">
                        <h2 className="text-sm font-semibold text-[#008080] uppercase tracking-wider mb-6">{t('blog.featuredTitle')}</h2>
                        <Link to={`/blog/${featuredBlog._id}`} className="group block">
                            <div className="grid md:grid-cols-2 gap-8 bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                <div className="h-64 md:h-full min-h-[280px]">
                                    <img
                                        src={featuredBlog.coverImage || 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=800&q=80'}
                                        alt={featuredBlog.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=800&q=80' }}
                                    />
                                </div>
                                <div className="p-8 flex flex-col justify-center">
                                    {featuredBlog.category && (
                                        <span className="inline-block bg-[#008080]/10 text-[#008080] text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-4 w-fit">
                                            {featuredBlog.category}
                                        </span>
                                    )}
                                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 group-hover:text-[#008080] transition-colors">
                                        {featuredBlog.title}
                                    </h3>
                                    <p className="text-gray-500 leading-relaxed line-clamp-3 mb-6">
                                        {featuredBlog.description}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-[#008080] rounded-full flex items-center justify-center text-white text-sm font-bold">
                                            {featuredBlog.author?.charAt(0)?.toUpperCase() || 'A'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">{featuredBlog.author}</p>
                                            <p className="text-xs text-gray-400">
                                                {featuredBlog.createdAt && new Date(featuredBlog.createdAt).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </section>
                )}

                {/* Category Filter */}
                {categories.length > 2 && (
                    <div className="flex flex-wrap gap-2 mb-10">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                                    ${selectedCategory === cat
                                        ? 'bg-[#008080] text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* Blog Grid */}
                <section>
                    <h2 className="text-sm font-semibold text-[#008080] uppercase tracking-wider mb-6">
                        {selectedCategory === t('blog.allCategory') ? t('blog.allPosts') : selectedCategory}
                    </h2>
                    {(selectedCategory === t('blog.allCategory') ? remainingBlogs : filteredBlogs).length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl">
                            <p className="text-6xl mb-4">📝</p>
                            <p className="text-xl text-gray-400">
                                {blogs.length === 0 ? t('blog.noPosts') : t('blog.noPostsCategory')}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {(selectedCategory === 'All' ? remainingBlogs : filteredBlogs).map((blog) => (
                                <BlogCard key={blog._id} blog={blog} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

export default BlogPage
