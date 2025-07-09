export class AuthError extends Error {
	constructor(message = "Authentication failed") {
		super(message);
		this.name = "AuthError";
	}
}
