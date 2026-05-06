import React, { useState, useEffect, useMemo } from 'react'
import { useFetchAllBooksQuery } from '../../redux/features/books/booksApi'
import BookCard from '../home/BookCard'
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useGetOrdersByEmailQuery } from '../../redux/features/orders/ordersApi'
import { MOOD_OPTIONS as MOODS } from './AddBook'

// Move SORT_OPTIONS inside component to use t()

const PAGE_SIZE = 12

const BooksPage = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const { currentUser } = useAuth();
    const excludePurchased = searchParams.get('excludePurchased') === 'true';

    const SORT_OPTIONS = [
        { label: t('books.sortNewest'), value: 'newest' },
        { label: t('books.sortPriceAsc'), value: 'price_asc' },
        { label: t('books.sortPriceDesc'), value: 'price_desc' },
        { label: t('books.sortTitleAsc'), value: 'title_asc' },
    ]

    const { data: books = [], isLoading, isError } = useFetchAllBooksQuery()
    const [search, setSearch] = useState('')
    // Pre-select the category from the ?category= URL query param (used by email CTAs)
    const [selectedCategory, setSelectedCategory] = useState(
        searchParams.get('category') || t('books.allCategory')
    )
    const [selectedMood, setSelectedMood] = useState(null)
    const [sortBy, setSortBy] = useState('newest')
    const [currentPage, setCurrentPage] = useState(1)

    // Fetch the logged-in user's orders (only when excludePurchased flag is set)
    const { data: userOrders = [] } = useGetOrdersByEmailQuery(
        currentUser?.email,
        { skip: !excludePurchased || !currentUser?.email }
    );

    // Build a Set of already-purchased book IDs
    const purchasedBookIds = useMemo(() => {
        if (!excludePurchased || !userOrders.length) return new Set();
        const ids = new Set();
        for (const order of userOrders) {
            for (const item of order.productIds || []) {
                const id = typeof item.productId === 'object' ? item.productId?._id : item.productId;
                if (id) ids.add(String(id));
            }
        }
        return ids;
    }, [userOrders, excludePurchased]);

    // Dynamic categories from data
    const categories = useMemo(() => {
        const cats = [...new Set(books.map(b => b.category).filter(Boolean))]
        return [t('books.allCategory'), ...cats.sort()]
    }, [books, t])

    // Filter + sort
    const filteredBooks = useMemo(() => {
        let result = [...books]

        // Exclude already-purchased books when flag is set
        if (excludePurchased && purchasedBookIds.size > 0) {
            result = result.filter(b => !purchasedBookIds.has(String(b._id)))
        }

        // Search
        if (search.trim()) {
            const q = search.toLowerCase()
            result = result.filter(b =>
                b.title?.toLowerCase().includes(q) ||
                b.author?.toLowerCase().includes(q) ||
                b.isbn?.includes(q)
            )
        }

        // Mood Filter (Higher priority than Category)
        if (selectedMood) {
            result = result.filter(b => b.moods && b.moods.includes(selectedMood))
        } else if (selectedCategory !== t('books.allCategory')) {
            // Category Filter
            result = result.filter(b => b.category === selectedCategory)
        }

        // Sort
        switch (sortBy) {
            case 'price_asc':
                result.sort((a, b) => (a.price || 0) - (b.price || 0))
                break
            case 'price_desc':
                result.sort((a, b) => (b.price || 0) - (a.price || 0))
                break
            case 'title_asc':
                result.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
                break
            case 'newest':
            default:
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                break
        }

        return result
    }, [books, search, selectedCategory, selectedMood, sortBy, excludePurchased, purchasedBookIds])

    const totalPages = Math.ceil(filteredBooks.length / PAGE_SIZE)
    const displayedBooks = filteredBooks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

    // Reset page when filters change
    useEffect(() => { setCurrentPage(1) }, [search, selectedCategory, selectedMood, sortBy])

    // Effect to reset selectedCategory when language changes if it was "All"
    useEffect(() => {
        if (selectedCategory === 'All' || selectedCategory === 'Tất cả') {
             setSelectedCategory(t('books.allCategory'));
        }
    }, [t])

    const handlePageChange = (page) => {
        setCurrentPage(page)
        window.scrollTo({ top: 300, behavior: 'smooth' })
    }

    // Generate page numbers with ellipsis
    const getPageNumbers = () => {
        const pages = []
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            pages.push(1)
            if (currentPage > 3) pages.push('...')
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                pages.push(i)
            }
            if (currentPage < totalPages - 2) pages.push('...')
            pages.push(totalPages)
        }
        return pages
    }

    if (isLoading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#008080]"></div>
        </div>
    )

    if (isError) return (
        <div className="min-h-[60vh] flex items-center justify-center text-gray-500">
            {t('books.loadingError')}
        </div>
    )

    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="bg-gradient-to-br from-[#008080] to-[#005f5f] text-white py-16 px-4 rounded-2xl mb-10">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('books.heroTitle')}</h1>
                    <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
                        {t('books.heroDesc')}
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-xl mx-auto relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                        <input
                            type="text"
                            placeholder={t('books.searchPlaceholder')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
                        />
                    </div>
                </div>
            </section>

            {/* ── Personalised banner shown when arriving from email CTA ── */}
            {excludePurchased && selectedCategory !== t('books.allCategory') && (
                <div className="mx-auto max-w-6xl px-4 mb-4">
                    <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 text-purple-800 rounded-xl px-5 py-3 text-sm font-medium">
                        <span className="text-lg">🎁</span>
                        <span dangerouslySetInnerHTML={{ __html: t('books.excludeBanner', { category: selectedCategory }) }} />
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 pb-16">
                {/* Mood Bar */}
                <div className="mb-10 text-center">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">{t('books.moodQuestion')}</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {MOODS.map((mood) => (
                            <button
                                key={mood.id}
                                onClick={() => {
                                    setSelectedMood(selectedMood === mood.id ? null : mood.id);
                                    setSelectedCategory(t('books.allCategory'));
                                }}
                                className={`group flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300
                                    ${selectedMood === mood.id
                                        ? 'bg-[#008080] border-[#008080] shadow-lg scale-105'
                                        : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
                                    }`}
                            >
                                <span className={`text-3xl transition-transform duration-300 group-hover:scale-110 ${selectedMood === mood.id ? 'scale-110' : ''}`}>
                                    {mood.emoji}
                                </span>
                                <span className={`text-xs font-bold ${selectedMood === mood.id ? 'text-white' : 'text-gray-500'}`}>
                                    {t(mood.labelKey)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-2 mb-6">
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

                {/* Toolbar: Results count + Sort */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8">
                    <p className="text-sm text-gray-500">
                        {t('books.showing')} <span className="font-semibold text-gray-700">{filteredBooks.length}</span> {filteredBooks.length === 1 ? t('books.bookSingle') : t('books.bookPlural')}
                        {selectedCategory !== t('books.allCategory') && <span> {t('books.in')} <span className="font-semibold text-[#008080]">{selectedCategory}</span></span>}
                        {search && <span> {t('books.matching')} "<span className="font-semibold text-gray-700">{search}</span>"</span>}
                    </p>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border border-gray-200 bg-white rounded-lg px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#008080]/30 focus:border-[#008080]"
                    >
                        {SORT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Books Grid */}
                {displayedBooks.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl">
                        <p className="text-6xl mb-4">📚</p>
                        <p className="text-xl text-gray-500 mb-2">{t('books.notFound')}</p>
                        <p className="text-sm text-gray-400 mb-6">{t('books.notFoundDesc')}</p>
                        <button
                            onClick={() => { setSearch(''); setSelectedCategory(t('books.allCategory')) }}
                            className="text-[#008080] hover:underline font-semibold text-sm"
                        >
                            {t('books.clearFilters')}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedBooks.map((book) => (
                            <div key={book._id} className="flex justify-center">
                                <BookCard book={book} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-1 mt-12">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-default transition-colors"
                        >
                            <FiChevronLeft />
                        </button>

                        {getPageNumbers().map((page, i) => (
                            page === '...' ? (
                                <span key={`ellipsis-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">...</span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors
                                        ${currentPage === page
                                            ? 'bg-[#008080] text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {page}
                                </button>
                            )
                        ))}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-default transition-colors"
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default BooksPage
