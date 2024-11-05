"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import React from "react";
import { Toaster } from "sonner";

const queryClient = new QueryClient()

export default function Providers({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
            <QueryClientProvider client={queryClient}>
                {children}
                <Toaster />
            </QueryClientProvider>
        </ThemeProvider>
    )
}