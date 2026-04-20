import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import getBaseUrl from '../../../utils/baseURL'

const booksApi = createApi({
    reducerPath: 'booksApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: `${getBaseUrl()}/api/books`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token')
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        }
    }),
    tagTypes: ['Books'],
    endpoints: (builder) => ({
        fetchAllBooks: builder.query({
            query: () => '/',
            providesTags: ['Books']
        }),
        fetchBookById: builder.query({
            query: (id) => `/${id}`,
            providesTags: (result, error, id) => [{ type: 'Books', id }]
        }),
        updateBook: builder.mutation({
            query: ({ id, ...rest }) => ({
                url: `/edit/${id}`,
                method: 'PUT',
                body: rest
            }),
            invalidatesTags: (result, error, { id }) => ['Books', { type: 'Books', id }]
        }),
        deleteBook: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Books']
        }),
        addBook: builder.mutation({
            query: (newBook) => ({
                url: "/create-book",
                method: "POST",
                body: newBook
            }),
            invalidatesTags: ['Books']
        }),
        addReview: builder.mutation({
            query: ({ id, review, score }) => ({
                url: `/${id}/reviews`,
                method: 'POST',
                body: { review, score }
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Books', id }]
        }),
        importBooks: builder.mutation({
            query: (books) => ({
                url: '/import',
                method: 'POST',
                body: books
            }),
            invalidatesTags: ['Books']
        })
    }),
})

export const {
    useFetchAllBooksQuery,
    useFetchBookByIdQuery,
    useUpdateBookMutation,
    useDeleteBookMutation,
    useAddBookMutation,
    useAddReviewMutation,
    useImportBooksMutation
} = booksApi
export default booksApi
