import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { Badge } from "./badge";
import { Progress } from "./progress";

type ProgressStoryArgs = ComponentProps<typeof Progress> & {
  label: string;
};

const meta = {
  title: "UI/Progress",
  component: Progress,
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    value: { control: { max: 100, min: 0, step: 1, type: "range" } },
  },
  args: {
    label: "Storage used",
    value: 64,
  },
  render: ({ label, value, ...args }) => (
    <div className="grid w-96 max-w-[calc(100vw-2rem)] gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-sm">{label}</span>
        <Badge variant="secondary">
          <span className="tabular-nums">{value ?? 0}%</span>
        </Badge>
      </div>
      <Progress value={value} {...args} />
    </div>
  ),
} satisfies Meta<ProgressStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
