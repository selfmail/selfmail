import Back from "./back";

export default async function NotFound() {
    return <div className="flex items-center justify-center min-h-screen w-full">
        <Back />
        <h2 className="text-center text-2xl font-bold text-text-primary">404 Not Found</h2>
    </div>
}