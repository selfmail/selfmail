import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@selfmail/ui";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { m } from "#/paraglide/messages";

interface AddressActionsProps {
  email: string;
}

export function AddressActions({ email }: AddressActionsProps) {
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Address copied", {
        id: "copy-address",
      });
    } catch {
      toast.error("Address could not be copied.", {
        id: "copy-address",
      });
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label={`Copy ${email}`}
            onClick={copyEmail}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <CopyIcon aria-hidden="true" className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent sideOffset={5}>
          <p>{m["dashboard.settings.domains.copy"]()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
