"use client";

import { cn } from "@/lib/cn";
import { Button, Input, InputStyles } from "ui";

export default function CreateTeam() {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="lg:min-w-[400px] space-y-2 mx-5 min-w-full sm:mx-0 p-4">
                <h2 className="text-2xl font-medium ">Create a new team</h2>
                <form action={() => {

                }} className="space-y-1">
                    <Input className="w-full" placeholder="Enter team name" />
                    <textarea className={cn("w-full", InputStyles)} placeholder="Team description" />
                    <Button>Create Team</Button>
                </form>
            </div>
        </div>
    );
}