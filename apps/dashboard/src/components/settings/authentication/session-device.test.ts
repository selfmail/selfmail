import { describe, expect, it } from "vitest";
import { getSessionDevice } from "./session-device";

describe("getSessionDevice", () => {
	it.each([
		[
			"Mozilla/5.0 (Windows NT 10.0) Chrome/128.0 Safari/537.36 Edg/128.0",
			"Microsoft Edge · Windows",
		],
		[
			"Mozilla/5.0 (Linux; Android 14) Chrome/128.0 SamsungBrowser/26.0",
			"Samsung Internet · Android",
		],
		["Mozilla/5.0 (Windows NT 10.0) Chrome/128.0 OPR/114.0", "Opera · Windows"],
		[
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Version/18.0 Safari/605.1.15",
			"Safari · macOS",
		],
		[
			"Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) CriOS/128.0 Mobile/15E148 Safari/604.1",
			"Chrome · iPhone",
		],
		[
			"Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) FxiOS/130.0 Mobile/15E148 Safari/605.1.15",
			"Firefox · iPad",
		],
		[
			"Mozilla/5.0 (X11; CrOS x86_64) Chrome/128.0 Safari/537.36",
			"Chrome · ChromeOS",
		],
		["Mozilla/5.0 (X11; Linux x86_64) Firefox/130.0", "Firefox · Linux"],
		["Custom client/1.0", "Custom client/1.0"],
		[null, null],
		["", null],
	])("formats %s as %s", (userAgent, expected) => {
		expect(getSessionDevice(userAgent)).toBe(expected);
	});
});
