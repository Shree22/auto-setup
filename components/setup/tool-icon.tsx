import {
  Bot,
  Drama,
  Globe,
  Smartphone,
  TreePine,
  Webhook,
  Wrench,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

/** Maps icon keys sent by the backend to Lucide icons. */
const icons: Record<string, LucideIcon> = {
  globe: Globe,
  drama: Drama,
  "tree-pine": TreePine,
  bot: Bot,
  smartphone: Smartphone,
  webhook: Webhook,
};

export function ToolIcon({ icon, ...props }: { icon: string } & LucideProps) {
  const Icon = icons[icon] ?? Wrench;
  return <Icon {...props} />;
}
