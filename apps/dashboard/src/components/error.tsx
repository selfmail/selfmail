export default function ErrorScreen({ message }: { message: string }) {
	return (
		<div className="flex h-screen flex-col items-center justify-center space-y-4">
			<h1 className="font-bold text-2xl">Error</h1>
			<p className="text-lg">{message}</p>
		</div>
	);
}
