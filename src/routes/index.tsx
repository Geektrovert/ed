import { createFileRoute } from '@tanstack/react-router'

import TailwindAdvancedEditor from "@/components/editor";

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="flex min-h-screen flex-col items-center gap-4 py-4 sm:px-5">
      <TailwindAdvancedEditor />
    </div>
  )
}
