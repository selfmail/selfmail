import { beforeEach, describe, expect, it, vi } from "vitest";

const handlerFetch = vi.fn<(req: Request) => Promise<Response>>();
const paraglideMiddleware = vi.fn<
  (req: Request, next: () => Promise<Response>) => Promise<Response>
>();

vi.mock("@tanstack/react-start/server-entry", () => ({
  default: {
    fetch: handlerFetch,
  },
}));

vi.mock("./paraglide/server.js", () => ({
  paraglideMiddleware,
}));

describe("server origin checks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    handlerFetch.mockResolvedValue(new Response("ok", { status: 200 }));
    paraglideMiddleware.mockImplementation(async (_req, next) => next());
  });

  it("rejects state-changing requests without an origin", async () => {
    const { default: server } = await import("./server");
    const response = await server.fetch(
      new Request("https://auth.selfmail.app/login", { method: "POST" }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "Forbidden" });
    expect(paraglideMiddleware).not.toHaveBeenCalled();
    expect(handlerFetch).not.toHaveBeenCalled();
  });

  it("allows same-site post requests from known origins", async () => {
    const { default: server } = await import("./server");
    const request = new Request("https://auth.selfmail.app/login", {
      headers: {
        Origin: "https://selfmail.app",
      },
      method: "POST",
    });
    const response = await server.fetch(request);

    expect(response.status).toBe(200);
    expect(paraglideMiddleware).toHaveBeenCalledOnce();
    expect(handlerFetch).toHaveBeenCalledWith(request);
  });

  it("allows selfmail subdomains for state-changing requests", async () => {
    const { default: server } = await import("./server");
    const response = await server.fetch(
      new Request("https://auth.selfmail.app/login", {
        headers: {
          Origin: "https://workspace.selfmail.app",
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(200);
    expect(handlerFetch).toHaveBeenCalledOnce();
  });

  it("skips the origin check for get requests", async () => {
    const { default: server } = await import("./server");
    const response = await server.fetch(
      new Request("https://auth.selfmail.app/login", { method: "GET" }),
    );

    expect(response.status).toBe(200);
    expect(handlerFetch).toHaveBeenCalledOnce();
  });
});
