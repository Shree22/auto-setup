"use client";

import { useEffect, useState } from "react";
import { getProjectPreview } from "./api";
import type { ProjectPreview, SetupSelection } from "./types";

type PreviewState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: ProjectPreview; refreshing: boolean };

/**
 * Fetches the generated-project preview for a selection.
 * Debounced so typing a project name doesn't fire a request per keystroke.
 */
export function useProjectPreview(selection: SetupSelection, debounceMs = 350) {
  const [state, setState] = useState<PreviewState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify(selection);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      setState((prev) =>
        prev.status === "success" ? { ...prev, refreshing: true } : { status: "loading" }
      );
      getProjectPreview(JSON.parse(key) as SetupSelection)
        .then((data) => {
          if (!cancelled) setState({ status: "success", data, refreshing: false });
        })
        .catch(() => {
          if (!cancelled)
            setState({ status: "error", message: "We couldn't load the project preview." });
        });
    }, debounceMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [key, attempt, debounceMs]);

  return { state, retry: () => setAttempt((n) => n + 1) };
}
