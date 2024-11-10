import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="w-8 h-8 flex items-center justify-center rounded-lg
      hover:bg-[var(--hover-bg)] text-[var(--text-tertiary)]
      hover:text-[var(--text-secondary)] transition-colors"
        >
            {theme === 'light' ? (
                <MoonIcon className="w-4 h-4" />
            ) : (
                <SunIcon className="w-4 h-4" />
            )}
        </button>
    );
} 