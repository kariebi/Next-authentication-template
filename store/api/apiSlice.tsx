"use client"

import { BaseQueryApi, FetchArgs, createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setAccessToken } from '@/tools/auth/authSlice'


const baseQuery = fetchBaseQuery({
    baseUrl: `/api`,
    credentials: 'include',
    prepareHeaders: (headers: Headers, { getState }: { getState: () => any }) => {
        const token = getState().auth.accessToken
        // console.log(token)
        if (token) {
            headers.set("Authorization", `Bearer ${token}`)
        }
        return headers
    }
})

const baseQueryWithReauth = async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: {}) => {
    // console.log(args) // request url, method, body
    // console.log(api) // signal, dispatch, getState()
    // console.log(extraOptions) //custom like {shout: true}

    let result = await baseQuery(args, api, extraOptions)

    // If you want, handle other status codes, too
    if (result?.error?.status === 403) {
        console.log('sending refresh token')

        // send refresh token to get new access token 
        const refreshResult:any = await baseQuery('/auth/refresh', api, extraOptions)

        if (refreshResult?.data) {
            console.log(refreshResult?.data)
            // store the new token 
            api.dispatch(setAccessToken({...refreshResult.data}))

            // retry original query with new access token
            result = await baseQuery(args, api, extraOptions)
        } else {

            if (refreshResult?.error?.status === 403) {
                (refreshResult.error.data as { message: string }).message = "Your login has expired.";
            }
            return refreshResult
        }
    }

    return result
}

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ["User"],
    endpoints: (builder) => ({
        // Placeholder endpoint
        getUserById: builder.query<{}, string>({
            query: () => "",
        }),
    }),
});