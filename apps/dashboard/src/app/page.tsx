import { Dialog, DialogContent, DialogTrigger } from "ui";

export default function HomePage() {
  return (
    <main>
      <Dialog>
        <DialogTrigger>
          hey, das ist der Dialog
        </DialogTrigger>
        <DialogContent>
          this is the content
        </DialogContent>
      </Dialog>
    </main>
  );
}
