import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from "ui";

export default async function Settings() {
  return (
    <div className="flex min-h-screen flex-col p-3">
      <h1 className="text-3xl font-medium">Settings</h1>
      <p className="text-[#666666]">Change the settings of selfmail.</p>
      <div className="flex flex-col" />
      {/* Danger zone */}
      <div className="flex flex-col">
        <h2 className="text-xl font-medium text-red-500">Danger Zone</h2>
      </div>
      <Dialog>
        <DialogTrigger>Delete Account</DialogTrigger>
        <DialogContent>
          <DialogHeader>Are you sure?</DialogHeader>
          <DialogDescription>
            Are you really sure to delete your account? We are not able to
            restore it, you can't take this action back. We also recommend to
            export your mails before.
          </DialogDescription>
          <DialogFooter className="flex justify-end space-x-3">
            Message by selfmail
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
