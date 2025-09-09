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

const EmailVerification = ({
	name,
	token,
}: {
	name: string;
	token: number;
}) => {
	return (
		<Html lang="en" dir="ltr">
			<Head>
				<title>Verify your email for Selfmail!</title>
			</Head>
			<Preview>
				Please verify your email for Selfmail to proceed with your account.
			</Preview>
			<Tailwind>
				<Body className="bg-white py-[20px] font-sans">
					<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white shadow-sm">
						{/* Header Section */}
						<Section className="px-[40px] py-[20px] text-left">
							<Heading className="m-0 font-normal text-lg">Selfmail</Heading>
							<Heading className="m-0 font-medium text-2xl">
								Verify your email!
							</Heading>
						</Section>

						{/* Main Content */}
						<Section className="px-[40px] pb-[40px] text-left">
							<Text className="mb-2 text-[18px] text-black leading-[26px]">
								Hi {name || "there"},
							</Text>
							<Text className="m-0 mb-[40px] text-[18px] text-black leading-[26px]">
								Thanks for signing up! To ensure the security of your account
								and enable all features, please verify your email address by
								copying the code below and pasting it to the verification page.
							</Text>

							{/* Verification Button */}
							<Section className="mb-[40px] rounded-lg bg-black text-left">
								<Text className="text-center font-mono text-[18px] text-white leading-[26px]">
									{token}
								</Text>
							</Section>

							<Text className="m-0 mb-[16px] text-[12px] text-gray-600 leading-[18px]">
								If you have closed the tab, you can copy the link below. If you
								encounter any issues on the path, please contact us at
								contact@selfmail.app!
							</Text>
							<Text className="m-0 mb-[40px] break-all text-[12px] text-gray-500 leading-[18px]">
								{"https://dashboard.selfmail.app/auth/verify"}
							</Text>

							<Text className="m-0 text-[12px] text-gray-600 leading-[18px]">
								The verification code will expire in 24 hours for security
								purposes. If you didn't create an account, you can safely ignore
								this email.
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

EmailVerification.PreviewProps = {
	name: "Henri",
	token: 111111,
};

export default EmailVerification;
