import { SearchIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { cn } from "#/lib/utils";
import { m } from "#/paraglide/messages";
import type { Email } from "../dashboard/types";

type BottomBarProps = {
	emails: Email[];
	onSelectEmail: (emailId: string) => void;
};

export default function BottomBar({ emails, onSelectEmail }: BottomBarProps) {
	const [focused, setFocused] = useState(false);
	const [query, setQuery] = useState("");

	const results = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		if (!normalizedQuery) {
			return [];
		}

		return emails
			.filter((email) =>
				[email.from, email.subject, email.snippet]
					.filter(Boolean)
					.some((value) => value.toLowerCase().includes(normalizedQuery)),
			)
			.slice(0, 6);
	}, [emails, query]);

	return (
		<motion.div
			layout
			className="fixed bottom-3 left-1/2 z-50 -translate-x-1/2"
		>
			<motion.div
				layout
				tabIndex={-1}
				onFocus={() => setFocused(true)}
				onBlur={(event) => {
					if (!event.currentTarget.contains(event.relatedTarget)) {
						setFocused(false);
					}
				}}
				transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
				className={cn(
					"overflow-hidden rounded-2xl bg-white/60 shadow-lg shadow-black/5 ring-1 ring-inset ring-white/40 backdrop-blur-xl dark:bg-white/10 dark:ring-white/10",
					focused ? "w-[min(26rem,calc(100vw-2rem))]" : "w-64",
				)}
			>
				<AnimatePresence>
					{focused && (
						<motion.ul
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.2, ease: "easeOut" }}
							className="border-b border-black/5 dark:border-white/10"
							role="listbox"
						>
							{results.length > 0 ? (
								results.map((email) => (
									<li key={email.id}>
										<button
											aria-label={email.from}
											role="option"
											className="flex w-full cursor-pointer items-center gap-3 px-3.5 py-2.5 text-left transition-colors duration-150 ease-out hover:bg-accent/70 focus-visible:bg-accent/70 focus-visible:outline-none"
											onMouseDown={(event) => event.preventDefault()}
											onClick={() => onSelectEmail(email.id)}
											type="button"
										>
											<div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
												<span className="font-medium text-muted-foreground text-xs">
													{email.initial}
												</span>
											</div>
											<div className="min-w-0 flex-1">
												<div className="flex items-baseline justify-between gap-2">
													<p className="truncate text-sm font-medium">
														{email.from}
													</p>
													<span className="shrink-0 text-muted-foreground text-xs">
														{email.date}
													</span>
												</div>
												<p className="truncate text-muted-foreground text-xs">
													{email.subject}
												</p>
											</div>
										</button>
									</li>
								))
							) : (
								<li className="px-3.5 py-3 text-sm text-muted-foreground">
									{m["dashboard.search.empty"]()}
								</li>
							)}
						</motion.ul>
					)}
				</AnimatePresence>
				<label className="relative flex w-full cursor-text items-center gap-2.5 px-3.5 py-3">
					<SearchIcon className="size-4 shrink-0 text-muted-foreground" />
					<input
						className="w-full min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						onFocus={() => setFocused(true)}
						placeholder={m["dashboard.search.placeholder"]()}
						type="search"
					/>
				</label>
			</motion.div>
		</motion.div>
	);
}
