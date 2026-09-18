import type { Metadata } from "next";
import { SetupHeader } from "@/components/setup/setup-header";

export const metadata: Metadata = {
  title: "Create your framework — AutoSetup",
  description:
    "Choose your automation tool, language, framework and structure to set up a ready-to-use test automation project.",
};

export default function SetupLayout({ children }: LayoutProps<"/setup">) {
  return (
    <>
      <SetupHeader />
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
