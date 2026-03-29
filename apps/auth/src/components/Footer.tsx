import { m } from "#/paraglide/messages";

export default function Footer() {
  return (
    <footer className="absolute bottom-5 flex gap-4 text-neutral-500 text-sm">
      <a href={"https://selfmail.app/privacy"}>
        {m["footer.privacy_policy"]()}
      </a>
      <div className="h-full w-0.5 rounded-full bg-neutral-200" />
      <a href="https://selfmail.app/terms">{m["footer.terms_of_service"]()}</a>
    </footer>
  );
}
