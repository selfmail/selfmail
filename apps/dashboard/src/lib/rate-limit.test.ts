import { afterEach, describe, expect, it, vi } from "vitest";
import { createDashboardRateLimitMiddleware } from "./rate-limit";

const createRequest = (path: string, headers?: HeadersInit) =>
  new Request(`https://dashboard.selfmail.app${path}`, { headers });

const rateLimitResult = {
  allowed: true,
  limit: 10,
  remaining: 9,
  resetAt: new Date("2026-01-01T00:00:30.000Z"),
  resetIn: 30,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createDashboardRateLimitMiddleware", () => {
  it("skips public asset requests", async () => {
    const store = {
      limit: vi.fn(async () => rateLimitResult),
    };
    const next = vi.fn(async () => new Response("ok"));
    const middleware = createDashboardRateLimitMiddleware({ store });

    const response = await middleware(createRequest("/assets/app.js"), next);

    expect(response.status).toBe(200);
    expect(store.limit).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("returns 429 with rate limit headers when the caller is over limit", async () => {
    const store = {
      limit: vi.fn(async () => ({
        ...rateLimitResult,
        allowed: false,
        remaining: 0,
      })),
    };
    const next = vi.fn(async () => new Response("ok"));
    const middleware = createDashboardRateLimitMiddleware({ store });

    const response = await middleware(
      createRequest("/workspace", {
        "x-forwarded-for": "203.0.113.10, 10.0.0.1",
      }),
      next
    );

    expect(response.status).toBe(429);
    expect(await response.text()).toBe("Too many requests");
    expect(response.headers.get("Retry-After")).toBe("30");
    expect(response.headers.get("X-RateLimit-Limit")).toBe("10");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(store.limit).toHaveBeenCalledWith(expect.any(String), {
      limit: expect.any(Number),
      windowSeconds: expect.any(Number),
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("fails open and cools down when the store check fails", async () => {
    let currentTime = 1000;
    const store = {
      limit: vi.fn(() => {
        throw new Error("redis unavailable");
      }),
    };
    const next = vi.fn(async () => new Response("ok"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const middleware = createDashboardRateLimitMiddleware({
      now: () => currentTime,
      store,
    });

    const firstResponse = await middleware(createRequest("/workspace"), next);
    const secondResponse = await middleware(createRequest("/workspace"), next);

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);
    expect(store.limit).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledTimes(1);

    currentTime += 30_001;
    await middleware(createRequest("/workspace"), next);

    expect(store.limit).toHaveBeenCalledTimes(2);
  });
});
