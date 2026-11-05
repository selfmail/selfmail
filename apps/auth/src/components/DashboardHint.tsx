import { useQuery } from "@tanstack/react-query";
import { getAppRedirectUrlFn } from "#/libs/session";
import { m } from "#/paraglide/messages";

export default function DashboardHint() {
  const { data, error } = useQuery({
    queryKey: ["dashboardUrl"],
    queryFn: async () => {
      const res = await getAppRedirectUrlFn();
      return res;
    },
  });

  if (error) {
    return;
  }

  return (
    <div className="rounded-2xl border border-border bg-muted px-4 py-3 text-muted-foreground text-sm">
      <div className="flex items-start gap-3">
        <p className="flex-1 text-pretty">
          {m["login.dashboard_hint.text"]()}{" "}
          <a
            className="font-medium text-foreground underline underline-offset-2"
            href={data}
          >
            {m["login.dashboard_hint.link"]()}
          </a>
          .
        </p>
      </div>
    </div>
  );
}
