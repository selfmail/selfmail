import Header from "@/components/header";
import OptimizedVideo from "@/components/OptimizedVideo";

export default function Home() {
	return (
		<div className="flex w-full flex-col">
			<Header />
			<div className="flex w-full flex-col items-center justify-center">
				<h1 className="mt-40 font-bold text-4xl">Mail fixed for Business</h1>
			</div>
			<div>
				<h2 className="font-bold text-3xl">Finally listen to your Customers</h2>
			</div>
		</div>
	);
}
