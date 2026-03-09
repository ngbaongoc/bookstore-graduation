import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const ordersApi = createApi({
    reducerPath: 'ordersApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5000/api/orders' }),
    tagTypes: ['Orders'],
    endpoints: (builder) => ({
        createOrder: builder.mutation({
            query: (newOrder) => ({
                url: "/",
                method: "POST",
                body: newOrder
            }),
            invalidatesTags: ['Orders']
        })
    }),
})

export const { useCreateOrderMutation } = ordersApi
export default ordersApi
