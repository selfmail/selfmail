import { afterAll, expect, test } from "bun:test";
import { serve } from "bun";
import { S3 } from "./index";

const png = new Uint8Array(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
    "base64"
  )
);
interface StoredFile {
  bytes: Uint8Array;
  contentType: string;
}
const files = new Map<string, StoredFile>();
let requests = 0;
const server = serve({
  port: 0,
  async fetch(request) {
    requests++;
    const key = new URL(request.url).pathname;
    if (request.method === "PUT") {
      files.set(key, {
        bytes: new Uint8Array(await request.arrayBuffer()),
        contentType: request.headers.get("content-type") ?? "",
      });
      return new Response(null);
    }
    if (request.method === "DELETE") {
      files.delete(key);
      return new Response(null, { status: 204 });
    }
    const file = files.get(key);
    if (!file) {
      return new Response("<Error><Code>NoSuchKey</Code></Error>", {
        status: 404,
      });
    }
    return new Response(new Blob([file.bytes]), {
      headers: { "content-type": file.contentType },
    });
  },
});
const storage = new S3(new URL("/test-bucket", server.url), {
  region: "us-east-1",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
});
afterAll(() => {
  storage.destroy();
  server.stop(true);
});

test("uploads verified bytes, retrieves them, and removes the object", async () => {
  await storage.upload(
    "images/a b.png",
    new Blob([png], { type: "image/jpeg" }),
    { contentType: "image/png" }
  );
  expect(files.has("/test-bucket/images/a%20b.png")).toBe(true);
  const result = await storage.retrieve("images/a b.png");
  expect(result.data).toEqual(png);
  expect(result.contentType).toBe("image/png");
  await storage.remove("images/a b.png");
  await expect(storage.retrieve("images/a b.png")).rejects.toThrow();
  await storage.remove("images/a b.png");
});

test("rejects mismatched and unrecognized bytes before contacting S3", async () => {
  const before = requests;
  await expect(
    storage.upload("fake.jpg", png, { contentType: "image/jpeg" })
  ).rejects.toThrow("Expected image/jpeg");
  await expect(
    storage.upload(
      "fake.png",
      new TextEncoder().encode("This is not an image"),
      { contentType: "image/png" }
    )
  ).rejects.toThrow("unknown file type");
  await expect(storage.remove("")).rejects.toThrow("Object keys");
  expect(requests).toBe(before);
});

test("accepts bucket URLs and rejects ambiguous locations", () => {
  for (const url of [
    "s3://photos",
    "https://photos.s3.eu-central-1.amazonaws.com",
    "https://photos.s3.amazonaws.com",
  ]) {
    const client = new S3(url);
    expect(client.bucket).toBe("photos");
    client.destroy();
  }
  for (const url of [
    "s3://photos/prefix",
    "https://example.com",
    "https://example.com/bucket/prefix",
    "https://user:pass@example.com/bucket",
    "https://example.com/bucket?token=secret",
  ]) {
    expect(() => new S3(url)).toThrow();
  }
});
