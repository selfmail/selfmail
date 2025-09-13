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

const DowngradeTemplate = ({
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
				<title>Billing Change Notice for workspace {workspaceName}!</title>
			</Head>
			<Preview>You have downgraded your plan to {newPlan}.</Preview>
			<Tailwind>
				<Body className="bg-white py-[20px] font-sans">
					<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white shadow-sm">
						{/* Header Section */}
						<Section className="px-[40px] py-[20px] text-left">
							<Heading className="m-0 font-normal text-lg">Selfmail</Heading>
							<Heading className="m-0 font-medium text-2xl">
								Billing Change Notice
							</Heading>
						</Section>

						{/* Main Content */}
						<Section className="px-[40px] pb-[40px] text-left">
							<Text className="mb-2 text-[18px] text-black leading-[26px]">
								Hi {name || "there"},
							</Text>
							<Text className="m-0 mb-[40px] text-[18px] text-black leading-[26px]">
								Thanks for using selfmail! We have successfully changed your
								plan to "{newPlan}" for your workspace "{workspaceName}". If you
								have any questions or need assistance, feel free to reach out to
								our support team. Your old plan was "{oldPlan}".
							</Text>

							<Text className="m-0 mb-[16px] text-[12px] text-gray-600 leading-[18px]">
								No action is required for now. If you have exceed the limit of
								the plan, we'll notice you in a different email and in the
								dashboard.
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

DowngradeTemplate.PreviewProps = {
	oldPlan: "pro",
	newPlan: "free",
	workspaceName: "My Workspace",
	name: "Henri",
};

export default DowngradeTemplate;
