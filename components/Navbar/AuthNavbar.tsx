"use client"

import React from 'react'

const AuthNavbar = () => {

    return (
        <div className='h-16 px-4 top-0 left-0 fixed w-full flex items-center border-b text-blue-600 justify-start'>
            <h1
                onClick={() => {
                    window.location.href = '/'
                }}
                className='font-semibold text-xl hover:cursor-pointer'
            >NextJS-Template</h1>
        </div>
    )
}

export default AuthNavbar