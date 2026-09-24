import type { Metadata } from "next";
import { SetupHeader } from "@/components/setup/setup-header";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Create your framework",
  description:
    "Choose your automation tool, language, framework and structure, then download a ready-to-run test automation project.",
  // Canonical ignores ?tool=… links so the variants are not treated as duplicates.
  path: "/setup",
});

export default function SetupLayout({ children }: LayoutProps<"/setup">) {
  return (
    <>
      <SetupHeader />
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
