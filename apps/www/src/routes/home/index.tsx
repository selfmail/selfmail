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
					soon. Selfmail is completely open-source.
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
			<div className="flex flex-1 flex-col space-y-5 py-5 lg:p-5">
				<OptimizedVideo
					webmSrc="https://cdn.selfmail.app/result.webm"
					mp4Src="https://cdn.selfmail.app/result.mp4"
					poster="https://cdn.selfmail.app/result-poster.jpg"
				/>
				<p>
					Selfmail is a project for now more than a year now. It started as a
					simple draft in an ipad, and is now almost ready for the first beta.
					It wasn't easy to figure out, how to create an SMTP Server, how
					relaying an email works, what features are needed and how to implement
					them. I'm trying my best to make selfmail a reality. Probably
					launching in october.
				</p>
			</div>
		</div>
	);
}
