"use client";

import { useState } from "react";
import { ChevronRight, FileCode2, Folder, FolderOpen } from "lucide-react";
import type { FileNode } from "@/lib/setup/types";
import { cn } from "@/lib/utils";

export function FileTree({ nodes }: { nodes: FileNode[] }) {
  return (
    <ul role="tree" className="font-mono text-[13px]">
      {nodes.map((node) => (
        <TreeItem key={node.name} node={node} depth={0} />
      ))}
    </ul>
  );
}

function TreeItem({ node, depth }: { node: FileNode; depth: number }) {
  const [open, setOpen] = useState(true);
  const indent = { paddingLeft: `${depth * 16 + 8}px` };

  if (node.type === "file") {
    return (
      <li role="treeitem" aria-selected={false}>
        <div className="flex items-center gap-2 rounded-md py-1 pr-2 text-muted-foreground" style={indent}>
          <span className="w-3.5" />
          <FileCode2 className="size-4 shrink-0 opacity-70" />
          <span className="truncate">{node.name}</span>
        </div>
      </li>
    );
  }

  return (
    <li role="treeitem" aria-expanded={open} aria-selected={false}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-md py-1 pr-2 text-left transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        style={indent}
      >
        <ChevronRight
          className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")}
        />
        {open ? (
          <FolderOpen className="size-4 shrink-0 text-primary" />
        ) : (
          <Folder className="size-4 shrink-0 text-primary" />
        )}
        <span className="truncate font-medium">{node.name}</span>
      </button>
      {open && node.children && node.children.length > 0 && (
        <ul role="group">
          {node.children.map((child) => (
            <TreeItem key={child.name} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
