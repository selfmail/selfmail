import OptimizedVideo from "../../components/OptimizedVideo";

export default function Home() {
	return (
		<div className="flex min-h-screen w-full flex-col bg-white px-5 text-black lg:flex-row">
			<div className="flex w-full flex-col space-y-5 py-5 lg:w-[30%] lg:px-5">
				<a className="underline" href="/">
					Selfmail
				</a>
				<p>
					Selfmail is a business-first email provider, engineered to enhance
					productivity and collaboration. Currently in development, launching
					soon. The platform is completely open-source.
				</p>
				<a
					className="underline"
					href="http://github.com/selfmail/selfmail"
					target="_blank"
					rel="noopener noreferrer"
				>
					GitHub
				</a>
				<a className="underline" href="/roadmap">
					Roadmap
				</a>
			</div>
			<div className="flex flex-1 flex-col space-y-5 p-5">
				<OptimizedVideo
					webmSrc="https://cdn.selfmail.app/result.webm"
					mp4Src="https://cdn.selfmail.app/result.mp4"
					poster="https://cdn.selfmail.app/result-poster.jpg"
				/>
				<p>
					Selfmail is designed for businesses, projects and ideas. We don't
					believe in a clumpy ui, bad features, and AI for just summarizing an
					email. We believe in a clean, fast, and efficient email, together with
					your team, and without a learning curve. Selfmail is currently still
					in development, but with the plan to launch in october 2025.
				</p>
			</div>
		</div>
	);
}
