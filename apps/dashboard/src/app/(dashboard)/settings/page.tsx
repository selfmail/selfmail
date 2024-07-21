import { ButtonStyles } from "node_modules/ui/src/components/button";
import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from "ui";

export default async function Settings() {
    return (
        <div className="min-h-screen p-3 flex flex-col">
            <h1 className="text-3xl font-medium">Settings</h1>
            <p className="text-[#666666]">Change the settings of selfmail.</p>
            <div className="flex flex-col">

            </div>
            {/* Danger zone */}
            <div className="flex flex-col">
                <h2 className="text-xl text-red-500 font-medium">Danger Zone</h2>
                <Dialog>
                    <DialogTrigger>
                        Delete Account
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            Are you sure?
                        </DialogHeader>
                        <DialogDescription>
                            Are you really sure to delete your account? We are not able to restore it, you can't take this action back. We also recommend to export your mails before.
                        </DialogDescription>
                        <DialogFooter className="space-x-3 flex justify-end">
                            <DialogClose>
                                <Button variant={"secondary"}>
                                    Go Back
                                </Button>
                            </DialogClose>
                            <DialogClose>
                                <Button variant={"danger"}>
                                    Delete
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    )
}