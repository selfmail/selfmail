import { JSDOM } from "jsdom";
import { act, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  SelfmailLogo,
  cn,
  selfmailTokens,
} from "./index";
import { selfmailBrand } from "./brand";
import { Button as NativeButton, selfmailNativeTokens } from "./native";

const mountedRoots: Array<{ cleanup: () => void }> = [];

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

function render(node: ReactNode) {
  const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>");
  const rootElement = dom.window.document.getElementById("root");

  if (!rootElement) throw new Error("Missing test root element.");

  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const previousNavigator = globalThis.navigator;

  Object.assign(globalThis, {
    document: dom.window.document,
    navigator: dom.window.navigator,
    window: dom.window,
  });

  const root = createRoot(rootElement);

  act(() => {
    root.render(node);
  });

  mountedRoots.push({
    cleanup() {
      act(() => {
        root.unmount();
      });
      Object.assign(globalThis, {
        document: previousDocument,
        navigator: previousNavigator,
        window: previousWindow,
      });
      dom.window.close();
    },
  });

  return dom.window.document;
}

afterEach(() => {
  for (const mountedRoot of mountedRoots.splice(0)) mountedRoot.cleanup();
});

describe("@selfmail/ui", () => {
  it("renders representative web components", () => {
    const document = render(
      <Card>
        <CardHeader>
          <Badge>New</Badge>
          <CardTitle>Inbox</CardTitle>
        </CardHeader>
        <CardContent>
          <Input aria-label="Address" defaultValue="henri@selfmail.app" />
          <Button className="mt-4">Send</Button>
          <SelfmailLogo aria-label="Selfmail logo" className="mt-4 h-8 w-auto" />
        </CardContent>
      </Card>
    );

    expect(document.querySelector("input")?.getAttribute("value")).toBe("henri@selfmail.app");
    expect(document.querySelector("button")?.textContent).toBe("Send");
    expect(document.querySelector("svg[aria-label='Selfmail logo']")).not.toBeNull();
  });

  it("exports brand and token metadata", () => {
    expect(selfmailBrand.name).toBe("Selfmail");
    expect(selfmailBrand.palette.primary).toBe("#2563eb");
    expect(selfmailTokens.light.background).toBe("#f8fafc");
    expect(cn("px-2", undefined, "px-4")).toBe("px-4");
  });

  it("resolves the native entry without web-only exports", () => {
    expect(selfmailNativeTokens.colors.light.primary).toBe("#2563eb");
    expect(typeof NativeButton).toBe("function");
  });
});
