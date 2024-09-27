"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"
const queryClient = new QueryClient()
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <NextThemesProvider {...props}>{children}</NextThemesProvider>
        </QueryClientProvider>
    )
}
