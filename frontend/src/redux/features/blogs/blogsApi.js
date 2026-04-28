import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import getBaseUrl from '../../../utils/baseURL';

export const blogsApi = createApi({
    reducerPath: 'blogsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${getBaseUrl()}/api/blogs`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        }
    }),
    tagTypes: ['Blogs'],
    endpoints: (builder) => ({
        fetchAllBlogs: builder.query({
            query: () => '/',
            providesTags: ['Blogs'],
        }),
        fetchBlogById: builder.query({
            query: (id) => `/${id}`,
            providesTags: ['Blogs'],
        }),
        addBlog: builder.mutation({
            query: (newBlog) => ({
                url: '/create-blog',
                method: 'POST',
                body: newBlog,
            }),
            invalidatesTags: ['Blogs'],
        }),
        deleteBlog: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Blogs'],
        }),
    }),
});

export const {
    useFetchAllBlogsQuery,
    useFetchBlogByIdQuery,
    useAddBlogMutation,
    useDeleteBlogMutation,
} = blogsApi;
