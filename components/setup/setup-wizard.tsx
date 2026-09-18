"use client";

import { useMemo, useReducer, useState } from "react";
import { ArrowLeft, ArrowRight, ClipboardList, Loader2, Sparkles, TriangleAlert } from "lucide-react";
import { GenerateSuccess } from "@/components/setup/generate-success";
import { Stepper } from "@/components/setup/stepper";
import { StackStep } from "@/components/setup/steps/stack-step";
import { StructureStep } from "@/components/setup/steps/structure-step";
import { ReviewStep } from "@/components/setup/steps/review-step";
import { ToolStep } from "@/components/setup/steps/tool-step";
import { SummaryPanel } from "@/components/setup/summary-panel";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { generateProject } from "@/lib/setup/api";
import {
  createSelectionReducer,
  emptySelection,
  findTool,
  furthestReachableStep,
  isStepComplete,
  projectNameError,
  STEPS,
  suggestProjectName,
  type StepId,
} from "@/lib/setup/selection";
import { getSummaryItems } from "@/lib/setup/summary";
import type { GenerateProjectResult, SetupCatalog, SetupSelection } from "@/lib/setup/types";

type Generation =
  | { status: "idle" }
  | { status: "generating" }
  | { status: "error"; message: string }
  | { status: "success"; result: GenerateProjectResult };

type Props = {
  catalog: SetupCatalog;
  initialSelection: SetupSelection;
  initialStep: number;
};

export function SetupWizard({ catalog, initialSelection, initialStep }: Props) {
  const reducer = useMemo(() => createSelectionReducer(catalog), [catalog]);
  const [selection, dispatch] = useReducer(reducer, initialSelection);
  const [step, setStep] = useState(initialStep);
  const [generation, setGeneration] = useState<Generation>({ status: "idle" });

  const stepId = STEPS[step].id;
  const isLast = step === STEPS.length - 1;
  const canContinue = isStepComplete(stepId, catalog, selection);
  const reachable = furthestReachableStep(catalog, selection);
  const blocked = canContinue ? null : blockedReason(stepId, catalog, selection);
  const generating = generation.status === "generating";

  function goTo(index: number) {
    if (index === STEPS.length - 1 && !selection.projectName) {
      dispatch({ type: "projectName", name: suggestProjectName(catalog, selection) });
    }
    setGeneration({ status: "idle" });
    setStep(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleGenerate() {
    setGeneration({ status: "generating" });
    try {
      const result = await generateProject(selection);
      setGeneration({ status: "success", result });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setGeneration({
        status: "error",
        message: "Something went wrong while generating your project. Please try again.",
      });
    }
  }

  function startOver() {
    dispatch({ type: "reset", selection: emptySelection });
    setGeneration({ status: "idle" });
    setStep(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (generation.status === "success") {
    const summary = getSummaryItems(catalog, selection)
      .filter((i) => i.label !== "Application" && i.label !== "Browsers" && i.value)
      .map((i) => i.value!);
    return (
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
        <GenerateSuccess result={generation.result} summary={summary} onStartOver={startOver} />
      </div>
    );
  }

  const stepProps = { catalog, selection, dispatch };
  const showAside = stepId !== "review";

  return (
    <>
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 pt-8 pb-12 sm:px-6 sm:pt-10 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">New project</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            Create your automation framework
          </h1>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-xs sm:p-5">
          <Stepper current={step} reachable={reachable} onStepClick={goTo} />
        </div>

        <div className={showAside ? "mt-8 grid gap-8 lg:grid-cols-[1fr_320px]" : "mt-8"}>
          <div key={stepId} className="min-w-0 animate-fade-up">
            {stepId === "tool" && <ToolStep {...stepProps} />}
            {stepId === "stack" && <StackStep {...stepProps} />}
            {stepId === "structure" && <StructureStep {...stepProps} />}
            {stepId === "review" && (
              <ReviewStep
                {...stepProps}
                onEditStep={(id: StepId) => goTo(STEPS.findIndex((s) => s.id === id))}
              />
            )}
          </div>

          {showAside && (
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border bg-card p-6 shadow-xs">
                <SummaryPanel catalog={catalog} selection={selection} />
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Action bar */}
      <div className="sticky bottom-0 z-40 border-t bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-10 px-3 sm:px-4"
            onClick={() => goTo(step - 1)}
            disabled={step === 0 || generating}
          >
            <ArrowLeft data-icon="inline-start" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button type="button" variant="ghost" size="lg" className="h-10 px-3 lg:hidden">
                <ClipboardList data-icon="inline-start" />
                Summary
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85svh] overflow-y-auto rounded-t-2xl">
              <SheetHeader className="sr-only">
                <SheetTitle>Project summary</SheetTitle>
                <SheetDescription>Your current selections</SheetDescription>
              </SheetHeader>
              <div className="p-5 pt-6">
                <SummaryPanel catalog={catalog} selection={selection} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="ml-auto flex min-w-0 items-center gap-3">
            <p
              className="hidden truncate text-sm text-muted-foreground md:block"
              role="status"
              aria-live="polite"
            >
              {generation.status === "error" ? (
                <span className="flex items-center gap-1.5 text-destructive">
                  <TriangleAlert className="size-4 shrink-0" /> {generation.message}
                </span>
              ) : (
                blocked
              )}
            </p>

            {isLast ? (
              <Button
                type="button"
                size="lg"
                className="h-10 px-4 sm:px-5"
                onClick={handleGenerate}
                disabled={!canContinue || generating}
              >
                {generating ? (
                  <>
                    <Loader2 data-icon="inline-start" className="animate-spin" /> Generating…
                  </>
                ) : (
                  <>
                    <Sparkles data-icon="inline-start" />
                    {generation.status === "error" ? "Try again" : "Generate Project"}
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                className="h-10 px-4 sm:px-5"
                onClick={() => goTo(step + 1)}
                disabled={!canContinue}
              >
                Continue <ArrowRight data-icon="inline-end" />
              </Button>
            )}
          </div>
        </div>
        {(blocked || generation.status === "error") && (
          <p className="px-4 pb-3 text-xs text-muted-foreground md:hidden" role="status">
            {generation.status === "error" ? generation.message : blocked}
          </p>
        )}
      </div>
    </>
  );
}

function blockedReason(step: StepId, c: SetupCatalog, sel: SetupSelection): string | null {
  switch (step) {
    case "tool":
      return "Choose a tool to continue.";
    case "stack":
      if (!sel.languageId) return "Choose a programming language.";
      if (!sel.frameworkId) return "Choose a test framework.";
      if (findTool(c, sel.toolId)?.supportsBrowsers && sel.browserIds.length === 0)
        return "Select at least one browser.";
      return null;
    case "structure":
      return "Choose a project structure.";
    case "review":
      return projectNameError(sel.projectName);
  }
}
