export default function Roadmap() {
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
					href="http://git.new/selfmail"
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
				<div className="flex flex-col space-y-2">
					<h2>
						1. Dashboard <span className="text-green-500">(completed)</span>
					</h2>
					<ul className="list-disc pl-5">
						<li>Authentication</li>
						<li>Workspaces</li>
						<li>Settings (in progress, not important)</li>
						<li>Addresses</li>
					</ul>
				</div>
				<div className="flex flex-col space-y-2">
					<h2>
						2. Api <span className="text-green-500">(completed)</span>
					</h2>
					<ul className="list-disc pl-5">
						<li>Permissions</li>
						<li>Authentication</li>
						<li>Ratelimiting</li>
						<li>Logs & Analytics</li>
						<li>Addresses</li>
						<li>Workspaces</li>
						<li>Email handling</li>
						<li>Custom domains</li>
					</ul>
				</div>
				<div className="flex flex-col space-y-2">
					<h2>
						3. SMTP Server{" "}
						<span className="text-red-500">(not quite completed)</span>
					</h2>
					<ul className="list-disc pl-5">
						<li>Inbound functionality (completed)</li>
						<li>Relay server (completed)</li>
						<li>Spam handling</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
