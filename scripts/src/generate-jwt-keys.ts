import { generateKeyPair } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { promisify } from "node:util";

const generateKeyPairAsync = promisify(generateKeyPair);

const generateJWTKeys = async () => {
	console.log("🔑 Generating RSA key pair for JWT...");

	const { publicKey, privateKey } = await generateKeyPairAsync("rsa", {
		modulusLength: 2048,
		publicKeyEncoding: {
			type: "spki",
			format: "pem",
		},
		privateKeyEncoding: {
			type: "pkcs8",
			format: "pem",
		},
	});

	await writeFile("./privkey.pem", privateKey);
	await writeFile("./pubkey.pem", publicKey);

	console.log("✅ Keys generated successfully!");
	console.log("   - privkey.pem (private key)");
	console.log("   - pubkey.pem (public key)");
	console.log(
		"\n⚠️  Keep privkey.pem secure and never commit it to version control!",
	);
	console.log("   Add it to .gitignore if not already present.");
};

generateJWTKeys().catch(console.error);
