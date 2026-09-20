import { SetupWizard } from "@/components/setup/setup-wizard";
import { catalog } from "@/lib/setup/catalog";
import { resolveInitialState } from "@/lib/setup/selection";

/**
 * /setup — supports preselection, e.g.
 * /setup?tool=selenium&language=python&framework=pytest&structure=pom
 */
export default async function SetupPage({ searchParams }: PageProps<"/setup">) {
  const params = await searchParams;
  const { selection, step } = resolveInitialState(catalog, params);

  return (
    <SetupWizard
      // Remount when the preselection changes (e.g. navigating between stacks)
      key={JSON.stringify(params)}
      catalog={catalog}
      initialSelection={selection}
      initialStep={step}
    />
  );
}
