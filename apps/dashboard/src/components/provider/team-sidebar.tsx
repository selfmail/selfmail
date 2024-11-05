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
        <div className="flex h-screen flex-col  w-[68px] bg-[#111111] border-r border-neutral-800">
            <div className="flex flex-col h-full justify-between items-center pt-3 px-2.5">
                <div>
                    {teamItems.map((team) => (
                        <TeamIcon key={team.id} team={team} />
                    ))}
                </div>

                <div className="">
                    <div className="w-full pt-2 pb-3">
                        <div className="w-full h-[1px] bg-neutral-800" />
                    </div>

                    {/* Add Team Button */}
                    <button className="w-10 h-10 mb-2 rounded-xl border border-neutral-800 
                    flex items-center justify-center text-neutral-500
                    hover:text-neutral-400
                    hover:border-neutral-700
                    hover:bg-neutral-900
                    transition-colors">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
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
                    <div className="w-1 h-5 bg-white rounded-r-full" />
                </div>
            )}
            <button
                className={`
                    w-10 h-10 rounded-xl flex items-center justify-center 
                    text-white font-medium text-sm transition-transform 
                    focus:outline-none
                    ${team.isActive ? 'ring-[2.5px] ring-neutral-700' : ''}
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
