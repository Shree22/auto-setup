import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

/** Shared chrome for the documentation, guides, examples and FAQ pages. */
export default function ContentLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
