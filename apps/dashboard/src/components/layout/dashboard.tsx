import DashboardHeader from "../dashboard/header";
import DashboardNavigation from "../dashboard/navigation";

export default function DashboardLayout({
	children,
	workspaceId,
	title,
	showNav = true,
}: {
	children: React.ReactNode;
	workspaceId: string;
	title?: string;
	showNav?: boolean;
}) {
	return (
		<div className="flex min-h-screen flex-col bg-white text-black">
			<DashboardHeader workspaceId={workspaceId} />
			{showNav && <DashboardNavigation workspaceId={workspaceId} />}

			{/* Page container */}
			<div className="mx-auto w-full px-4 sm:px-6 lg:px-26 xl:px-32">
				{/* Page header */}
				{title && (
					<div className="flex items-center justify-between py-6">
						<div>
							<h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
						</div>
					</div>
				)}

				{children}
			</div>

			{/* Bottom spacing */}
			<div className="h-8" />
		</div>
	);
}
