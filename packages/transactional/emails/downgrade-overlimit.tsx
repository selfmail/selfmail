import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Section,
	Tailwind,
	Text,
} from "@react-email/components";

const OverlimitTemplate = ({
	oldPlan,
	newPlan,
	workspaceName,
	name,
}: {
	oldPlan: string;
	newPlan: string;
	name: string;
	workspaceName: string;
}) => {
	return (
		<Html lang="en" dir="ltr">
			<Head>
				<title>Overlimit for workspace {workspaceName}!</title>
			</Head>
			<Preview>
				Your workspace has exceeded the storage limit for the {newPlan} plan.
				Your old plan had too much data to fit the new plan.
			</Preview>
			<Tailwind>
				<Body className="bg-white py-[20px] font-sans">
					<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white shadow-sm">
						{/* Header Section */}
						<Section className="px-[40px] py-[20px] text-left">
							<Heading className="m-0 font-normal text-lg">Selfmail</Heading>
							<Heading className="m-0 font-medium text-2xl">
								Overlimit Notice
							</Heading>
						</Section>

						{/* Main Content */}
						<Section className="px-[40px] pb-[40px] text-left">
							<Text className="mb-2 text-[18px] text-black leading-[26px]">
								Hi {name || "there"},
							</Text>
							<Text className="m-0 mb-[40px] text-[18px] text-black leading-[26px]">
								After you've downgraded from "{oldPlan}" to "{newPlan}" for your
								workspace "{workspaceName}", we noticed that your current data
								usage exceeds the storage limit of the new plan. As a result,
								your workspace has been marked as overlimit. Please take action
								to reduce your data usage to comply with the new plan's limits.
								If you do not reduce your data usage within 7 days, your
								workspace will be restricted from accepting new data. To resolve
								this, consider upgrading your plan or deleting unnecessary data.
							</Text>

							<Text className="m-0 mb-[16px] text-[12px] text-gray-600 leading-[18px]">
								Action is required – please reduce your data usage or upgrade
								your plan to avoid restrictions.
							</Text>
						</Section>

						{/* Footer */}
						<Section className="rounded-xl border-t bg-gray-100 px-[40px] py-[24px] text-center">
							<Text className="m-0 mb-[8px] text-[12px] text-gray-500">
								© 2025 Selfmail. All rights reserved.
							</Text>
							<Text className="m-0 mb-[8px] text-[12px] text-gray-500">
								123 Business Street, Suite 100, City, State 12345
							</Text>
							<Text className="m-0 text-[12px] text-gray-500">
								<a
									href="https://selfmail.app/privacy"
									className="ml-[8px] text-gray-500 underline"
								>
									Privacy Policy
								</a>
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

OverlimitTemplate.PreviewProps = {
	oldPlan: "pro",
	newPlan: "free",
	workspaceName: "My Workspace",
	name: "Henri",
};

export default OverlimitTemplate;
