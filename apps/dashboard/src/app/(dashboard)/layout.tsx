import Sidebar from "@/components/elements/sidebar";

export default async function DashboardLayout(
  props: Readonly<{ children: React.ReactNode }> & {
    params: {
      team: string | undefined
    }
  }
) {
  const params = props.params;

  const {
    children
  } = props;

  return (
    <div className="flex min-h-screen text-foreground">
      <Sidebar team={params.team} username="henri">{children}</Sidebar>
    </div>
  );
}
