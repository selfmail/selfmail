import { DialogDescription, DialogFooter } from "node_modules/ui/src/components/dialog";
import { Dialog, DialogContent, DialogHeader, DialogTrigger, DialogClose, Button } from "ui";

export default function HomePage() {
  return (
    <main>
      <Dialog>
        <DialogTrigger>
          hey, das ist der Dialog
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            Share this email
          </DialogHeader>
          <DialogDescription>
            We are so kindly, that we provide the functionality to share emails. You can also collaberate with other peope on this email, your free accounts allows 5 collaberators.
          </DialogDescription>
          <DialogFooter>
            <DialogClose>
              <Button>
                share
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
