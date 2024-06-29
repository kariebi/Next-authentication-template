"use client";

import { useState, useEffect } from "react";

const usePersist = () => {
    const [persist, setPersist] = useState(() => {
        if (typeof window !== "undefined") {
            return JSON.parse(localStorage.getItem("persist") || "null") || true;
        } else {
            return true;
        }
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("persist", JSON.stringify(persist));
        }
    }, [persist]);

    return [persist, setPersist];
};
export default usePersist;
