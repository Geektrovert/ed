import { Link } from '@tanstack/react-router'
import { ModeToggle } from '@/components/ui/theme-toggle'

export default function Header() {
  return (
    <header className="p-4 bg-white dark:bg-black text-black dark:text-white">
      <nav className="flex flex-row w-full items-center justify-between">
        <Link to="/" className="font-bold">Home</Link>
        <ModeToggle />
      </nav>
    </header>
  )
}
