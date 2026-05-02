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
        fetchUserByEmail: builder.query({
            query: (email) => `/${email}`,
            providesTags: (result, error, email) => [{ type: 'Users', id: email }],
        }),
        updateUserProfile: builder.mutation({
            query: ({ email, ...updates }) => ({
                url: `/${email}`,
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: (result, error, { email }) => [{ type: 'Users', id: email }, 'Users'],
        }),
    }),
});

export const { 
    useFetchAllUsersQuery, 
    useDeleteUserMutation, 
    useSendVouchersMutation,
    useFetchUserByEmailQuery,
    useUpdateUserProfileMutation
} = usersApi;
export default usersApi;
