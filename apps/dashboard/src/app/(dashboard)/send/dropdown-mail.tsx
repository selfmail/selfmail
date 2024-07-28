"use client"

import { useMailStore } from "./store"

export default function DropdownMailList({
    adresses
}: {adresses: string[]}) {
    const {adresse, updateAdresse} = useMailStore()
    return (
        <div className="flex items-center space-x-1">
            <h3 className="font-medium">
                Adresse:
            </h3>
            <select  onChange={(e) => updateAdresse(e.currentTarget.value)} name="adresse" className="p-1 outline-none border bg-[#f4f4f4] rounded-md">
                {
                    adresses.map((a) => (
                        <option key={a} value={a}>
                            {a}
                        </option>
                    ))
                }
            </select>
        </div>
    )
}