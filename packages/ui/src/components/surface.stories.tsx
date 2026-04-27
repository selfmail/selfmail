import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Separator } from "./separator";
import { Skeleton } from "./skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta = {
  title: "UI/Surfaces",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const CardExample: Story = {
  render: () => (
    <Card className="w-96 max-w-[calc(100vw-2rem)]">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Inbox health</CardTitle>
          <Badge variant="secondary">Live</Badge>
        </div>
        <CardDescription>
          Workspace activity for the last 24 hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Separator />
          <Skeleton className="h-16 w-full" />
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-muted-foreground text-sm">Updated just now</p>
      </CardFooter>
    </Card>
  ),
};

export const TabsExample: Story = {
  render: () => (
    <Tabs className="w-96 max-w-[calc(100vw-2rem)]" defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="usage">Usage</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-pretty text-sm">
          Clean shared primitives for product screens.
        </p>
      </TabsContent>
      <TabsContent value="usage">
        <p className="text-pretty text-sm">
          Import components from @selfmail/ui.
        </p>
      </TabsContent>
    </Tabs>
  ),
};
