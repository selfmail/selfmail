import { S3 } from "@selfmail/s3";

const IMAGE_DATA_URL =
	/^data:(image\/(?:png|jpeg|gif|webp|avif));base64,([A-Za-z0-9+/]+={0,2})$/;
const MAX_IMAGE_BYTES = 512 * 1024;

export function parseWorkspaceImage(image: string) {
	const match = IMAGE_DATA_URL.exec(image);
	if (!match) {
		throw new Error("Choose a PNG, JPEG, GIF, WebP, or AVIF image.");
	}
	const data = Buffer.from(match[2], "base64");
	if (data.length === 0 || data.length > MAX_IMAGE_BYTES) {
		throw new Error("Workspace images must be between 1 byte and 512 KB.");
	}
	if (data.toString("base64") !== match[2]) {
		throw new Error("Invalid image encoding.");
	}
	return { data, contentType: match[1] };
}

export async function uploadWorkspaceImage(workspaceId: string, image: string) {
	const { data, contentType } = parseWorkspaceImage(image);
	const development = process.env.NODE_ENV === "development";
	const bucketUrl =
		process.env.WORKSPACE_IMAGES_BUCKET_URL ||
		(development ? "http://localhost:9000/workspace-images" : undefined);
	const publicUrl =
		process.env.WORKSPACE_IMAGES_PUBLIC_URL ||
		(development ? "http://localhost:9000/workspace-images" : undefined);
	if (!(bucketUrl && publicUrl)) {
		throw new Error("Workspace image storage is not configured.");
	}
	const accessKeyId =
		process.env.WORKSPACE_IMAGES_ACCESS_KEY_ID ||
		(development ? "selfmail" : undefined);
	const secretAccessKey =
		process.env.WORKSPACE_IMAGES_SECRET_ACCESS_KEY ||
		(development ? "selfmail-local-secret" : undefined);
	const storage = new S3(bucketUrl, {
		region: process.env.WORKSPACE_IMAGES_REGION || "us-east-1",
		...(accessKeyId && secretAccessKey
			? { credentials: { accessKeyId, secretAccessKey } }
			: {}),
	});
	const key = `workspaces/${encodeURIComponent(workspaceId)}/${crypto.randomUUID()}`;
	try {
		await storage.upload(key, data, { contentType });
		return `${publicUrl.replace(/\/$/, "")}/${key.split("/").map(encodeURIComponent).join("/")}`;
	} finally {
		storage.destroy();
	}
}
