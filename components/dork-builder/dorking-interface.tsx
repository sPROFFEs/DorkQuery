"use client";

import { useState, useEffect } from "react";

// @dnd-kit imports
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

// Local type imports
import { DorkBlock, DorkBlockType, SearchEngine } from "@/types/dork";
import { GhdbEntry } from "@/lib/ghdb-service";

// Local util/service imports
import { PREDEFINED_DORK_BLOCKS, createNewBlock, formatDorkQuery, generateSearchUrl, generateId } from "@/lib/dork-utils";

// Local component imports
import { DorkBlockList } from "./dork-block-list";
import { DorkBuilderArea } from "./dork-builder-area";
import { CustomBlockManager } from "./custom-block-manager";
import { GhdbExplorer } from "./ghdb-explorer";

// Hook imports
import { useToast } from "@/hooks/use-toast";

// UI component imports
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


export function DorkingInterface() {
  const { toast } = useToast(); // Initialize toast
  // Migrated State
  const [activeBlocks, setActiveBlocks] = useState<DorkBlock[]>([]);
  const [customBlocks, setCustomBlocks] = useState<DorkBlock[]>(() => {
    // Load custom blocks from LocalStorage on initial mount
    if (typeof window !== 'undefined') {
      const savedCustomBlocks = localStorage.getItem('dorklabsCustomBlocks');
      if (savedCustomBlocks) {
        try {
          const parsedBlocks = JSON.parse(savedCustomBlocks);
          // TODO: Add validation here to ensure parsedBlocks is an array of DorkBlock
          if (Array.isArray(parsedBlocks)) { // Basic check
            return parsedBlocks;
          }
        } catch (error) {
          console.error("Error parsing custom blocks from LocalStorage:", error);
          // Fallback to empty array if parsing fails
        }
      }
    }
    return [];
  });
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>("google");

  // Effect to save customBlocks to LocalStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dorklabsCustomBlocks', JSON.stringify(customBlocks));
    }
  }, [customBlocks]);

  const handleEngineChange = (engine: SearchEngine) => {
    setSelectedEngine(engine);
  };

  // Placeholder for addBlockToWorkspace
  const handleRequestAddBlockToWorkspace = (blockTemplate: DorkBlock) => {
    // Create a new instance of the block for the workspace
    const newBlockInstance: DorkBlock = {
      ...blockTemplate, // Spread the template
      id: generateId(),   // Give it a new unique ID for the workspace
      value: "",          // Ensure value is empty initially for the workspace
    };
    setActiveBlocks(prev => [...prev, newBlockInstance]);
  };

  // Renamed for clarity from placeholder
  const updateActiveBlockValue = (id: string, newValue: string) => {
    setActiveBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === id ? { ...block, value: newValue } : block
      )
    );
  };

  // Placeholder for removeActiveBlock
  const removeActiveBlock = (id: string) => {
    setActiveBlocks(prevBlocks => prevBlocks.filter(block => block.id !== id));
  };

  // Placeholder for buildQuery
  const buildQuery = (): string => {
    return formatDorkQuery(activeBlocks, selectedEngine);
  };

  // Placeholder for executeSearch
  const executeSearch = () => {
    const query = buildQuery();
    if (!query) {
      alert("Add at least one block with a value");
      return;
    }
    const url = generateSearchUrl(query, selectedEngine);
    window.open(url, "_blank");
  };

  // Renamed for clarity from placeholder
  const handleSaveCustomBlockToList = (newCustomBlock: DorkBlock) => {
    setCustomBlocks(prev => [...prev, newCustomBlock]);
  };

  const handleClearAllActiveBlocks = () => {
    setActiveBlocks([]);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require the mouse to move by 10 pixels before initiating a drag
      // Useful to prevent drags interfering with clicks on buttons inside draggables
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor) // No specific options needed for basic keyboard support
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return; // Dropped outside of a valid target

    const activeId = String(active.id);
    const overId = String(over.id);

    // Scenario 1: Drag from Palette to Workspace
    if (activeId.startsWith('palette-') && overId === 'workspace-area') {
      const blockType = active.data.current?.type as DorkBlock; // Get the block data
      if (blockType) {
        handleRequestAddBlockToWorkspace(blockType); // This function already creates a new instance
      }
      return;
    }

    // Scenario 2: Reordering within Workspace
    // Check if both active and over are part of activeBlocks (not the workspace itself or palette)
    const isActiveBlockItem = activeBlocks.find(b => b.id === activeId);
    const isOverBlockItem = activeBlocks.find(b => b.id === overId);

    if (isActiveBlockItem && isOverBlockItem && activeId !== overId) {
      const oldIndex = activeBlocks.findIndex((block) => block.id === activeId);
      const newIndex = activeBlocks.findIndex((block) => block.id === overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        setActiveBlocks((items) => arrayMove(items, oldIndex, newIndex));
      }
      return;
    }

    // Potentially other scenarios, like dragging from palette directly onto another block in workspace (to insert)
    // For now, only handle direct drop on workspace area or reorder within workspace
  };

  const handleImportGhdbDork = (entry: GhdbEntry) => {
    const newBlock: DorkBlock = {
      id: generateId(), // New unique ID for the workspace instance
      type: 'custom', // Treat imported dorks as 'custom' type for now
      operator: "",    // Operator is empty, dork string goes into value
      value: entry.dork,
      placeholder: "Imported GHDB dork",
      description: entry.title, // Use GHDB title as description
      icon: 'edit-3', // Use 'edit-3' as confirmed available
    };
    setActiveBlocks(prev => [...prev, newBlock]);
    toast({
      title: "GHDB Dork Imported",
      description: `"${entry.dork}" added to your workspace.`,
    });
  };

  // Render Structure with DndContext
  return (
    // Using minimal DndContext props for this test
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 h-full"> {/* Ensure h-full for flex children */}
        {/* Left Panel: Tabs for Palette and GHDB Explorer */}
        <div className="space-y-6 md:col-span-1 flex flex-col h-full"> {/* flex flex-col h-full */}
          <Tabs defaultValue="palette" className="flex-grow flex flex-col bg-card rounded-lg shadow">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="palette">Palette</TabsTrigger>
              <TabsTrigger value="ghdb">GHDB</TabsTrigger>
            </TabsList>
            <TabsContent value="palette" className="flex-grow overflow-y-auto p-4 space-y-4">
              <DorkBlockList
                predefinedBlocks={PREDEFINED_DORK_BLOCKS}
                customBlocks={customBlocks}
              />
              <CustomBlockManager
                onSaveCustomBlock={handleSaveCustomBlockToList}
                customBlocks={customBlocks}
              />
            </TabsContent>
            <TabsContent value="ghdb" className="flex-grow overflow-y-auto p-0"> {/* p-0 as GhdbExplorer has its own Card padding */}
              <GhdbExplorer onImportDork={handleImportGhdbDork} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel: DorkBuilderArea and Search Controls */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              {/* Title for DorkBuilderArea can be inside the component itself or here */}
            </CardHeader>
            <CardContent>
              <DorkBuilderArea
                activeBlocks={activeBlocks}
                onUpdateBlockValue={updateActiveBlockValue}
                onRemoveBlock={removeActiveBlock}
                onClearAllBlocks={handleClearAllActiveBlocks}
                // onReorderBlocks prop is removed
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
            <CardTitle>Search Engine</CardTitle>
            <CardDescription>
              Select one search engine
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(["google", "bing", "duckduckgo"] as const).map(
              (engine) => (
                <div key={engine} className="flex items-center space-x-2 mb-2">
                  <input
                    type="radio"
                    id={`engine-${engine}-interface`} // Ensure unique ID
                    name="search-engine-interface"   // Ensure unique name
                    checked={selectedEngine === engine}
                    onChange={() => handleEngineChange(engine)}
                    className="cursor-pointer"
                  />
                  <label
                    htmlFor={`engine-${engine}-interface`}
                    className="cursor-pointer select-none"
                  >
                    {engine.charAt(0).toUpperCase() + engine.slice(1)}
                  </label>
                </div>
              )
            )}
          </CardContent>
        </Card>

        <Button
          className="w-full"
          onClick={executeSearch}
          disabled={activeBlocks.length === 0 || activeBlocks.every(b => !b.value.trim())}
        >
          <Search className="mr-2 h-4 w-4" /> Search {selectedEngine.charAt(0).toUpperCase() + selectedEngine.slice(1)}
        </Button>
      </div>
    </div>
  );
}
