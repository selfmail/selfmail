import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Textarea } from "./textarea";

const meta = {
  title: "UI/Form Controls",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const AuthStyleForm: Story = {
  render: () => (
    <form className="grid w-96 max-w-[calc(100vw-2rem)] gap-5">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" placeholder="you@selfmail.app" type="email" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="workspace">Workspace</Label>
        <Select defaultValue="personal">
          <SelectTrigger id="workspace">
            <SelectValue placeholder="Choose workspace" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="team">Team</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" placeholder="Write a short note" />
      </div>
      <Button type="button">Save changes</Button>
    </form>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <div className="grid w-96 max-w-[calc(100vw-2rem)] gap-2">
      <Label htmlFor="invalid-email">Email</Label>
      <Input
        aria-describedby="invalid-email-error"
        aria-invalid
        id="invalid-email"
        placeholder="you@selfmail.app"
        type="email"
      />
      <p className="px-2 text-destructive text-sm" id="invalid-email-error">
        Enter a valid email address.
      </p>
    </div>
  ),
};
