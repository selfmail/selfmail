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

    // Check for valid ipv6
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
  });
});
