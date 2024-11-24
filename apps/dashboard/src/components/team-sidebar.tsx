"use client"
import { ChevronRightIcon, Cog6ToothIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "./sidebar";
import { useUserPageTrackingStore } from "./user-page-tracking";

interface TeamItem {
    id: string;
    name: string;
    logo?: string;
    color?: string;
    isActive?: boolean;
}

type team = {
    name: string,
    logo?: string,
    color?: string,
    slug: string,
}

type user = {
    name: string,
    logo?: string,
    color?: string,
}

export default function TeamSidebar({ teams, user }: { teams: team[], user: user }) {
    const { state, setState } = useSidebarStore();
    return (
        <aside className="flex md:sticky top-0 lg:flex h-screen flex-col w-[68px] bg-background border-r border-r-border justify-between items-center pt-3 px-2.5">
            <div>
                <div>
                    <TeamIcon
                        user={user}
                    />
                    <div className="w-full pt-2 pb-3">
                        <div className="w-full h-[1px] bg-border" />
                    </div>
                </div>
                {teams.map((team) => (
                    <TeamIcon key={team.slug} team={team} />
                ))}
            </div>

            <div>
                {
                    !state && (
                        <div className="w-full items-center flex justify-between">
                            <Cog6ToothIcon className="cursor-pointer w-4 h-4 text-text-secondary" />
                            <ChevronRightIcon className="cursor-pointer w-4 h-4 text-text-secondary" onClick={() => setState(true)} />
                        </div>
                    )
                }
                <div className="w-full pt-2 pb-3">
                    <div className="w-full h-[1px] bg-border" />
                </div>

                <Link href="/create-team" className="w-10 h-10 mb-2 rounded-xl border border-border
                        flex items-center justify-center text-text-tertiary
                        hover:text-text-secondary
                        hover:border-border-secondary
                        hover:bg-hover-bg
                        transition-colors">
                    <PlusIcon className="w-4 h-4" />
                </Link>
            </div>
        </aside>
    );
};

const TeamIcon = ({ team, user }: { team?: team, user?: user }) => {
    const { href } = useUserPageTrackingStore()
    const pathname = usePathname()
    const isTeamActive = team?.slug === pathname[0]
    return (
        <div className="relative w-full flex justify-center mb-2">
            {user && (
                <Link href={href ? href : "/"}>
                    <button
                        className={`
                            w-10 h-10 rounded-xl flex items-center justify-center 
                            text-white font-medium text-sm transition-transform 
                            focus:outline-none
                        `}
                        style={{ backgroundColor: user.color }}
                        title={user.name}
                    >
                        {user.logo ? (
                            <img src={user.logo} alt={user.name} className="w-5 h-5" />
                        ) : (
                            user.name.substring(0, 1)
                        )}
                    </button>
                </Link>
            ) || team && (
                <Link href="/t">
                    <button
                        className={`
                                w-10 h-10 rounded-xl flex items-center justify-center 
                                text-white font-medium text-sm transition-transform 
                                focus:outline-none
                                ${isTeamActive ? 'ring-2 ring-border' : ''}
                            `}
                        style={{ backgroundColor: team.color }}
                        title={team.name}
                    >
                        {team.logo ? (
                            <img src={team.logo} alt={team.name} className="w-5 h-5" />
                        ) : (
                            team.name.substring(0, 1)
                        )}
                    </button>
                </Link>
            )}
        </div>
    );
};

