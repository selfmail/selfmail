import BackButton from "./back";
import LoginForm from "./form";
import LoginImage from "./image";

export default function Login() {
    return (
        <div className="bg-[#e8e8e8] min-h-screen flex justify-between">
            <BackButton />
            <div className="lg:w-[50%] flex items-center justify-center">
                <LoginForm />
            </div>
            <LoginImage />
        </div>
    )
}