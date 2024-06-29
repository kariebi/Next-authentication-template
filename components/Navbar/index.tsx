"use client"

import React from 'react'

const Navbar = () => {

  return (
    <div className='h-16 px-2 fixed w-full top-0 left-0 flex items-center justify-between'>
      <h1
        onClick={() => {
          window.location.href = '/'
        }}
        className='font-semibold text-xl hover:cursor-pointer'
      >NextJS-Template</h1>
      <button
        className='py-2 px-3 h-[52px] bg-blue-600 text-white rounded-full'
        type='button'
        onClick={() => window.location.href = '/signup'}>
        Get Started
      </button>
    </div>
  )
}

export default Navbar