import dynamic from "next/dynamic";
const ThemeToggle = dynamic(() => import("../../components/themeToggle/ThemeToggle"), { ssr: false });

export default function SettingsPage() {
  return <div>
    <h1>Settings</h1>
    <ThemeToggle />
  </div>;
}
