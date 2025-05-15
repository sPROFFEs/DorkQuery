"use client";

import { useState, useEffect } from "react";
import { DorkBlock as DorkBlockType, SearchEngine } from "@/types/dork";
import { DorkBlock } from "@/components/dork-builder/blocks/dork-block";
import { createNewBlock, formatDorkQuery } from "@/lib/dork-utils";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface DorkBuilderAreaProps {
  onQueryChange: (query: string) => void;
  selectedEngine: SearchEngine;
  onAddBlock?: (block: DorkBlockType) => void;
}

export function DorkBuilderArea({ 
  onQueryChange, 
  selectedEngine,
  onAddBlock 
}: DorkBuilderAreaProps) {
  const [blocks, setBlocks] = useState<DorkBlockType[]>([]);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddBlock = (block: DorkBlockType) => {
    const newBlock = createNewBlock(block);
    setBlocks((prev) => [...prev, newBlock]);

    if (onAddBlock) onAddBlock(block);

    toast({
      title: "Block added",
      description: `Added ${block.type === 'custom' ? 'custom' : block.operator} block`,
      duration: 2000,
    });
  };

  const handleUpdateBlock = (id: string, value: string) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === id ? { ...block, value } : block
      )
    );
  };

  const handleRemoveBlock = (id: string) => {
    setBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((blocks) => {
        const oldIndex = blocks.findIndex((block) => block.id === active.id);
        const newIndex = blocks.findIndex((block) => block.id === over.id);
        return arrayMove(blocks, oldIndex, newIndex);
      });
    }
  };

  const handleClearAll = () => {
    if (blocks.length === 0) return;
    setBlocks([]);
    toast({
      title: "Cleared all blocks",
      description: "All dork blocks have been removed.",
      duration: 2000,
    });
  };

  useEffect(() => {
    const formattedQuery = formatDorkQuery(blocks, selectedEngine);
    onQueryChange(formattedQuery);
  }, [blocks, selectedEngine, onQueryChange]);

  return (
    <div className="flex flex-col max-w-2xl mx-auto w-full h-full px-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dork Builder</h2>
        {blocks.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-muted-foreground hover:text-destructive"
            onClick={handleClearAll}
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All</span>
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto rounded-lg border bg-card p-4">
        {blocks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
            <p className="mb-2">Your dork builder is empty</p>
            <p className="text-sm">Add blocks from the sidebar to start building your dork query</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {blocks.map((block, index) => (
                  <DorkBlock
                    key={block.id}
                    block={block}
                    onUpdate={handleUpdateBlock}
                    onRemove={handleRemoveBlock}
                    isLast={index === blocks.length - 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
