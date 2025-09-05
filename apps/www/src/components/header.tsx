import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import useIsMobile from "@/hooks/useIsMobile";

export default function Header() {
	const [show, setShow] = useState(false);

	const isMobile = useIsMobile();

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: <header> is used to open the dropdown menu on hover
		<header
			onMouseEnter={() => !isMobile && setShow(true)}
			onMouseLeave={() => !isMobile && setShow(false)}
			className="absolute top-0 right-0 left-0 border-b border-b-neutral-100 bg-white px-5 py-3"
		>
			<div className="z-50 mx-auto max-w-7xl">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<div className="flex items-center">
						<a href="/" className="logo text-2xl text-black no-underline">
							Selfmail®
						</a>
					</div>

					{/* Navigation Links - Center */}
					<nav className="hidden items-center space-x-8 md:flex">
						<a
							href="/features"
							className="z-60 rounded-full bg-neutral-100 px-4 py-0.5 text-neutral-800"
						>
							Features
						</a>
						<a
							href="/company"
							className="rounded-full bg-neutral-100 px-4 py-0.5 text-neutral-800"
						>
							Company
						</a>
						<a
							href="/pricing"
							onMouseEnter={() => !isMobile && setShow(false)}
							onMouseLeave={() => !isMobile && setShow(true)}
							className="rounded-full bg-neutral-100 px-4 py-0.5 text-neutral-800"
						>
							Pricing
						</a>
						<a
							href="/updates"
							onMouseEnter={() => !isMobile && setShow(false)}
							onMouseLeave={() => !isMobile && setShow(true)}
							className="rounded-full bg-neutral-100 px-4 py-0.5 text-neutral-800"
						>
							Updates
						</a>
					</nav>

					{/* Get Started Button */}
					<div className="flex items-center">
						<a
							href="/get-started"
							className="rounded-full border-x-2 border-x-neutral-400 bg-black px-6 py-2 text-white no-underline transition hover:border-x-neutral-500 hover:bg-neutral-800"
						>
							Get Started
						</a>
					</div>
				</div>
			</div>
			<AnimatePresence>
				{show && (
					<motion.div
						initial={{
							height: 0,
							opacity: 0,
						}}
						animate={{
							height: "auto",
							opacity: 1,
						}}
						exit={{
							height: 0,
							opacity: 0,
						}}
						transition={{
							duration: 0.3,
							ease: "easeInOut",
						}}
						className="overflow-hidden"
					>
						<motion.div
							initial={{ y: -20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: -20, opacity: 0 }}
							transition={{
								delay: 0.1,
								duration: 0.2,
								ease: "easeOut",
							}}
							className="mx-auto max-w-7xl px-5 pt-4 pb-8"
						>
							<div className="grid grid-cols-4 gap-8">
								{/* Features Column */}
								<div className="flex flex-col space-y-3">
									<motion.h3
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.15, duration: 0.2 }}
										className="font-semibold text-neutral-800 text-sm"
									>
										Features
									</motion.h3>
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.2, duration: 0.2 }}
										className="flex flex-col space-y-2"
									>
										<a
											href="/email-hosting"
											className="text-neutral-600 text-sm transition-colors hover:text-black"
										>
											Email Hosting
										</a>
										<a
											href="/security"
											className="text-neutral-600 text-sm transition-colors hover:text-black"
										>
											Security & Privacy
										</a>
										<a
											href="/analytics"
											className="text-neutral-600 text-sm transition-colors hover:text-black"
										>
											Analytics
										</a>
										<a
											href="/api"
											className="text-neutral-600 text-sm transition-colors hover:text-black"
										>
											Developer API
										</a>
									</motion.div>
								</div>

								{/* Company Column */}
								<div className="flex flex-col space-y-3">
									<motion.h3
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.25, duration: 0.2 }}
										className="font-semibold text-neutral-800 text-sm"
									>
										Company
									</motion.h3>
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.3, duration: 0.2 }}
										className="flex flex-col space-y-2"
									>
										<a
											href="/about"
											className="text-neutral-600 text-sm transition-colors hover:text-black"
										>
											About Us
										</a>
										<a
											href="/careers"
											className="text-neutral-600 text-sm transition-colors hover:text-black"
										>
											Careers
										</a>
										<a
											href="/blog"
											className="text-neutral-600 text-sm transition-colors hover:text-black"
										>
											Blog
										</a>
										<a
											href="/contact"
											className="text-neutral-600 text-sm transition-colors hover:text-black"
										>
											Contact
										</a>
									</motion.div>
								</div>

								{/* Support Column */}
								<div className="flex flex-col space-y-3">
									<motion.h3
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.35, duration: 0.2 }}
										className="font-semibold text-neutral-800 text-sm"
									>
										Support
									</motion.h3>
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.4, duration: 0.2 }}
										className="flex flex-col space-y-2"
									>
										<a
											href="/help"
											className="text-neutral-600 text-sm transition-colors hover:text-black"
										>
											Help Center
										</a>
										<a
											href="/documentation"
											className="text-neutral-600 text-sm transition-colors hover:text-black"
										>
											Documentation
										</a>
										<a
											href="/status"
											className="text-neutral-600 text-sm transition-colors hover:text-black"
										>
											Service Status
										</a>
										<a
											href="/community"
											className="text-neutral-600 text-sm transition-colors hover:text-black"
										>
											Community
										</a>
									</motion.div>
								</div>

								{/* Quick Start Column */}
								<div className="flex flex-col space-y-3">
									<motion.h3
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.45, duration: 0.2 }}
										className="font-semibold text-neutral-800 text-sm"
									>
										Quick Start
									</motion.h3>
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.5, duration: 0.2 }}
										className="flex flex-col space-y-2"
									>
										<a
											href="/setup"
											className="text-neutral-600 text-sm transition-colors hover:text-black"
										>
											Setup Guide
										</a>
										<a
											href="/tutorials"
											className="text-neutral-600 text-sm transition-colors hover:text-black"
										>
											Tutorials
										</a>
										<a
											href="/examples"
											className="text-neutral-600 text-sm transition-colors hover:text-black"
										>
											Examples
										</a>
										<a
											href="/templates"
											className="text-neutral-600 text-sm transition-colors hover:text-black"
										>
											Templates
										</a>
									</motion.div>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</header>
	);
}
