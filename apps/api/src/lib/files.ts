import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { status } from "elysia";
import { Logs } from "./logs";

/**
 * Available bucket types for file storage
 */
export type FileBucket =
	| "backups"
	| "email-archive"
	| "email-attachments"
	| "workspace-icons"
	| "user-icons";

export abstract class Files {
	private static s3Client = new S3Client({
		region: "auto",
		endpoint: process.env.R2_ENDPOINT || "",
		credentials: {
			accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
			secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
		},
	});

	static async upload({
		file,
		bucket,
		name,
		folder,
	}: {
		file: Blob | Buffer;
		name: string;
		folder?: string;
		bucket: FileBucket;
	}): Promise<string> {
		if (
			!process.env.R2_ENDPOINT ||
			!process.env.R2_ACCESS_KEY_ID ||
			!process.env.R2_SECRET_ACCESS_KEY
		) {
			throw status(500, "Missing S3 configuration");
		}

		const bucketName = `selfmail-${bucket}`;

		const key = folder ? `${folder}/${name}` : name;

		try {
			// Convert file to buffer if it's a Blob
			const fileBuffer =
				file instanceof Blob ? Buffer.from(await file.arrayBuffer()) : file;

			// Upload file to S3
			const putCommand = new PutObjectCommand({
				Bucket: bucketName,
				Key: key,
				Body: fileBuffer,
				ContentType: file instanceof Blob ? file.type : undefined,
			});

			await Files.s3Client.send(putCommand);

			return `https://workspace-icons.selfmail.app/${key}`;
		} catch (error) {
			Logs.error(`Error uploading file to S3: ${(error as Error).message}`);

			throw status(500, "Failed to upload file");
		}
	}
}
