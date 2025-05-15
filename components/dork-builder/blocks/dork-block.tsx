"use client";

import { useState } from "react";
import { DorkBlock as DorkBlockType } from "@/types/dork";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Globe,
  Link,
  File,
  Heading,
  FileText,
  History,
  Link2,
  Edit3,
  X,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface DorkBlockProps {
  block: DorkBlockType;
  onUpdate: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  isLast: boolean;
}

export function DorkBlock({ block, onUpdate, onRemove, isLast }: DorkBlockProps) {
  const [isFocused, setIsFocused] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
  };

  const getIcon = () => {
    switch (block.icon) {
      case 'globe': return <Globe className="h-4 w-4" />;
      case 'link': return <Link className="h-4 w-4" />;
      case 'file': return <File className="h-4 w-4" />;
      case 'heading': return <Heading className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      case 'history': return <History className="h-4 w-4" />;
      case 'link-2': return <Link2 className="h-4 w-4" />;
      case 'edit-3': return <Edit3 className="h-4 w-4" />;
      default: return <Edit3 className="h-4 w-4" />;
    }
  };

  return (
    <TooltipProvider>
      <div 
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={cn(
          "group relative flex items-center gap-1 rounded-md border bg-card p-2 shadow-sm transition-all duration-200",
          isFocused && "ring-2 ring-primary",
          isLast ? "mb-0" : "mb-2",
          isDragging && "opacity-50",
        )}
      >
        <div className="flex items-center gap-2 min-w-[80px]">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
            {getIcon()}
          </span>
          {block.type !== 'custom' && (
            <span className="font-mono text-sm font-semibold">
              {block.operator}
            </span>
          )}
        </div>

        <Input
          type="text"
          value={block.value}
          placeholder={block.placeholder}
          onChange={(e) => onUpdate(block.id, e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 border-none bg-transparent px-2 py-1 focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(block.id)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Remove block</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              {...listeners}
              variant="ghost"
              size="icon"
              className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 cursor-move rounded-full bg-muted opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Drag to reorder</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
