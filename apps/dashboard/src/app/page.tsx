import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "ui";

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
        </DialogContent>
      </Dialog>
    </main>
  );
}
