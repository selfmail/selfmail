import { describe, expect, test } from "bun:test";
import { Connection } from "../src/events/connection";

describe("Connection Event Tests", () => {
  describe("Check for valid ipv4 and ipv6 addresses", () => {
    test("Should pass test as ipv4", async () => {
      const success = await Connection.validateIP("192.168.1.1");

      expect(success).toBe(true);
    });

    test("Should NOT pass test as valid ipv4", async () => {
      const success = await Connection.validateIP("999.999.999.999");

      expect(success).toBe(false);
    });

    test("Should pass test as ipv6", async () => {
      const success = await Connection.validateIP(
        "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
      );

      expect(success).toBe(true);
    });

    test("Should NOT pass test as valid ipv6", async () => {
      const success = await Connection.validateIP(
        "2001:0db8:85a3:0000:0000:8a2e:0370:zzzz"
      );

      expect(success).toBe(false);
    });

    test("Should reject empty string", async () => {
      const success = await Connection.validateIP("");
      expect(success).toBe(false);
    });

    test("Should reject random text", async () => {
      const success = await Connection.validateIP("not-an-ip");
      expect(success).toBe(false);
    });
  });

  describe("Reverse DNS Lookup Tests", () => {
    test("Should return ok: false with empty ptrs for invalid IP", async () => {
      const result = await Connection.reverseDNSLookup("192.0.2.1");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(Array.isArray(result.ptrs)).toBe(true);
      }
    });

    test("Should return ok: false for localhost", async () => {
      const result = await Connection.reverseDNSLookup("127.0.0.1");
      expect(result.ok).toBe(false);
    });
  });
});
