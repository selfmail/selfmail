import { Card, CardContent } from "@/components/ui/card";
import { APITester } from "./APITester";
import "./index.css";

import logo from "./logo.svg";
import reactLogo from "./react.svg";

export function App() {
	return (
		<div className="container relative z-10 mx-auto p-8 text-center">
			<div className="mb-8 flex items-center justify-center gap-8">
				<img
					src={logo}
					alt="Bun Logo"
					className="h-36 scale-120 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]"
				/>
				<img
					src={reactLogo}
					alt="React Logo"
					className="h-36 p-6 transition-all duration-300 [animation:spin_20s_linear_infinite] hover:drop-shadow-[0_0_2em_#61dafbaa]"
				/>
			</div>

			<Card className="border-muted bg-card/50 backdrop-blur-sm">
				<CardContent className="pt-6">
					<h1 className="my-4 font-bold text-5xl leading-tight">Bun + React</h1>
					<p>
						Edit{" "}
						<code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
							src/App.tsx
						</code>{" "}
						and save to test HMR
					</p>
					<APITester />
				</CardContent>
			</Card>
		</div>
	);
}

export default App;
