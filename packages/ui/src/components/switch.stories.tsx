import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { useArgs } from "storybook/preview-api";
import { Label } from "./label";
import { Switch } from "./switch";

type SwitchStoryArgs = ComponentProps<typeof Switch> & {
  description: string;
  label: string;
};

const meta = {
  title: "UI/Switch",
  component: Switch,
  tags: ["autodocs"],
  argTypes: {
    checked: { control: "boolean" },
    description: { control: "text" },
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
  args: {
    checked: true,
    description: "Protect inbound messages before they reach team inboxes.",
    disabled: false,
    label: "Spam filtering",
  },
  render: ({ description, label, ...args }) => {
    const [{ checked }, updateArgs] = useArgs<SwitchStoryArgs>();

    return (
      <div className="flex w-96 max-w-[calc(100vw-2rem)] items-center justify-between gap-4 rounded-3xl border-2 border-neutral-200 p-5 dark:border-neutral-700">
        <div className="grid gap-1">
          <Label htmlFor="spam-filtering">{label}</Label>
          <p className="text-pretty text-muted-foreground text-sm">
            {description}
          </p>
        </div>
        <Switch
          id="spam-filtering"
          {...args}
          checked={checked}
          onCheckedChange={(nextChecked) =>
            updateArgs({ checked: nextChecked })
          }
        />
      </div>
    );
  },
} satisfies Meta<SwitchStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
