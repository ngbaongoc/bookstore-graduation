import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import getBaseUrl from '../../../utils/baseURL';

export const statsApi = createApi({
    reducerPath: 'statsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${getBaseUrl()}/api/stats`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Stats'],
    endpoints: (builder) => ({
        getDashboardStats: builder.query({
            query: (range) => `/?range=${range}`,
            providesTags: ['Stats'],
        }),
    }),
});

export const { useGetDashboardStatsQuery } = statsApi;
