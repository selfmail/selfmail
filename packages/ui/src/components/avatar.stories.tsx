import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

type AvatarStoryArgs = ComponentProps<typeof Avatar> & {
  alt: string;
  fallback: string;
  src: string;
};

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  argTypes: {
    alt: { control: "text" },
    fallback: { control: "text" },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
    src: { control: "text" },
  },
  args: {
    alt: "Workspace owner",
    fallback: "HG",
    size: "default",
    src: "",
  },
  render: ({ alt, fallback, src, ...args }) => (
    <Avatar {...args}>
      <AvatarImage alt={alt} src={src} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  ),
} satisfies Meta<AvatarStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
    </div>
  ),
};
