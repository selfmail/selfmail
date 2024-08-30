import { Body, Button, Head, Html, Tailwind } from "@react-email/components";
import React from "react";
export default function WelcomeEmail() {
    return (
        <Html lang="en" dir="ltr">
            <Head>
                <title>Welcome to the selfmail newsletter</title>
            </Head>
            <Body>
                <Tailwind
                    config={{
                        theme: {
                            extend: {
                                colors: {
                                    brand: "#007291",
                                },
                            },
                        },
                    }}
                >
                    <Button
                        href="https://selfmail.app"
                        className="bg-brand text-white font-bold py-2 px-4 rounded"
                    >
                        Click me
                    </Button>
                </Tailwind>
            </Body>
        </Html>
    );
}