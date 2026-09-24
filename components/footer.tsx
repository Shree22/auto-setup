import { Heart, Mail } from "lucide-react";
import { Logo } from "@/components/logo";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Supported Tools", href: "/#tools" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Get Started", href: "/setup" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Automation Guides", href: "/guides" },
      { label: "Examples", href: "/examples" },
      { label: "FAQ", href: "/faq" },
    ],
  },
];

/** Placeholder until a real domain and mailbox exist. */
const contactEmail = "hello@autosetup.dev";

/** Hidden until there is a real mailbox to receive the email. */
const showContact = false;

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-8 sm:px-6 lg:px-8">
        <div
          className={cn(
            "grid gap-10",
            showContact
              ? "lg:grid-cols-[1.5fr_1fr_1fr_1fr]"
              : "lg:grid-cols-[1.5fr_1fr_1fr]"
          )}
        >
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">
              Helping manual testers start automation faster.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:contents">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="text-sm font-semibold">{column.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {showContact && (
              <div>
                <p className="text-sm font-semibold">Contact</p>
                <p className="mt-4 text-sm text-muted-foreground">
                  Questions or feedback? Get in touch.
                </p>
                <a
                  href={`mailto:${contactEmail}`}
                  className="mt-2.5 flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-foreground"
                >
                  <Mail className="size-4 shrink-0" aria-hidden />
                  <span className="truncate">{contactEmail}</span>
                </a>
              </div>
            )}
          </div>
        </div>

        <Separator className="mt-12 mb-6" />

        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 AutoSetup. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Built for the Testing Community
            <Heart className="size-4 fill-red-500 text-red-500" aria-label="love" />
          </p>
        </div>
      </div>
    </footer>
  );
}
