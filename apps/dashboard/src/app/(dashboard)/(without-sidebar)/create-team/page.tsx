"use client";

import { cn } from "@/lib/cn"; // Assuming you have a utility for class names
import { useState } from "react";
import { Button } from "ui"; // Assuming you have a Button component in your UI library

export default function CreateTeam() {
    const [teamType, setTeamType] = useState("personal");
    const [teamName, setTeamName] = useState("");
    const [teamImage, setTeamImage] = useState<File | null>(null);
    const [teamDescription, setTeamDescription] = useState("");

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setTeamImage(event.target.files[0]);
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        // Handle form submission logic here
    };

    return (
        <div className="flex flex-col min-h-screen items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <h1 className="text-2xl">Create a new Team</h1>

                <div>
                    <label htmlFor="teamType" className="block text-sm font-medium text-gray-700">
                        Team Type
                    </label>
                    <select
                        id="teamType"
                        name="teamType"
                        value={teamType}
                        onChange={(e) => setTeamType(e.target.value)}
                        className={cn("mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md")}
                    >
                        <option value="personal">Personal</option>
                        <option value="public">Public</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                        Team Name
                    </label>
                    <input
                        type="text"
                        id="teamName"
                        accept="image/*"
                        name="teamName"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className={cn("mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md")}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="teamImage" className="block text-sm font-medium text-gray-700">
                        Team Image
                    </label>
                    <input
                        type="file"
                        id="teamImage"
                        name="teamImage"
                        onChange={handleImageUpload}
                        className={cn("mt-1 block w-full text-sm text-gray-500")}
                    />
                </div>

                <div>
                    <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700">
                        Team Description
                    </label>
                    <textarea
                        id="teamDescription"
                        name="teamDescription"
                        value={teamDescription}
                        onChange={(e) => setTeamDescription(e.target.value)}
                        className={cn("mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md")}
                        rows={4}
                    />
                </div>

                <Button type="submit" className="w-full">
                    Create Team
                </Button>
            </form>
        </div>
    );
}