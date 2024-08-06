import BackButton from "./back";
import RegisterForm from "./form";
import RegisterImage from "./image";

export default function Register() {
  return (
    <div className="flex min-h-screen justify-between bg-[#e8e8e8]">
      <BackButton />
      <div className="flex items-center justify-center lg:w-[50%]">
        <RegisterForm />
      </div>
      <RegisterImage />
    </div>
  );
}
