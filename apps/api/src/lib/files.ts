import { promises as fs } from "node:fs";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { status } from "elysia";
import { Logs } from "services/logs";

/**
 * Available bucket types for file storage
 */
export type FileBucket =
	| "backups"
	| "email-archive"
	| "email-attachments"
	| "workspace-icons"
	| "user-icons";

export type SelfmailVolume = `selfmail-${FileBucket}`;

export abstract class Files {
	private static s3Client = new S3Client({
		region: "auto",
		endpoint: process.env.AWS_ENDPOINT || "",
		credentials: {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
		},
	});

	/**
	 * Upload file to S3
	 */
	private static async uploadToS3({
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
			!process.env.AWS_ENDPOINT ||
			!process.env.AWS_ACCESS_KEY_ID ||
			!process.env.AWS_SECRET_ACCESS_KEY
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

	/**
	 * Upload file to Docker volume
	 */
	private static async uploadToDockerVolume({
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
		const volumeName = `selfmail-${bucket}`;
		const key = folder ? `${folder}/${name}` : name;
		const volumePath = `/volumes/${volumeName}`;
		const filePath = path.join(volumePath, key);

		try {
			// Ensure directory exists
			await fs.mkdir(path.dirname(filePath), { recursive: true });

			// Convert file to buffer if it's a Blob
			const fileBuffer =
				file instanceof Blob ? Buffer.from(await file.arrayBuffer()) : file;

			// Write file to volume
			await fs.writeFile(filePath, fileBuffer);

			// Return URL path for accessing the file
			return `/${volumeName}/${key}`;
		} catch (error) {
			Logs.error(
				`Error uploading file to Docker volume: ${(error as Error).message}`,
			);
			throw status(500, "Failed to upload file to Docker volume");
		}
	}

	/**
	 * Upload file to local data folder
	 */
	private static async uploadToLocalDisk({
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
		const bucketName = `selfmail-${bucket}`;
		const key = folder ? `${folder}/${name}` : name;
		const dataPath = path.join(process.cwd(), "data", bucketName);
		const filePath = path.join(dataPath, key);

		try {
			// Ensure directory exists
			await fs.mkdir(path.dirname(filePath), { recursive: true });

			// Convert file to buffer if it's a Blob
			const fileBuffer =
				file instanceof Blob ? Buffer.from(await file.arrayBuffer()) : file;

			// Write file to local disk
			await fs.writeFile(filePath, fileBuffer);

			// Return relative path for accessing the file
			return `/data/${bucketName}/${key}`;
		} catch (error) {
			Logs.error(
				`Error uploading file to local disk: ${(error as Error).message}`,
			);
			throw status(500, "Failed to upload file to local disk");
		}
	}

	/**
	 * Main upload method that routes to the appropriate storage backend
	 */
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
		const enableS3Upload = process.env.ENABLE_S3_UPLOAD === "true";
		const enableDockerVolumeUpload =
			process.env.ENABLE_DOCKER_VOLUME_UPLOAD === "true";

		// Priority: S3 > Docker Volume > Local Disk
		if (enableS3Upload) {
			return Files.uploadToS3({ file, bucket, name, folder });
		}

		if (enableDockerVolumeUpload) {
			return Files.uploadToDockerVolume({ file, bucket, name, folder });
		}

		// Fallback to local disk storage
		return Files.uploadToLocalDisk({ file, bucket, name, folder });
	}
}
