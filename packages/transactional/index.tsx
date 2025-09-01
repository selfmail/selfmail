import { pretty, render } from "@react-email/render";
import VerifyEmailTemplate from "./emails/verify-email";

export async function generateVerifyEmailTemplate({
	name,
	token,
}: {
	name: string;
	token: string;
}) {
	return await pretty(
		await render(<VerifyEmailTemplate name={name} token={token} />),
	);
}
