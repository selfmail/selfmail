import type {
	SMTPServerAuthentication,
	SMTPServerAuthenticationResponse,
	SMTPServerSession,
} from "smtp-server";

export async function auth(
	auth: SMTPServerAuthentication,
	session: SMTPServerSession,
	callback: (
		err: Error | null | undefined,
		response?: SMTPServerAuthenticationResponse,
	) => void,
): Promise<void> {}

// {
//         if (auth.method === "XOAUTH2") {
//             return callback(
//                 new Error(
//                     "XOAUTH2 method is not allowed,Expecting LOGIN authentication",
//                 ),
//             );
//         }
//         console.log(
//             `[OUTBOUND] Authentication attempt from ${session.remoteAddress}: ${auth.username}`,
//         );

//         // Simplified authentication - no STARTTLS requirement for now
//         if (!auth.username || !auth.password) {
//             return callback(new Error("Username and password required"));
//         }

//         // Basic password validation
//         if (auth.password !== "selfmail_password") {
//             return callback(new Error("Invalid password"));
//         }

//         console.log(`[OUTBOUND] Authentication successful for ${auth.username}`);
//         return callback(undefined, {
//             user: auth.username, // Store the email address as the user
//         });
//     },
