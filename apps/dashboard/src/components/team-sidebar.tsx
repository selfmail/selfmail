import { PlusIcon } from "@heroicons/react/24/outline";

interface TeamItem {
    id: string;
    name: string;
    logo?: string;
    color?: string;
    isActive?: boolean;
}

const teamItems: TeamItem[] = [
    {
        id: '1',
        name: 'Linear',
        color: '#2563eb',
        isActive: false
    },
    {
        id: '2',
        name: 'Mintify',
        color: '#10b981',
        isActive: false
    },
    {
        id: '3',
        name: 'Skype',
        color: '#0ea5e9',
        isActive: false
    },
    {
        id: '4',
        name: 'Euro',
        color: '#f59e0b',
        isActive: false
    },
    {
        id: '5',
        name: 'Spotify',
        color: '#22c55e',
        isActive: false
    },
];

const TeamSidebar = () => {
    return (
        <aside className="flex md:sticky top-0 lg:flex h-screen flex-col w-[68px] bg-background border-r border-r-border justify-between items-center pt-3 px-2.5">
            <div>
                <div>
                    <TeamIcon team={{
                        id: '1',
                        name: 'Selfmail',
                        color: '#22c55e',
                        isActive: true
                    }} />
                    <div className="w-full pt-2 pb-3">
                        <div className="w-full h-[1px] bg-border" />
                    </div>
                </div>
                {teamItems.map((team) => (
                    <TeamIcon key={team.id} team={team} />
                ))}
            </div>

            <div>
                <div className="w-full pt-2 pb-3">
                    <div className="w-full h-[1px] bg-border" />
                </div>

                <button className="w-10 h-10 mb-2 rounded-xl border border-border
                        flex items-center justify-center text-text-tertiary
                        hover:text-text-secondary
                        hover:border-border-secondary
                        hover:bg-hover-bg
                        transition-colors">
                    <PlusIcon className="w-4 h-4" />
                </button>
            </div>
        </aside>
    );
};

interface TeamIconProps {
    team: TeamItem;
}

const TeamIcon = ({ team }: TeamIconProps) => {
    return (
        <div className="relative w-full flex justify-center mb-2">
            <button
                className={`
                    w-10 h-10 rounded-xl flex items-center justify-center 
                    text-white font-medium text-sm transition-transform 
                    focus:outline-none
                    ${team.isActive ? 'ring-2 ring-border' : ''}
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
        </div>
    );
};

export default TeamSidebar;
