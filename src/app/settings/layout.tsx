import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Bird Feed",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
