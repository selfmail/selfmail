import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ChevronDownIcon,
  ClockIcon,
  CopyIcon,
  DownloadIcon,
  FilePlusIcon,
  FolderOpenIcon,
  PencilIcon,
  PrinterIcon,
  ShareIcon,
} from "lucide-react";
import type { ComponentProps } from "react";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownSub,
  DropdownSubContent,
  DropdownSubTrigger,
  DropdownTrigger,
} from "./dropdown";

type DropdownStoryArgs = ComponentProps<typeof DropdownContent> & {
  showShortcuts: boolean;
  triggerLabel: string;
};

const meta = {
  title: "UI/Dropdown",
  tags: ["autodocs"],
  argTypes: {
    align: {
      control: "select",
      options: ["start", "center", "end"],
    },
    showShortcuts: { control: "boolean" },
    side: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
    },
    triggerLabel: { control: "text" },
  },
  args: {
    align: "start",
    showShortcuts: true,
    side: "bottom",
    triggerLabel: "File",
  },
  render: ({ align, showShortcuts, side, triggerLabel }) => (
    <Dropdown>
      <DropdownTrigger>
        {triggerLabel}
        <ChevronDownIcon />
      </DropdownTrigger>
      <DropdownContent align={align} className="min-w-72" side={side}>
        <DropdownItem icon={<FilePlusIcon />} shortcut={showShortcuts && "⌘N"}>
          New
        </DropdownItem>
        <DropdownItem
          icon={<FolderOpenIcon />}
          shortcut={showShortcuts && "⌘O"}
        >
          Open
        </DropdownItem>
        <DropdownItem icon={<CopyIcon />} shortcut={showShortcuts && "⌘D"}>
          Duplicate
        </DropdownItem>
        <DropdownSeparator />
        <DropdownSub>
          <DropdownSubTrigger icon={<ShareIcon />}>Share</DropdownSubTrigger>
          <DropdownSubContent side="right">
            <DropdownItem>Copy link</DropdownItem>
            <DropdownItem>Email workspace</DropdownItem>
            <DropdownItem>Invite member</DropdownItem>
          </DropdownSubContent>
        </DropdownSub>
        <DropdownSub>
          <DropdownSubTrigger icon={<DownloadIcon />}>
            Save As
          </DropdownSubTrigger>
          <DropdownSubContent side="right">
            <DropdownItem>Draft</DropdownItem>
            <DropdownItem>Template</DropdownItem>
            <DropdownItem>Plain text</DropdownItem>
          </DropdownSubContent>
        </DropdownSub>
        <DropdownSeparator />
        <DropdownItem icon={<PencilIcon />}>Rename</DropdownItem>
        <DropdownSeparator />
        <DropdownSub>
          <DropdownSubTrigger icon={<ClockIcon />}>
            Version history
          </DropdownSubTrigger>
          <DropdownSubContent side="right">
            <DropdownItem>View versions</DropdownItem>
            <DropdownItem>Restore previous</DropdownItem>
          </DropdownSubContent>
        </DropdownSub>
        <DropdownSeparator />
        <DropdownItem icon={<PrinterIcon />} shortcut={showShortcuts && "⌘P"}>
          Print
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  ),
} satisfies Meta<DropdownStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
