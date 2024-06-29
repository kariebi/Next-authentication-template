"use client"
import { Toaster } from "react-hot-toast"

export const ToasterProvider = () => {
    return (
        <Toaster
            position="top-center"
            toastOptions={{
                duration: 2000,
                style:{
                    backgroundColor:'#2563EB',
                    color:'#fff'
                }
            }}
        />
    )
}