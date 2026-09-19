import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
} from "@aws-sdk/client-s3";
import { fileTypeFromBuffer } from "file-type";

export interface UploadOptions {
  /** Exact MIME type, such as image/png. Checked against the file bytes. */
  contentType: string;
}

export interface RetrievedFile {
  data: Uint8Array;
  contentType: string | undefined;
}

interface BucketLocation {
  bucket: string;
  endpoint?: string;
  forcePathStyle?: boolean;
  region?: string;
}

const LEADING_SLASH = /^\//;
const TRAILING_SLASH = /\/$/;
const AWS_BUCKET_HOST = /^(.+)\.s3(?:[.-]([a-z0-9-]+))?\.amazonaws\.com$/;

function parseBucketUrl(value: string | URL): BucketLocation {
  const url = new URL(value);
  if (url.username || url.password || url.search || url.hash) {
    throw new Error(
      "Bucket URLs cannot contain credentials, query parameters, or fragments."
    );
  }
  if (
    url.protocol === "s3:" &&
    url.hostname &&
    !url.port &&
    (url.pathname === "" || url.pathname === "/")
  ) {
    return { bucket: url.hostname };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(
      "Use s3://bucket, https://bucket.s3.region.amazonaws.com, or https://endpoint/bucket."
    );
  }
  const awsHost = AWS_BUCKET_HOST.exec(url.hostname);
  if (awsHost?.[1] && (url.pathname === "" || url.pathname === "/")) {
    return {
      bucket: awsHost[1],
      region: awsHost[2],
      endpoint: url.origin,
      forcePathStyle: false,
    };
  }
  const bucket = decodeURIComponent(
    url.pathname.replace(LEADING_SLASH, "").replace(TRAILING_SLASH, "")
  );
  if (!bucket || bucket.includes("/")) {
    throw new Error(
      "An endpoint URL must include exactly one bucket path: https://endpoint/bucket."
    );
  }
  return { bucket, endpoint: url.origin, forcePathStyle: true };
}

/** Server-side S3 storage. Credentials default to the AWS SDK credential chain. */
export class S3 {
  readonly bucket: string;
  private readonly client: S3Client;

  constructor(bucketUrl: string | URL, options: S3ClientConfig = {}) {
    const { bucket, ...config } = parseBucketUrl(bucketUrl);
    this.bucket = bucket;
    // The SDK appends the bucket itself, including for virtual-hosted URLs.
    if (config.forcePathStyle === false && config.endpoint) {
      config.endpoint = config.endpoint.replace(`${bucket}.`, "");
    }
    this.client = new S3Client({ ...config, ...options });
  }

  /** Supports binary formats recognized by file-type; unknown formats are rejected. */
  async upload(
    key: string,
    file: Blob | Uint8Array | ArrayBuffer,
    options: UploadOptions
  ): Promise<void> {
    this.validateKey(key);
    const data =
      file instanceof Blob
        ? new Uint8Array(await file.arrayBuffer())
        : new Uint8Array(file);
    const detected = await fileTypeFromBuffer(data);
    if (!detected || detected.mime !== options.contentType) {
      throw new Error(
        `Expected ${options.contentType}, detected ${detected?.mime ?? "an unknown file type"}.`
      );
    }
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: detected.mime,
      })
    );
  }

  async retrieve(key: string): Promise<RetrievedFile> {
    this.validateKey(key);
    const result = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key })
    );
    if (!result.Body) {
      throw new Error(`S3 returned no body for ${key}.`);
    }
    return {
      data: await result.Body.transformToByteArray(),
      contentType: result.ContentType,
    };
  }

  async remove(key: string): Promise<void> {
    this.validateKey(key);
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    );
  }

  destroy(): void {
    this.client.destroy();
  }

  private validateKey(key: string): void {
    if (!key || new TextEncoder().encode(key).length > 1024) {
      throw new Error(
        "Object keys must contain between 1 and 1024 UTF-8 bytes."
      );
    }
  }
}
