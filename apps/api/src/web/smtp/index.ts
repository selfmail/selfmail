import Elysia from "elysia";
import { requireWorkspaceMember } from "../authentication";
import { SMTPModule } from "./module";
import { SMTPService } from "./service";

export const smtpCredentials = new Elysia({
	name: "service/credentials",
	prefix: "/credentials",
})
	.use(requireWorkspaceMember)
	.post(
		"/",
		async ({ body, workspace, member }) => {
			return await SMTPService.generateCredentials({
				...body,
				workspaceId: workspace.id,
				memberId: member.id,
			});
		},
		{
			body: SMTPModule.smtpCredentialsBody,
			detail: {
				description: "Generate new SMTP credentials for an address",
				tags: ["SMTP Credentials"],
			},
		},
	)
	.get(
		"/",
		async ({ query, workspace, member }) => {
			return await SMTPService.listCredentials({
				...query,
				workspaceId: workspace.id,
				memberId: member.id,
			});
		},
		{
			query: SMTPModule.credentialsQuery,
			detail: {
				description: "List SMTP credentials with pagination and filtering",
				tags: ["SMTP Credentials"],
			},
		},
	)
	.get(
		"/:credentialsId",
		async ({ params, workspace, member }) => {
			return await SMTPService.getCredentials({
				...params,
				workspaceId: workspace.id,
				memberId: member.id,
			});
		},
		{
			params: SMTPModule.credentialsParams,
			detail: {
				description: "Get a specific SMTP credential by ID",
				tags: ["SMTP Credentials"],
			},
		},
	)
	.put(
		"/:credentialsId",
		async ({ params, body, workspace, member }) => {
			return await SMTPService.updateCredentials({
				...params,
				...body,
				workspaceId: workspace.id,
				memberId: member.id,
			});
		},
		{
			params: SMTPModule.credentialsParams,
			body: SMTPModule.updateSmtpCredentialsBody,
			detail: {
				description: "Update SMTP credentials",
				tags: ["SMTP Credentials"],
			},
		},
	)
	.delete(
		"/:credentialsId",
		async ({ params, workspace, member }) => {
			return await SMTPService.deleteCredentials({
				...params,
				workspaceId: workspace.id,
				memberId: member.id,
			});
		},
		{
			params: SMTPModule.credentialsParams,
			detail: {
				description: "Delete SMTP credentials",
				tags: ["SMTP Credentials"],
			},
		},
	)
	.post(
		"/:credentialsId/regenerate-password",
		async ({ params, workspace, member }) => {
			return await SMTPService.regeneratePassword({
				...params,
				workspaceId: workspace.id,
				memberId: member.id,
			});
		},
		{
			params: SMTPModule.credentialsParams,
			detail: {
				description: "Regenerate password for existing SMTP credentials",
				tags: ["SMTP Credentials"],
			},
		},
	);
