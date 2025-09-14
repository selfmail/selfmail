import { pretty, render, toPlainText } from "@react-email/render";
import DowngradeTemplate from "./emails/billing-downgrade";
import UpgradeTemplate from "./emails/billing-upgrade";
import OverlimitTemplate from "./emails/downgrade-overlimit";
import VerifyEmailTemplate from "./emails/verify-email";

export async function generateVerifyEmailTemplate({
	name,
	token,
}: {
	name: string;
	token: number;
}) {
	const html = await pretty(
		await render(<VerifyEmailTemplate name={name} token={token} />),
	);
	return {
		html,
		text: toPlainText(html),
	};
}

export async function generateBillingDowngradeTemplate({
	oldPlan,
	newPlan,
	workspaceName,
	name,
}: {
	oldPlan: string;
	newPlan: string;
	name: string;
	workspaceName: string;
}) {
	const html = await pretty(
		await render(
			<DowngradeTemplate
				oldPlan={oldPlan}
				newPlan={newPlan}
				workspaceName={workspaceName}
				name={name}
			/>,
		),
	);
	return {
		html,
		text: toPlainText(html),
	};
}
export async function generateOverlimitTemplate({
	oldPlan,
	newPlan,
	workspaceName,
	name,
}: {
	oldPlan: string;
	newPlan: string;
	name: string;
	workspaceName: string;
}) {
	const html = await pretty(
		await render(
			<OverlimitTemplate
				oldPlan={oldPlan}
				newPlan={newPlan}
				workspaceName={workspaceName}
				name={name}
			/>,
		),
	);
	return {
		html,
		text: toPlainText(html),
	};
}

export async function generateBillingUpgradeTemplate({
	oldPlan,
	newPlan,
	workspaceName,
	name,
}: {
	oldPlan: string;
	newPlan: string;
	name: string;
	workspaceName: string;
}) {
	const html = await pretty(
		await render(
			<UpgradeTemplate
				oldPlan={oldPlan}
				newPlan={newPlan}
				workspaceName={workspaceName}
				name={name}
			/>,
		),
	);
	return {
		html,
		text: toPlainText(html),
	};
}
