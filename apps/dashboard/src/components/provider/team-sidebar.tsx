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
        isActive: true
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
        <div className="flex h-screen flex-col w-[68px] bg-[var(--bg-secondary)] border-r border-[var(--border-color)]">
            <div className="flex flex-col h-full justify-between items-center pt-3 px-2.5">
                <div>
                    {teamItems.map((team) => (
                        <TeamIcon key={team.id} team={team} />
                    ))}
                </div>

                <div>
                    <div className="w-full pt-2 pb-3">
                        <div className="w-full h-[1px] bg-[var(--border-color)]" />
                    </div>

                    <button className="w-10 h-10 mb-2 rounded-xl border border-[var(--border-color)]
                        flex items-center justify-center text-[var(--text-tertiary)]
                        hover:text-[var(--text-secondary)]
                        hover:border-[var(--border-secondary)]
                        hover:bg-[var(--hover-bg)]
                        transition-colors">
                        <PlusIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

interface TeamIconProps {
    team: TeamItem;
}

const TeamIcon = ({ team }: TeamIconProps) => {
    return (
        <div className="relative w-full flex justify-center mb-2">
            {team.isActive && (
                <div className="absolute -left-2.5 top-1/2 -translate-y-1/2">
                    <div className="w-1 h-5 bg-[var(--text-secondary)] rounded-r-full" />
                </div>
            )}
            <button
                className={`
                    w-10 h-10 rounded-xl flex items-center justify-center 
                    text-white font-medium text-sm transition-transform 
                    focus:outline-none
                    ${team.isActive ? 'ring-2 ring-[var(--border-color)]' : ''}
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
