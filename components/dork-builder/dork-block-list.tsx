"use client";

import { DorkBlock } from "@/types/dork"; // Use DorkBlock directly
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
import { useDraggable } from "@dnd-kit/core";

interface PaletteBlockProps {
  block: DorkBlock;
  // No onRequestAddBlock needed if only D&D
}

function PaletteBlock({ block }: PaletteBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${block.id}-${block.operator}`, // Unique ID for palette items
    data: {
      type: block, // Store the full block object for use on drop
      isPaletteItem: true,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 1000 : 'auto', // Ensure dragging item is on top
    opacity: isDragging ? 0.7 : 1,
  } : {
    opacity: isDragging ? 0.8 : 1, // Slightly less opacity when dragging than workspace blocks
    zIndex: isDragging ? 1000 : 'auto',
  };

  // Color coding based on block type (consistent with DorkBlockComponent)
  const blockColorClasses = () => {
    switch (block.type) {
      case 'site': return 'bg-blue-500 hover:bg-blue-600 text-white border-blue-700';
      case 'filetype': return 'bg-green-500 hover:bg-green-600 text-white border-green-700';
      case 'inurl': return 'bg-orange-500 hover:bg-orange-600 text-white border-orange-700';
      case 'intitle': return 'bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-700';
      case 'intext': return 'bg-sky-500 hover:bg-sky-600 text-white border-sky-700';
      case 'custom': return 'bg-purple-500 hover:bg-purple-600 text-white border-purple-700';
      default: return 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white border-gray-400 dark:border-gray-500';
    }
  };

  const iconContainerColorClasses = () => {
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

  const getIcon = (iconName: string) => {
    const iconClass = "h-4 w-4"; // Slightly smaller icon for palette
    switch (iconName) {
      case 'globe': return <Globe className={iconClass} />;
      case 'link': return <Link className={iconClass} />;
      case 'file': return <File className={iconClass} />;
      case 'heading': return <Heading className={iconClass} />;
      case 'text': return <FileText className={iconClass} />;
      case 'history': return <History className={iconClass} />;
      case 'link-2': return <Link2 className={iconClass} />;
      case 'edit-3': return <Edit3 className={iconClass} />;
      default: return <Edit3 className={iconClass} />;
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div // Changed Button to div for more control over style without button defaults
          ref={setNodeRef}
          style={style}
          {...listeners}
          {...attributes}
          className={cn(
            "flex h-auto w-full items-center justify-start gap-2 p-2 rounded-md border-2 transition-all cursor-grab shadow-sm", // p-2 for smaller padding
            blockColorClasses(),
            isDragging && "ring-2 ring-offset-1 ring-white dark:ring-offset-black shadow-lg scale-105" // Enhanced dragging feedback
          )}
        >
          <span className={cn(
            "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md", // Slightly smaller icon container
            iconContainerColorClasses()
          )}>
            {getIcon(block.icon)}
          </span>
          <div className="text-left overflow-hidden">
            <p className="font-mono text-xs font-semibold truncate"> {/* text-xs for smaller font */}
              {block.operator}
            </p>
            <p className="text-xs text-white/80 dark:text-white/70 truncate"> {/* Adjusted for colored background */}
              {block.description}
                    </p>
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[200px]">
                <p>{block.description}</p>
              </TooltipContent>
            </Tooltip>
  );
}


interface DorkBlockListProps {
  predefinedBlocks: DorkBlock[];
  customBlocks: DorkBlock[];
  // onRequestAddBlock is removed
}

export function DorkBlockList({
  predefinedBlocks,
  customBlocks,
}: DorkBlockListProps) {
  const allBlocks = [...predefinedBlocks, ...customBlocks];

  return (
    <div className="w-full rounded-lg border bg-card p-4">
      <h2 className="mb-4 text-lg font-semibold">Available Dork Blocks</h2>
      <p className="text-xs text-muted-foreground mb-3">Drag blocks to the workspace on the right.</p>
      <TooltipProvider>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-1">
          {allBlocks.map((block) => (
            <PaletteBlock key={`${block.id}-${block.operator}`} block={block} />
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}