import { useTheme } from '@/lib/theme';
import { Button } from './Button';
import './ThemeToggle.css';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div className="theme-toggle" role="group" aria-label="Theme selection">
      <Button
        variant={theme === 'light' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
      >
        <span className="theme-toggle__icon" aria-hidden="true">☀️</span>
        <span className="theme-toggle__label">Light</span>
      </Button>
      <Button
        variant={theme === 'dark' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
      >
        <span className="theme-toggle__icon" aria-hidden="true">🌙</span>
        <span className="theme-toggle__label">Dark</span>
      </Button>
      <Button
        variant={theme === 'system' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => setTheme('system')}
        aria-pressed={theme === 'system'}
      >
        <span className="theme-toggle__icon" aria-hidden="true">💻</span>
        <span className="theme-toggle__label">System</span>
      </Button>
    </div>
  );
}