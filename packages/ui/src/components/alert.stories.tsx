import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

type AlertStoryArgs = ComponentProps<typeof Alert> & {
  description: string;
  title: string;
};

const meta = {
  title: "UI/Alert",
  component: Alert,
  tags: ["autodocs"],
  argTypes: {
    description: { control: "text" },
    title: { control: "text" },
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive"],
    },
  },
  args: {
    description: "Workspace mail is being processed normally.",
    title: "Delivery healthy",
    variant: "default",
  },
  render: ({ description, title, ...args }) => (
    <Alert className="w-96 max-w-[calc(100vw-2rem)]" {...args}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  ),
} satisfies Meta<AlertStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="grid w-96 max-w-[calc(100vw-2rem)] gap-3">
      <Alert>
        <AlertTitle>Delivery healthy</AlertTitle>
        <AlertDescription>
          Workspace mail is being processed normally.
        </AlertDescription>
      </Alert>
      <Alert variant="secondary">
        <AlertTitle>Queue warming up</AlertTitle>
        <AlertDescription>
          New sending limits apply after verification.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>DNS check failed</AlertTitle>
        <AlertDescription>
          Add the missing MX record before sending.
        </AlertDescription>
      </Alert>
    </div>
  ),
};
