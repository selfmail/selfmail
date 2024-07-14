import RegisterForm from "./form";
import RegisterImage from "./image";

export default function Register() {
    return (
        <div className="bg-[#e8e8e8] min-h-screen flex justify-between">
            <div className="lg:w-[50%] flex items-center justify-center">
                <RegisterForm />
            </div>
            <RegisterImage />
        </div>
    )
}