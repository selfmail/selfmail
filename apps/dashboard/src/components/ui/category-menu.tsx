import {
    ChevronUpDownIcon, // Design
    CodeBracketIcon,
    MegaphoneIcon, // Video
    MusicalNoteIcon, // Marketing
    PaintBrushIcon, // Code
    PlayCircleIcon, // Toggle icon
    QuestionMarkCircleIcon // Info icon
} from '@heroicons/react/24/outline';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useState } from 'react';

interface CategoryOption {
    id: string;
    label: string;
    icon: React.ElementType;
}

const categories: CategoryOption[] = [
    { id: 'marketing', label: 'Marketing', icon: MegaphoneIcon },
    { id: 'design', label: 'Design', icon: PaintBrushIcon },
    { id: 'code', label: 'Code', icon: CodeBracketIcon },
    { id: 'video', label: 'Video', icon: PlayCircleIcon },
    { id: 'music', label: 'Music', icon: MusicalNoteIcon },
];

export function CategoryMenu() {
    const [selectedCategory, setSelectedCategory] = useState(categories[0]);

    return (
        <div className="w-[240px]">
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-[var(--text-secondary)]">Category</span>
                <QuestionMarkCircleIcon className="w-4 h-4 text-[var(--text-tertiary)]" />
            </div>

            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                    <button className="w-full flex items-center justify-between px-3 py-2 
            rounded-md border border-[var(--border-color)] bg-[var(--bg-main)]
            text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] outline-none">
                        <div className="flex items-center gap-2">
                            <selectedCategory.icon className="w-4 h-4" />
                            <span>{selectedCategory?.label}</span>
                        </div>
                        <ChevronUpDownIcon className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                    <DropdownMenu.Content
                        className="w-[240px] p-1 rounded-md shadow-lg border border-[var(--border-color)] 
              bg-[var(--bg-main)] animate-fadeIn"
                        sideOffset={4}
                    >
                        {categories.map((category) => (
                            <DropdownMenu.Item
                                key={category.id}
                                className={`
                  flex items-center gap-2 px-2 py-2 rounded-md outline-none cursor-default
                  ${selectedCategory?.id === category.id
                                        ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                                    }
                `}
                                onClick={() => setSelectedCategory(category)}
                            >
                                <category.icon className="w-4 h-4" />
                                {category.label}
                            </DropdownMenu.Item>
                        ))}
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>
        </div>
    );
} 