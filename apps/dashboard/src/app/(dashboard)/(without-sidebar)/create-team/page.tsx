"use client";

import { cn } from "@/lib/cn";
import { useAction } from "next-safe-action/hooks";
import { Button, Input, InputStyles } from "ui";
import { createTeam } from "./action";

export default function CreateTeam() {
    const { execute, result } = useAction(createTeam);
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="lg:min-w-[400px] space-y-2 mx-5 min-w-full sm:mx-0 p-4">
                <h2 className="text-2xl font-medium ">Create a new team</h2>
                <form action={(e) => {
                    execute({ name: e.get("name").valueOf || undefined, description: "Team Description", teamType: "personal" })
                }} className="space-y-1">
                    <Input required className="w-full" placeholder="Enter team name" name="name" />
                    <textarea required className={cn(InputStyles, "w-full")} placeholder="Enter team description" name="description" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <input type="radio" name="teamType" value="personal" id="personal" />
                            <label htmlFor="personal" className="text-sm font-medium text-text-secondary">Personal</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="radio" name="teamType" value="business" id="business" />
                            <label htmlFor="business" className="text-sm font-medium text-text-secondary">Business</label>
                        </div>
                    </div>
                    <Button>Create Team</Button>
                </form>
            </div>
        </div>
    );
}