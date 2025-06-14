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
    zIndex: isDragging ? 100 : 1, // Higher zIndex when dragging
    opacity: isDragging ? 0.9 : 1,
  };

  // Color coding based on block type
  const blockColorClasses = () => {
    switch (block.type) {
      case 'site':
        return 'bg-blue-500 hover:bg-blue-600 text-white border-blue-700';
      case 'filetype':
        return 'bg-green-500 hover:bg-green-600 text-white border-green-700';
      case 'inurl':
        return 'bg-orange-500 hover:bg-orange-600 text-white border-orange-700';
      case 'intitle':
        return 'bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-700'; // Text black for yellow bg
      case 'intext':
        return 'bg-sky-500 hover:bg-sky-600 text-white border-sky-700';
      case 'custom':
        return 'bg-purple-500 hover:bg-purple-600 text-white border-purple-700';
      default:
        return 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-gray-400 dark:border-gray-500';
    }
  };

  const iconContainerColorClasses = () => {
    // Slightly lighter/darker version for icon container, or specific colors
    switch (block.type) {
      case 'site': return 'bg-blue-400 dark:bg-blue-600';
      case 'filetype': return 'bg-green-400 dark:bg-green-600';
      case 'inurl': return 'bg-orange-400 dark:bg-orange-600';
      case 'intitle': return 'bg-yellow-400 dark:bg-yellow-600';
      case 'intext': return 'bg-sky-400 dark:bg-sky-600';
      case 'custom': return 'bg-purple-400 dark:bg-purple-600';
      default: return 'bg-gray-200 dark:bg-gray-500';
    }
  }

  const getIcon = () => {
    const iconClass = "h-5 w-5"; // Slightly larger icons
    switch (block.icon) {
      case 'globe': return <Globe className={iconClass} />;
      case 'link': return <Link className={iconClass} />;
      case 'file': return <File className={iconClass} />;
      case 'heading': return <Heading className={iconClass} />;
      case 'text': return <FileText className={iconClass} />;
      case 'history': return <History className={iconClass} />;
      case 'link-2': return <Link2 className={iconClass} />;
      case 'edit-3': return <Edit3 className={iconClass} />; // Default for custom and others
      default: return <Edit3 className={iconClass} />;
    }
  };

  return (
    <TooltipProvider>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes} // Spread attributes for useSortable, but not listeners yet
        className={cn(
          "group relative flex items-center gap-2 rounded-lg border-2 p-2.5 shadow-md transition-all duration-150 ease-in-out",
          blockColorClasses(),
          isFocused && "ring-2 ring-offset-2 ring-white dark:ring-offset-black", // Focus ring
          isLast ? "mb-0" : "mb-3", // Slightly more margin
          isDragging && "shadow-xl scale-105" // Enhanced dragging feedback
        )}
      >
        {/* Drag Handle - now part of the main block structure */}
        <button
          {...listeners} // Listeners specifically on the drag handle
          className={cn(
            "p-1 rounded-md cursor-grab",
            "focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1", // Ensure drag handle focus is visible
            "opacity-70 group-hover:opacity-100 transition-opacity"
          )}
          aria-label="Drag to reorder block"
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md flex-shrink-0", // Rounded-md for icon container
          iconContainerColorClasses()
        )}>
          {getIcon()}
        </div>

        {/* Operator - ensure it's visible with new background */}
        <span className="font-mono text-sm font-semibold select-none">
          {block.operator}
        </span>

        <Input
          type="text"
          value={block.value}
          placeholder={block.placeholder}
          onChange={(e) => onUpdate(block.id, e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "flex-1 px-2 py-1 h-auto rounded-md border-none focus-visible:ring-0 focus-visible:ring-offset-0",
            "bg-white/20 dark:bg-black/20 placeholder:text-white/70 dark:placeholder:text-black/70", // Blended input
            "focus:bg-white/30 dark:focus:bg-black/30" // Slightly more opaque on focus
          )}
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 opacity-70 group-hover:opacity-100 transition-opacity rounded-md",
                "hover:bg-white/20 dark:hover:bg-black/20 focus-visible:ring-2 focus-visible:ring-white"
              )}
              onClick={() => onRemove(block.id)}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Remove block</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top"><p>Remove block</p></TooltipContent>
        </Tooltip>

        {/* Tooltip for drag handle is removed as the handle is now always visible and part of the block */}
      </div>
    </TooltipProvider>
  );
}
