// import { db } from "database";
// import Groq from "groq-sdk";
// import type { SendMessage } from "postal-js";
// import { z, ZodType } from "zod";
// import { app } from "..";
// import { config } from "../../config";
// import { handleErrorWithResponse } from "../actions/handleError";

// /**
//  * Handles the route to receive an email.
//  */
// export default function ReceiveEmail() {
// 	app.post(
// 		"/email/receive", //TODO: add seucred auth
// 		async (c) => {
// 			console.log("log complete");
// 			/**
// 			 * Parsed body from hono. You can get now the provided email fields.
// 			 */
// 			const body = await c.req.json();

// 			const emailSchema = z
// 				.object({
// 					attachments: z.array(z.string()).optional(),
// 					bcc: z.array(z.string().email()).optional(),
// 					cc: z.array(z.string().email()).optional(),
// 					from: z.string().email(),
// 					bounce: z.boolean().optional(),
// 					html_body: z.string().optional(),
// 					plain_body: z.string().optional(),
// 					reply_to: z.string().email().optional(),
// 					subject: z.string().optional(),
// 					to: z.array(z.string().email()).optional(),
// 					sender: z.string().email().optional(),
// 					tag: z.string().optional(),
// 				} satisfies Record<keyof SendMessage, ZodType>)
// 				.safeParse({
// 					...body,
// 				});

// 			// The provided values are not matching the required types, an error will be send back.
// 			if (!emailSchema.success) {
// 				handleErrorWithResponse("Validation of the fields is failed", c, 400, "Required fields are not valid or have a wrong schema.");
// 			}

// 			const { from, attachments, to, cc, bcc, reply_to, tag, bounce, plain_body, html_body, subject, sender } = emailSchema.data as SendMessage;

// 			/**
// 			 * Checking if the recipient exists in the database (if the recipient exists)
// 			 */
// 			const adresse = await db.adresse.findUnique({
// 				where: {
// 					email: to
// 				},
// 			});

// 			// the recipient is not defined, send an email to the sender, that the recipient was not found
// 			if (!adresse) {
// 				/**
// 				 * Sends the error email to the user.
// 				 * The defined template will be used, or the default template, if the template is not defined.
// 				 *
// 				 * TODO: add rate limiting
// 				 */
// 				const { data, error } = await resend.emails.send({
// 					from: config.SUPPORT_MAIL,
// 					to: emailSchema.data.recipient,
// 					subject: "Email could not be delivered.",
// 					html:
// 						c.get("error_html") ||
// 						"<strong>Sorry, we weren't able to deliver your email. The choosen recipient don't exists.</strong>",
// 				});
// 				if (config.LOG_ERRORS_INTO_CONSOLE && !error) {
// 					console.log(
// 						`[i] Email could not be delivered. The choosen recipient don't exists.`,
// 					);
// 				}
// 				if (error && config.LOG_ERRORS_INTO_CONSOLE) {
// 					console.error(
// 						`[i] Email could not be delivered. The error:\n${error.message}`,
// 					);
// 				}
// 				//TODO: implement the error log into the db

// 				// return the 404 status code back
// 				return c.json(
// 					{
// 						error: "Recipient was not found",
// 					},
// 					{
// 						status: 404,
// 						statusText: "User not found",
// 					},
// 				);
// 			}

// 			// getting the user to verify the next steps with the ai
// 			const user = await db.user.findUnique({
// 				where: {
// 					id: adresse.userId,
// 				},
// 			});

// 			// processing the email with the groq ai
// 			const ai = new Groq({
// 				apiKey: config.GROQ_API_KEY,
// 			});
// 			const chat = await ai.chat.completions.create({
// 				messages: [
// 					{
// 						role: "system",
// 						content:
// 							"You are a bot which scans emails and summarizes them in a few senctences. Use the language from the email. You can write normal textes, don't use paragraphs. You get a text, which shows you the subject and the content of the email. The subject is the first line of the email. The content is the rest of the email.",
// 					},
// 					{
// 						role: "user",
// 						content: `Subject: ${emailSchema.data.subject}\nContent: ${emailSchema.data.content}`,
// 					},
// 				],
// 				model: "llama3-8b-8192",
// 				max_tokens: 1024,
// 			});

// 			/**
// 			 * Contacts:
// 			 *
// 			 * for every new incoming email, a contact will be searched. If there if no contact, a
// 			 * new contact will be created. A contact is like a infomation card. This contains information
// 			 * about the contact, the emails which the contact searched and more. If the user don't wont to
// 			 * receive email from this contact anymore, he can block this contact.
// 			 */
// 			let contact = await db.contact.findUnique({
// 				where: {
// 					email_userId: {
// 						email: sender,
// 						userId: adresse.userId,
// 					},
// 				},
// 			});
// 			// contact is not defined yet, we will create a new one in the db
// 			if (!contact) {
// 				contact = await db.contact.create({
// 					data: {
// 						email: sender,
// 						userId: adresse.userId,
// 						name: sender,
// 						description: `Emails from ${sender}`,
// 					},
// 				});
// 			}

// 			/**
// 			 * Uploading the email to the database.
// 			 * The email can now rated by the ai.
// 			 * E.g: add labels or mark as spam, newsletter or ads.
// 			 *
// 			 * TODO: add rate limiting
// 			 * TODO: add ai processing
// 			 */
// 			const email = await db.email.create({
// 				data: {
// 					content: emailSchema.data.content,
// 					sender: emailSchema.data.sender,
// 					subject: emailSchema.data.subject,
// 					recipient: emailSchema.data.recipient,
// 					adresseId: adresse.id,
// 					contactId: contact.id,
// 					userId: adresse.userId,
// 					summarzied: chat.choices[0]?.message?.content,
// 				},
// 			});

// 			// the email could not be saved in the db, an error is occured
// 			if (!email) {
// 				const { data, error } = await resend.emails.send({
// 					from: config.SUPPORT_MAIL,
// 					to: emailSchema.data.recipient,
// 					subject: "Email could not be delivered.",
// 					html:
// 						c.get("error_html") ||
// 						"<strong>Sorry, we we have an error by saving your email. Please contact us.</strong>",
// 				});
// 				// only warn in the console
// 				if (config.LOG_ERRORS_INTO_CONSOLE && !error) {
// 					console.error(
// 						`[i] Email could not be saved in the database. Email was send by: ${emailSchema.data.sender} and the recipient is: ${emailSchema.data.recipient}`,
// 					);
// 				}
// 				// warn in the console, that also the delivering of the error email went wrong
// 				if (error && config.LOG_ERRORS_INTO_CONSOLE) {
// 					console.error(
// 						`[i] Email could not be delivered and an error occures when saving the data into the database. The error:\n\n${error.message}`,
// 					);
// 				}
// 				// return the status code
// 				return c.json(
// 					{
// 						error: "Database error: cannot save the email",
// 					},
// 					{
// 						status: 500,
// 						statusText: "Database error",
// 					},
// 				);
// 			}

// 			/**
// 			 * All is going correctly, send the 200 status code back
// 			 */
// 			return c.json(
// 				{
// 					error: undefined,
// 				},
// 				{
// 					status: 200,
// 					statusText: "All is processing correctly.",
// 				},
// 			);
// 		},
// 	);
// }
