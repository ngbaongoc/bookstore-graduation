import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import getBaseUrl from '../../../utils/baseURL';

export const intelligenceApi = createApi({
    reducerPath: 'intelligenceApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${getBaseUrl()}/api/admin`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Intelligence'],
    endpoints: (builder) => ({
        getAdvancedIntelligence: builder.query({
            query: ({ startDate, endDate } = {}) => {
                let url = `/intelligence`;
                if (startDate || endDate) {
                    url += `?`;
                    if (startDate) url += `startDate=${startDate}&`;
                    if (endDate) url += `endDate=${endDate}`;
                }
                return url;
            },
            providesTags: ['Intelligence'],
        }),
    }),
});

export const { useGetAdvancedIntelligenceQuery } = intelligenceApi;
