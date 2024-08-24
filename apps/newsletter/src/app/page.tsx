import Header from "@/components/header";
import Image from "next/image";
import Link from "next/link";
export default function HomePage() {
    return (
        <div className="w-full mx-2 sm:mx-5 md:w-[500px] md:mx-0 lg:w-[650px] min-h-screen">
            <Header />
            <div className="min-h-screen">
                <div className="mt-[35vh]">
                    <h1 className="text-3xl font-medium">The selfmail newsletter tool</h1>
                    <p className="text-accent w-[70%]">Professional tool to create and maintain your newsletters. Completely open source and self hostable.</p>
                </div>
            </div>
            <div className="flex justify-between">
                {/* Logos for social proof */}
            </div>
            <div>
                <hr />
                <h2>Send to your audience, no matter where they are</h2>
                <p>Send your newsletter to your audience, no matter where they are. Whether it's a newsletter, a blog post, or a tweet, you can send it to your audience in a single click.</p>
                <Image src="/images/send-to-audience.png" alt="Send to audience" width={500} height={300} />
            </div>
            <div>
                <hr />
                <h2>Work with your audience & team together</h2>
                <p>With the help of our team, you can create a newsletter that is easy to use and understand. Our team will help you create a newsletter that is easy to use and understand, so you can focus on creating content that resonates with your audience.</p>
                <Image src="/images/work-with-your-audience.png" alt="Work with your audience" width={500} height={300} />
            </div>
            <div>
                <hr />
                <h2>Feedback matters the most</h2>
                <p>We integrated a feedback system that allows you to give feedback on your newsletter. This feedback will help us improve the newsletter and make it even better for your audience.</p>
                <Image src="/images/feedback-matters-the-most.png" alt="Feedback matters the most" width={500} height={300} />
            </div>
            <div className="min-h-screen">
                <h2>What are you waiting for?</h2>
                <p>Create your newsletter and start sending it to your audience. It's easy and free.</p>
                <Link href="/create">Create your newsletter</Link>
            </div>
            <footer className="flex justify-between">
                <div className="flex flex-col">
                    <h3>Made by <Link href="https://selfmail.app">selfmail</Link></h3>
                    <p>
                        This product is entirely free and open source. You can find the source code on <Link href="https://github.com/selfmail-app/selfmail">GitHub</Link>.
                    </p>
                </div>
                <div className="flex flex-col">
                    <Link href="https://www.selfmail.app/privacy-policy">Privacy Policy</Link>
                    <Link href="https://www.selfmail.app/tos">Terms of Service</Link>
                    <Link href="https://github.com/selfmail/selfmail">GitHub</Link>
                </div>
            </footer>
        </div>
    )
}