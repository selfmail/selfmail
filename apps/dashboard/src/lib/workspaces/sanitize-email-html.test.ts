import { describe, expect, it } from "vitest";
import { emailHtmlDocument } from "../email-html-document";
import { sanitizeEmailHtml } from "./sanitize-email-html";

describe("email HTML isolation", () => {
	it("removes active content and navigation controls", () => {
		const clean = sanitizeEmailHtml(
			'<script>alert(1)</script><iframe src="https://evil.test"></iframe><base href="https://evil.test"><meta http-equiv="refresh" content="0;url=https://evil.test"><form action="https://evil.test"><input></form><p onclick="alert(1)">Hello</p><svg onload="alert(1)"></svg>',
		);
		expect(clean).toBe("<p>Hello</p>");
	});
	it("keeps formatting while removing CSS resource loads and overlays", () => {
		const clean = sanitizeEmailHtml(
			'<table><tr><td style="color:red;padding:8px;background-image:url(https://evil.test);position:fixed">Hello</td></tr></table>',
		);
		expect(clean).toContain('style="color:red;padding:8px"');
		expect(clean).not.toContain("evil.test");
		expect(clean).not.toContain("fixed");
	});
	it("allows only explicit safe links and isolates their targets", () => {
		const clean = sanitizeEmailHtml(
			'<a href="javascript:alert(1)">bad</a><a href="/settings">relative</a><a href="https://example.com" target="_top">good</a>',
		);
		expect(clean).not.toContain("javascript:");
		expect(clean).not.toContain("/settings");
		expect(clean).not.toContain("_top");
		expect(clean).toContain(
			'href="https://example.com" target="_blank" rel="noopener noreferrer"',
		);
	});
	it("removes alternate and relative image sources", () => {
		const clean = sanitizeEmailHtml(
			'<img src="/private" srcset="https://evil.test 2x" onerror="alert(1)"><img src="https://example.com/image.png">',
		);
		expect(clean).not.toContain("/private");
		expect(clean).not.toContain("srcset");
		expect(clean).not.toContain("onerror");
		expect(clean).toContain('src="https://example.com/image.png"');
	});
	it("blocks resources by default and only opts images into HTTPS", () => {
		expect(emailHtmlDocument("<p>Hello</p>", false)).toContain(
			"img-src 'none'",
		);
		const document = emailHtmlDocument("<p>Hello</p>", true);
		expect(document).toContain("img-src https:");
		expect(document).toContain("default-src 'none'; script-src 'none'");
		expect(document).toContain("base-uri 'none'; form-action 'none'");
	});
});
