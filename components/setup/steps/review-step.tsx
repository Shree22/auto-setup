"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  ListOrdered,
  Loader2,
  MonitorDown,
  Package,
  Pencil,
  RotateCw,
  Terminal,
  TriangleAlert,
} from "lucide-react";
import { FileTree } from "@/components/setup/file-tree";
import { StepHeader } from "@/components/setup/step-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { projectNameError, type SelectionAction, type StepId } from "@/lib/setup/selection";
import { getSelectedAddonNames, getSummaryItems } from "@/lib/setup/summary";
import type { Prerequisite, SetupCatalog, SetupSelection, SetupStep } from "@/lib/setup/types";
import { useProjectPreview } from "@/lib/setup/use-project-preview";

type Props = {
  catalog: SetupCatalog;
  selection: SetupSelection;
  dispatch: (action: SelectionAction) => void;
  onEditStep: (step: StepId) => void;
};

export function ReviewStep({ catalog, selection, dispatch, onEditStep }: Props) {
  const [nameTouched, setNameTouched] = useState(false);
  const nameError = projectNameError(selection.projectName);
  const addons = getSelectedAddonNames(catalog, selection);

  return (
    <div className="space-y-8">
      <StepHeader
        title="Review your setup"
        description="Check your choices and preview the project before generating it."
      />

      <div className="max-w-md space-y-2">
        <Label htmlFor="project-name">Project name</Label>
        <Input
          id="project-name"
          value={selection.projectName}
          onChange={(e) => dispatch({ type: "projectName", name: e.target.value })}
          onBlur={() => setNameTouched(true)}
          aria-invalid={nameTouched && nameError ? true : undefined}
          aria-describedby="project-name-hint"
          className="h-10 font-mono"
          spellCheck={false}
          autoComplete="off"
        />
        <p
          id="project-name-hint"
          className={nameTouched && nameError ? "text-sm text-destructive" : "text-sm text-muted-foreground"}
        >
          {nameTouched && nameError ? nameError : "Used as the project folder name."}
        </p>
      </div>

      <Card className="gap-0 py-0 shadow-xs">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="font-semibold">Your stack</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-x-6 px-2 py-2 sm:grid-cols-2">
          {getSummaryItems(catalog, selection).map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="truncate text-sm font-medium">{item.value ?? "—"}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onEditStep(item.step)}
                aria-label={`Edit ${item.label.toLowerCase()}`}
              >
                <Pencil />
              </Button>
            </div>
          ))}
        </CardContent>
        <div className="flex flex-wrap items-center gap-2 border-t px-5 py-4">
          <span className="mr-1 text-xs text-muted-foreground">Add-ons</span>
          {addons.length ? (
            addons.map((name) => (
              <Badge key={name} variant="secondary" className="rounded-full">
                {name}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">None</span>
          )}
          <Button
            type="button"
            variant="link"
            size="sm"
            className="ml-auto h-auto px-0"
            onClick={() => onEditStep("structure")}
          >
            Edit
          </Button>
        </div>
      </Card>

      <PreviewCard selection={selection} />
    </div>
  );
}

function PreviewCard({ selection }: { selection: SetupSelection }) {
  const { state, retry } = useProjectPreview(selection);

  return (
    <Card className="gap-0 py-0 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
        <CardTitle className="font-semibold">Project preview</CardTitle>
        {state.status === "success" && (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            {state.refreshing && <Loader2 className="size-3.5 animate-spin" aria-label="Updating" />}
            <Badge variant="secondary" className="rounded-full">
              {state.data.fileCount} files
            </Badge>
          </span>
        )}
      </CardHeader>

      {state.status === "loading" && <PreviewSkeleton />}

      {state.status === "error" && (
        <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
          <TriangleAlert className="size-6 text-destructive" />
          <p className="text-sm text-muted-foreground">{state.message}</p>
          <Button type="button" variant="outline" onClick={retry}>
            <RotateCw data-icon="inline-start" /> Try again
          </Button>
        </div>
      )}

      {state.status === "success" && (
        <div className="grid md:grid-cols-[1.1fr_1fr]">
          <div className="max-h-[26rem] overflow-y-auto border-b p-3 md:border-r md:border-b-0">
            <FileTree nodes={state.data.tree} />
          </div>
          <div className="space-y-6 p-5">
            <div>
              <p className="mb-2.5 flex items-center gap-2 text-sm font-medium">
                <Package className="size-4 text-primary" /> Dependencies
              </p>
              <div className="flex flex-wrap gap-1.5">
                {state.data.dependencies.map((dep) => (
                  <span
                    key={dep}
                    className="rounded-md border bg-muted/60 px-2 py-1 font-mono text-xs text-muted-foreground"
                  >
                    {dep}
                  </span>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <p className="mb-2.5 flex items-center gap-2 text-sm font-medium">
                <Terminal className="size-4 text-primary" /> Run your tests
              </p>
              <CommandBlock command={state.data.runCommand} />
            </div>
            <Separator />
            <RequiredSoftware prerequisites={state.data.prerequisites} />
            <Separator />
            <SetupSteps steps={state.data.setupSteps} />
          </div>
        </div>
      )}
    </Card>
  );
}

function RequiredSoftware({ prerequisites }: { prerequisites: Prerequisite[] }) {
  if (!prerequisites.length) return null;

  return (
    <div>
      <p className="mb-1 flex items-center gap-2 text-sm font-medium">
        <MonitorDown className="size-4 text-primary" /> Required software
      </p>
      <p className="mb-3 text-sm text-muted-foreground">
        Install these on your machine first.
      </p>
      <ul className="space-y-2.5">
        {prerequisites.map((item) => (
          <li key={item.name} className="flex items-start gap-2.5">
            <Check className="mt-1 size-3.5 shrink-0 text-primary" strokeWidth={3} />
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 underline-offset-4 hover:text-primary hover:underline"
                  >
                    {item.name}
                    <ExternalLink className="size-3 opacity-60" />
                  </a>
                ) : (
                  item.name
                )}
                <span className="font-mono text-xs font-normal text-muted-foreground">
                  {item.version}
                </span>
                {item.optional && (
                  <Badge variant="secondary" className="rounded-full font-normal">
                    Optional
                  </Badge>
                )}
              </p>
              {item.reason && (
                <p className="text-sm text-muted-foreground">{item.reason}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SetupSteps({ steps }: { steps: SetupStep[] }) {
  if (!steps.length) return null;

  return (
    <div>
      <p className="mb-1 flex items-center gap-2 text-sm font-medium">
        <ListOrdered className="size-4 text-primary" /> Set up the project
      </p>
      <p className="mb-3 text-sm text-muted-foreground">
        Run these once, in order, inside the project folder.
      </p>
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={step.command} className="flex gap-3">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-[11px] font-semibold text-primary">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="mb-1.5 text-sm">{step.label}</p>
              <CommandBlock command={step.command} />
              {step.note && (
                <p className="mt-1.5 text-xs text-muted-foreground">{step.note}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function CommandBlock({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be unavailable (insecure context); the command stays selectable.
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/60 py-1.5 pr-1.5 pl-3">
      <code className="min-w-0 flex-1 truncate font-mono text-[13px]">
        <span className="text-muted-foreground select-none">$ </span>
        {command}
      </code>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy command"}
      >
        {copied ? <Check className="text-success" /> : <Copy />}
      </Button>
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <div className="grid gap-6 p-5 md:grid-cols-2" aria-busy="true" aria-label="Loading preview">
      <div className="space-y-2.5">
        {[70, 55, 60, 45, 65, 50, 40].map((w, i) => (
          <Skeleton key={i} className="h-4" style={{ width: `${w}%`, marginLeft: `${(i % 3) * 12}px` }} />
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <div className="flex flex-wrap gap-1.5">
          {[16, 20, 14, 24].map((w, i) => (
            <Skeleton key={i} className="h-6" style={{ width: `${w * 4}px` }} />
          ))}
        </div>
        <Skeleton className="mt-6 h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
