import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { useArgs } from "storybook/preview-api";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

type CheckboxStoryArgs = ComponentProps<typeof Checkbox> & {
  description: string;
  label: string;
};

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    checked: { control: "boolean" },
    description: { control: "text" },
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
  args: {
    checked: true,
    description: "Allow weekly summaries for this workspace.",
    disabled: false,
    label: "Email digest",
  },
  render: ({ description, label, ...args }) => {
    const [{ checked }, updateArgs] = useArgs<CheckboxStoryArgs>();

    return (
      <div className="flex w-96 max-w-[calc(100vw-2rem)] items-start gap-3">
        <Checkbox
          id="digest"
          {...args}
          checked={checked}
          onCheckedChange={(nextChecked) =>
            updateArgs({ checked: nextChecked === true })
          }
        />
        <div className="grid gap-1">
          <Label htmlFor="digest">{label}</Label>
          <p className="text-pretty text-muted-foreground text-sm">
            {description}
          </p>
        </div>
      </div>
    );
  },
} satisfies Meta<CheckboxStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
