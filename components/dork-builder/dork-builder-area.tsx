"use client";

import { useEffect } from "react"; // useState is no longer needed here directly for blocks
import { DorkBlock as DorkBlockType, SearchEngine } from "@/types/dork"; // Keep SearchEngine if used, DorkBlockType as BlockType
import { DorkBlock as DorkBlockComponent } from "@/components/dork-builder/blocks/dork-block"; // Alias component import
// import { createNewBlock, formatDorkQuery } from "@/lib/dork-utils"; // No longer needed here
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  // DndContext,     // Removed
  // closestCenter,  // Removed
  // KeyboardSensor, // Will be used by DorkingInterface's DndContext or SortableContext items
  // PointerSensor,  // Will be used by DorkingInterface's DndContext
  // useSensor,      // Removed
  // useSensors,     // Removed
  DragEndEvent,   // Not directly used here anymore
} from "@dnd-kit/core";
import {
  // arrayMove, // This logic moves to DorkingInterface
  SortableContext,
  sortableKeyboardCoordinates, // Still needed for Sortable items
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core"; // Added for droppable area

interface DorkBuilderAreaProps {
  activeBlocks: DorkBlockType[];
  onUpdateBlockValue: (id: string, value: string) => void;
  onRemoveBlock: (id: string) => void;
  // onReorderBlocks prop is removed as DorkingInterface handles reordering via its onDragEnd
  onClearAllBlocks: () => void;
}

export function DorkBuilderArea({
  activeBlocks,
  onUpdateBlockValue,
  onRemoveBlock,
  onClearAllBlocks,
}: DorkBuilderAreaProps) {
  const { toast } = useToast();

  const { setNodeRef: setWorkspaceNodeRef, isOver: isWorkspaceOver } = useDroppable({
    id: 'workspace-area', // Unique ID for the droppable area
  });

  // Sensors and handleDragEnd are removed, DndContext is now in DorkingInterface.
  // Reordering logic is also handled by DorkingInterface.

  const handleClearAllInternal = () => {
    if (activeBlocks.length === 0) return;
    onClearAllBlocks(); // Call the prop
    toast({
      title: "Cleared all blocks",
      description: "All dork blocks have been removed from the workspace.",
      duration: 2000,
    });
  };

  // useEffect for onQueryChange has been removed as DorkingInterface will handle query logic

  return (
    // Attach droppable ref to the main container of the droppable area
    <div
      ref={setWorkspaceNodeRef}
      className={`flex flex-col w-full h-full transition-colors p-4 rounded-lg
                  ${isWorkspaceOver ? 'bg-primary/20 border-2 border-dashed border-primary' : 'bg-background/50 dark:bg-black/30 border border-transparent'}
                  min-h-[200px]`} // Added padding, rounded-lg, border, and min-height
                  // Subtle background pattern (example using radial gradient)
      style={{
        backgroundImage: !isWorkspaceOver
          ? 'radial-gradient(circle at 1px 1px, hsl(var(--muted)/0.3) 1px, transparent 0)'
          : 'none',
        backgroundSize: !isWorkspaceOver ? '10px 10px' : 'auto',
      }}
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Active Dork Workspace</h2>
        {activeBlocks.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-muted-foreground hover:text-destructive"
            onClick={handleClearAllInternal}
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All</span>
          </Button>
        )}
      </div>

      {/* The actual list area that shows blocks */}
      {/* Removed its own border and bg-card, p-4 to inherit from parent or be transparent */}
      <div className={`flex-1 overflow-y-auto rounded-md ${isWorkspaceOver ? 'bg-primary/10' : ''}`}>
        {activeBlocks.length === 0 ? (
          <div className="flex h-full min-h-[150px] flex-col items-center justify-center text-center text-muted-foreground py-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 mb-4">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
              <path d="M3 5v14a2 2 0 0 0 2 2h14v-5"></path>
              <path d="M18 12a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2z"></path>
              <path d="m11.5 3.5-1 1"></path><path d="m16.5 8.5-1 1"></path>
            </svg>
            <p className="text-lg font-medium mb-1">Workspace is Empty</p>
            <p className="text-sm">Drag dork blocks from the list on the left panel and drop them here to build your query.</p>
          </div>
        ) : (
          // DndContext has been removed from here.
          // SortableContext remains to enable reordering of items within this area.
          // The actual reordering logic is now handled by DorkingInterface's onDragEnd.
          <SortableContext
            items={activeBlocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {activeBlocks.map((block, index) => (
                <DorkBlockComponent
                  key={block.id}
                  block={block}
                  onUpdate={onUpdateBlockValue}
                  onRemove={onRemoveBlock}
                  isLast={index === activeBlocks.length - 1}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
}
