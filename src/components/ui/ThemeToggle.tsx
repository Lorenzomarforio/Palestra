import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { Button } from './Button';
import './ThemeToggle.css';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-toggle" role="group" aria-label="Theme selection">
      <Button
        variant={theme === 'light' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
        aria-label="Light theme"
      >
        <Sun size={16} aria-hidden="true" />
        <span className="theme-toggle__label">Light</span>
      </Button>
      <Button
        variant={theme === 'dark' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
        aria-label="Dark theme"
      >
        <Moon size={16} aria-hidden="true" />
        <span className="theme-toggle__label">Dark</span>
      </Button>
      <Button
        variant={theme === 'system' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => setTheme('system')}
        aria-pressed={theme === 'system'}
        aria-label="System theme"
      >
        <Monitor size={16} aria-hidden="true" />
        <span className="theme-toggle__label">System</span>
      </Button>
    </div>
  );
}