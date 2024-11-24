import { cn } from "@/lib/cn"

export default async function OverviewPage() {
    return (
        <div className="grid  grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ">
            <Component className="cols-1">
                <h2>New customers</h2>
                <p>324 <span className="text-sm">count</span></p>
            </Component>
            <Component className="cols-1">
                <h2>Success rate</h2>
                <p>98.7 <span className="text-sm">%</span></p>
            </Component>
            <Component className="cols-1">
                <h2>Failing rate</h2>
                <p>324 <span className="text-sm">count</span></p>
            </Component>
            <Component className="cols-1">
                <h2>Total transactions</h2>
                <p>192 <span className="text-sm">count</span></p>
            </Component>
            <Component className="col-span-2">
                <h2>Revenue</h2>
                <p>$15,568</p>
                <p className="text-sm text-red-500">2.34% vs. last week</p>
                <div className="flex space-x-4 mt-4">
                    <button className={`px-4 py-2 rounded `}>This week</button>
                    <button className={`px-4 py-2 rounded`}>Last week</button>
                </div>
            </Component>
            <Component className="col-span-2">
                <h2>Revenue</h2>
                <p>$15,568</p>
                <p className="text-sm text-red-500">2.34% vs. last week</p>
                <div className="flex space-x-4 mt-4">
                    <button className={`px-4 py-2 rounded `}>This week</button>
                    <button className={`px-4 py-2 rounded`}>Last week</button>
                </div>
            </Component>
            <Component className="col-span-4">
                <h2>New Members</h2>
            </Component>
        </div>
    )
}

const Component = ({ children, ...props }: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => {
    return (
        <div {...props} className={cn("p-4 flex flex-col gap-2 border border-border", props.className)}>
            {children}
        </div>
    )
}