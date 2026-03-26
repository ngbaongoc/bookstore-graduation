import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import getBaseUrl from '../../../utils/baseURL'

// We define an inventory API to interact with our new endpoint
export const inventoryApi = createApi({
    reducerPath: 'inventoryApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: `${getBaseUrl()}/api/inventory`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        }
    }),
    tagTypes: ['InventoryLogs', 'Books'],
    endpoints: (builder) => ({
        getInventoryLogs: builder.query({
            query: () => '/logs',
            providesTags: ['InventoryLogs']
        }),
        adjustStock: builder.mutation({
            query: ({ id, quantityToAdd }) => ({
                url: `/adjust/${id}`,
                method: 'PUT',
                body: { quantityToAdd }
            }),
            invalidatesTags: ['InventoryLogs', 'Books']
        }),
        confirm3PLPickup: builder.mutation({
            query: ({ id, quantityPickedUp }) => ({
                url: `/handover/${id}`,
                method: 'POST',
                body: { quantityPickedUp }
            }),
            invalidatesTags: ['InventoryLogs', 'Books']
        }),
        packOrder: builder.mutation({
            query: (id) => ({
                url: `/pack/${id}`,
                method: 'POST',
            }),
            invalidatesTags: ['InventoryLogs']
        })
    }),
})

export const {
    useGetInventoryLogsQuery,
    useAdjustStockMutation,
    useConfirm3PLPickupMutation,
    usePackOrderMutation
} = inventoryApi

export default inventoryApi
