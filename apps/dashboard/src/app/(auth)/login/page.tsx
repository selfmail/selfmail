import BackButton from "./back";
import LoginForm from "./form";
import LoginImage from "./image";

export default function Login() {
  return (
    <div className="flex min-h-screen justify-between bg-[#e8e8e8]">
      <BackButton />
      <div className="flex items-center justify-center lg:w-[50%]">
        <LoginForm />
      </div>
      <LoginImage />
    </div>
  );
}
