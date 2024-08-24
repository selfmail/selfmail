export default function PricingPage() {
    return (
        <div className="w-full mx-2 sm:mx-5 md:w-[500px] md:mx-0 lg:w-[650px] min-h-screen">
            <div className="mt-[35vh]">
                <h1 className="text-3xl font-medium">Pricing</h1>
                <p>Our pricing for the selfmail newsletter tool is different to the selfmail pricing. </p>
            </div>

            <div className="flex flex-col space-y-4">
                <div>
                    <h2 className="text-2xl font-medium">Selfhosted</h2>
                    <p>Selfhosted is the easiest way to use selfmail. You can selfhost the selfmail newsletter tool on your own server. This is the best option if you want to have full control over your newsletter.</p>
                    <p>Pricing for selfhosted is $0/month.</p>
                </div>
                <div>
                    <h2 className="text-2xl font-medium">Cloud</h2>
                    <p>Cloud is the best option if you want to have a reliable and scalable solution. You can use the selfmail newsletter tool on our cloud servers. This is the best option if you want to have a reliable and scalable solution.</p>
                    <p>Pricing for cloud is $9/month.</p>
                </div>
            </div>
        </div>
    )
}