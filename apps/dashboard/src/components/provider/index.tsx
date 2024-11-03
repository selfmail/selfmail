import React from "react";
import { Toaster } from "sonner";

export default function Providers({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            {children}
            <Toaster />
        </>
    )
}