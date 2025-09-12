import ThemeToggle from '../ThemeToggle';

export default function ThemeToggleExample() {
  return (
    <div className="p-4">
      <div className="flex items-center space-x-4">
        <span>Toggle dark/light mode:</span>
        <ThemeToggle />
      </div>
    </div>
  );
}