import { db } from "@selfmail/db";

interface EmailFixture {
  slug: string;
  subject: string;
  text: string;
  html: string | null;
}

const recipient = "hey@henri.is";
const fixtures: EmailFixture[] = [
  {
    slug: "newsletter",
    subject: "[HTML test] Newsletter — typography and layout",
    text: "Selfmail weekly\n\nYour HTML viewer is ready to explore.\n\n• Tables and inline styles\n• Headings, lists, and quotes\n• Safe links opening in a new tab\n\nVisit https://example.com",
    html: `<html><body><table width="100%" cellpadding="24" cellspacing="0"><tr><td style="background-color:#f4f4f5"><h1 style="color:#18181b;font-size:28px">Selfmail weekly</h1><p style="color:#52525b">A small newsletter for a new inbox.</p></td></tr><tr><td><h2>Make yourself at home</h2><p>This email tests <strong>bold text</strong>, <em>italics</em>, <u>underlines</u>, and <span style="color:#2563eb">inline colors</span>.</p><ul><li>Tables and inline styles</li><li>Headings, lists, and quotes</li><li>Safe links opening in a new tab</li></ul><blockquote>Good email should stay readable at every width.</blockquote><p><a href="https://example.com">Open the example website</a></p><hr><p style="font-size:12px;color:#71717a">Synthetic test message. No subscription or purchase occurred.</p></td></tr></table></body></html>`,
  },
  {
    slug: "receipt",
    subject: "[HTML test] Receipt — tables and alignment",
    text: "Example receipt (not a real purchase)\nNotebook × 2: €24.00\nPencil set × 1: €6.00\nTotal: €30.00",
    html: `<h1>Example receipt</h1><p>This is a test, not a real purchase.</p><table width="100%" cellpadding="12" cellspacing="0" style="border-collapse:collapse"><thead><tr><th align="left">Item</th><th align="center">Qty</th><th align="right">Price</th></tr></thead><tbody><tr style="background-color:#f4f4f5"><td>Notebook</td><td align="center">2</td><td align="right">€24.00</td></tr><tr><td>Pencil set</td><td align="center">1</td><td align="right">€6.00</td></tr><tr style="background-color:#e4e4e7"><td colspan="2"><strong>Total</strong></td><td align="right"><strong>€30.00</strong></td></tr></tbody></table><p>Try the preview panel and fullscreen view.</p>`,
  },
  {
    slug: "remote-images",
    subject: "[HTML test] Remote image — privacy opt-in",
    text: "The HTML version contains a remote placeholder image. It should remain blocked until you choose Load remote images. Opening another email should reset that choice.",
    html: `<h1>Remote image privacy test</h1><p>The image below should be blocked initially. Choose <strong>Load remote images</strong> to request it from placehold.co.</p><img src="https://placehold.co/640x240/png" width="640" height="240" alt="Remote placeholder — blocked until you load images"><p>After enabling images, open another message, then return here. The image-loading choice should reset.</p><p>No unique tracking identifier is included in this image URL.</p>`,
  },
  {
    slug: "unsafe-content",
    subject: "[HTML test] Safety — blocked scripts, forms, and CSS",
    text: "The HTML view should show the safety checklist without an UNSAFE SCRIPT RAN heading, form controls, embedded frame, or fixed overlay. Unsafe and relative links should have no usable destination.",
    html: `<h1>Safety checklist</h1><p>This message intentionally contains harmless probes for features the viewer must remove.</p><ul><li>No “UNSAFE SCRIPT RAN” heading should appear.</li><li>No form controls or embedded frame should appear.</li><li>The styled paragraph below should remain normal flowing text.</li><li>The unsafe and relative links should have no usable destination.</li></ul><script>document.body.innerHTML = '<h1>UNSAFE SCRIPT RAN</h1>';</script><iframe srcdoc="<p>UNSAFE FRAME</p>"></iframe><form><input placeholder="UNSAFE FORM"><button>UNSAFE BUTTON</button></form><p onclick="this.textContent='UNSAFE HANDLER RAN'" style="color:green;position:fixed;inset:0;z-index:99999">This should be ordinary green text.</p><p><a href="javascript:void(0)">Unsafe link</a> · <a href="/settings">Relative link</a> · <a href="https://example.com" target="_top">Safe external link</a></p><style>body { display: none; }</style><p>The checklist should still be visible.</p>`,
  },
  {
    slug: "long-message",
    subject: "[HTML test] Long message — scrolling and Unicode",
    text: "Long-message test. Check iframe scrolling, Unicode, code blocks, and long text wrapping.\n\nGrüße aus Berlin — Bonjour — Hola — こんにちは 👋\n\nEnd of test message.",
    html: `<h1>Long message</h1><p>Grüße aus Berlin — Bonjour — Hola — こんにちは 👋</p><p dir="rtl" lang="ar">مرحبًا بالعالم</p><pre><code>const message = { format: "html", safe: true };</code></pre>${Array.from({ length: 20 }, (_, index) => `<h2>Section ${index + 1}</h2><p>Scroll through this message using the mouse, trackpad, or keyboard after focusing the email frame. The surrounding inbox should remain usable.</p>`).join("")}<p>${"long-unbroken-text-".repeat(20)}</p><h2>End of test message</h2>`,
  },
  {
    slug: "plain-text",
    subject: "[HTML test] Plain-text fallback — no HTML body",
    text: "This message has no HTML body.\n\nIt should render as plain text with preserved line breaks.\n\nLiteral markup must stay literal: <strong>not bold</strong>.\n\nThere should be no HTML toggle or remote-image button.",
    html: null,
  },
];

try {
  const result = await db.$transaction(async (tx) => {
    const address = await tx.address.findUnique({
      where: { email: recipient },
      select: { id: true },
    });
    if (!address) {
      throw new Error(
        `Mailbox ${recipient} does not exist in the configured database.`
      );
    }

    const ids = fixtures.map(
      (fixture) => `html-viewer-test-v1-${address.id}-${fixture.slug}`
    );
    const existing = await tx.email.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    const existingIds = new Set(existing.map(({ id }) => id));
    let storageBytes = 0n;
    let created = 0;

    for (const [index, fixture] of fixtures.entries()) {
      const id = `html-viewer-test-v1-${address.id}-${fixture.slug}`;
      if (existingIds.has(id)) {
        continue;
      }
      const sizeBytes = BigInt(
        Buffer.byteLength(fixture.text + (fixture.html ?? ""), "utf8")
      );
      await tx.email.create({
        data: {
          id,
          messageId: `<${id}@fixtures.invalid>`,
          addressId: address.id,
          from: [
            { name: "Selfmail HTML Tests", address: "viewer@fixtures.invalid" },
          ],
          to: [{ address: recipient }],
          subject: fixture.subject,
          text: fixture.text,
          html: fixture.html,
          date: new Date(Date.now() - index * 60_000),
          sizeBytes,
          sort: "normal",
          processed: true,
          read: false,
        },
      });
      storageBytes += sizeBytes;
      created += 1;
    }
    if (created > 0) {
      await tx.address.update({
        where: { id: address.id },
        data: { usedStorageBytes: { increment: storageBytes } },
      });
    }
    return { created, skipped: existing.length };
  });
  console.info(JSON.stringify({ mailbox: recipient, ...result }));
} finally {
  await db.$disconnect();
}
