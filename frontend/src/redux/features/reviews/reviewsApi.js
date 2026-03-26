import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import getBaseUrl from '../../../utils/baseURL';

export const reviewsApi = createApi({
    reducerPath: 'reviewsApi',
    baseQuery: fetchBaseQuery({ baseUrl: `${getBaseUrl()}/api/reviews` }),
    tagTypes: ['Reviews'],
    endpoints: (builder) => ({
        postReview: builder.mutation({
            query: (newReview) => ({
                url: '/post-review',
                method: 'POST',
                body: newReview,
            }),
            invalidatesTags: ['Reviews'], // Invalidate cache on submit to trigger refetch
        }),
        getReviewsByBookId: builder.query({
            query: (bookId) => `/book/${bookId}`,
            providesTags: ['Reviews'], // Provide cache tag
        }),
    }),
});

export const { usePostReviewMutation, useGetReviewsByBookIdQuery } = reviewsApi;
