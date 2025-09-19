import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import DashboardHeader from "../dashboard/header";
import DashboardNavigation from "../dashboard/navigation";

export default function DashboardLayout({
	children,
	workspaceId,
	title,
	className,
	showNav = true,
	showBackButton = false,
}: {
	children: React.ReactNode;
	className?: string;
	workspaceId: string;
	title?: string;
	showNav?: boolean;
	showBackButton?: boolean;
}) {
	const navigate = useNavigate();
	return (
		<div className="flex min-h-screen flex-col bg-white text-black">
			<DashboardHeader workspaceId={workspaceId} />
			{showNav && <DashboardNavigation workspaceId={workspaceId} />}

			{/* Page container */}
			<div className={`mx-auto w-full px-4 sm:px-6 lg:px-26 xl:px-32 ${className}`}>
				{/* Page header */}
				{title && (
					<div className="flex items-center justify-between py-6">
						<h1 className="flex items-center font-semibold text-2xl tracking-tight">
							{showBackButton && (
								<ChevronLeft
									className="mr-2 inline-block h-6 w-6 cursor-pointer text-neutral-700"
									type="button"
									onClick={() => {
										if (window.history.length > 1) {
											window.history.back();
										} else {
											navigate({
												to: "/workspace/$workspaceId",
												params: {
													workspaceId,
												},
											});
										}
									}}
								/>
							)}
							<span>{title}</span>
						</h1>
					</div>
				)}

				{children}
			</div>

			{/* Bottom spacing */}
			<div className="h-8" />
		</div>
	);
}
