import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import getBaseUrl from '../../../utils/baseURL'

const ordersApi = createApi({
    reducerPath: 'ordersApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: `${getBaseUrl()}/api/orders`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        }
    }),
    tagTypes: ['Orders'],
    endpoints: (builder) => ({
        createOrder: builder.mutation({
            query: (newOrder) => ({
                url: "/",
                method: "POST",
                body: newOrder
            }),
            invalidatesTags: ['Orders']
        }),
        getAllOrders: builder.query({
            query: () => "/",
            providesTags: ['Orders']
        }),
        getOrdersByEmail: builder.query({
            query: (email) => `/email/${email}`,
            providesTags: ['Orders']
        }),
        getOrdersByUserId: builder.query({
            query: (userId) => `/user/${userId}`,
            providesTags: ['Orders']
        }),
        updateOrderStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `/${id}/status`,
                method: 'PATCH',
                body: { status }
            }),
            invalidatesTags: ['Orders']
        }),
        requestCancelOrder: builder.mutation({
            query: ({ id, reason }) => ({
                url: `/${id}/cancel-request`,
                method: 'PATCH',
                body: { reason }
            }),
            invalidatesTags: ['Orders']
        }),
        approveCancelOrder: builder.mutation({
            query: (id) => ({
                url: `/${id}/approve-cancel`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Orders']
        }),
        disapproveCancelOrder: builder.mutation({
            query: (id) => ({
                url: `/${id}/disapprove-cancel`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Orders']
        }),
    }),
})

export const { 
    useCreateOrderMutation, 
    useGetAllOrdersQuery, 
    useGetOrdersByEmailQuery,
    useGetOrdersByUserIdQuery,
    useUpdateOrderStatusMutation,
    useRequestCancelOrderMutation,
    useApproveCancelOrderMutation,
    useDisapproveCancelOrderMutation
} = ordersApi
export default ordersApi
