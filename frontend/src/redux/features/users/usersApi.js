import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import getBaseUrl from '../../../utils/baseURL';

const usersApi = createApi({
    reducerPath: 'usersApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${getBaseUrl()}/api/users`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Users'],
    endpoints: (builder) => ({
        fetchAllUsers: builder.query({
            query: () => '/',
            providesTags: ['Users'],
        }),
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Users'],
        }),
        sendVouchers: builder.mutation({
            query: (emails) => ({
                url: '/send-vouchers',
                method: 'POST',
                body: { emails },
            }),
        }),
    }),
});

export const { useFetchAllUsersQuery, useDeleteUserMutation, useSendVouchersMutation } = usersApi;
export default usersApi;
