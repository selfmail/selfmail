import Link from "next/link";
import {Button} from "ui"
export default function Header() {
  return (
    <header className="mx-5 h-10 text-black md:w-[500px] lg:w-[600px] flex items-center justify-between"> 
      <Link href="/"><h2 className="font-medium">selfmail</h2></Link>
      <nav className="hidden lg:flex space-x-2">
        <Link href="/features">
          Features
        </Link>
        <Link href={"/pricing"}>
          Pricing
        </Link>
        <Link href={process.env.NODE_ENV === "development"? "http://localhost:4000/register": ""}>
          <Button>
            Register
          </Button>
        </Link>
      </nav>
    </header>
  )
}