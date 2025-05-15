"use client";

import { PREDEFINED_DORK_BLOCKS } from "@/lib/dork-utils";
import { DorkBlock as DorkBlockType } from "@/types/dork";
import { cn } from "@/lib/utils";
import {
  Globe,
  Link,
  File,
  Heading,
  FileText,
  History,
  Link2,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DorkBlockListProps {
  onAddBlock: (block: DorkBlockType) => void;
}

export function DorkBlockList({ onAddBlock }: DorkBlockListProps) {
  // Map block type to corresponding icon
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'globe':
        return <Globe className="h-5 w-5" />;
      case 'link':
        return <Link className="h-5 w-5" />;
      case 'file':
        return <File className="h-5 w-5" />;
      case 'heading':
        return <Heading className="h-5 w-5" />;
      case 'text':
        return <FileText className="h-5 w-5" />;
      case 'history':
        return <History className="h-5 w-5" />;
      case 'link-2':
        return <Link2 className="h-5 w-5" />;
      case 'edit-3':
        return <Edit3 className="h-5 w-5" />;
      default:
        return <Edit3 className="h-5 w-5" />;
    }
  };

  return (
    <div className="w-full rounded-lg border bg-card p-4">
      <h2 className="mb-4 text-lg font-semibold">Dork Blocks</h2>
      <TooltipProvider>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
          {PREDEFINED_DORK_BLOCKS.map((block) => (
            <Tooltip key={block.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="flex h-auto items-center justify-start gap-2 p-3 hover:bg-accent hover:text-accent-foreground transition-all"
                  onClick={() => onAddBlock(block)}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                    {getIcon(block.icon)}
                  </span>
                  <div className="text-left">
                    <p className="font-mono text-sm font-semibold">
                      {block.type === 'custom' ? 'Custom' : block.operator}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {block.description.length > 25 
                        ? `${block.description.substring(0, 25)}...` 
                        : block.description}
                    </p>
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[200px]">
                <p>{block.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}