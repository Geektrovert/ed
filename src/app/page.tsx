import TailwindAdvancedEditor from "@/components/editor";
import { ModeToggle } from "@/components/ui/theme-toggle";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center gap-4 py-4 sm:px-5">
      <TailwindAdvancedEditor />

      <ModeToggle />
    </div>
  );
}
