import { AuthShell } from "./components/AuthShell";
import { NeptliumMark } from "./components/NeptliumMark";

export default function AuthLoading() {
  return (
    <AuthShell>
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <NeptliumMark size={36} animated />
        <p className="text-body-sm text-text-muted">Loading&hellip;</p>
      </div>
    </AuthShell>
  );
}
