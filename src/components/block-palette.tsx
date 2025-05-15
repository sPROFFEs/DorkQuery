"use client"

import { useDrag } from "react-dnd"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

interface BlockPaletteProps {
  blockTypes: Record<string, { id: string; label: string; color: string; description: string }>
  onAddBlock: (type: string) => void
}

export function BlockPalette({ blockTypes, onAddBlock }: BlockPaletteProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Object.values(blockTypes).map((blockType) => (
        <PaletteItem key={blockType.id} blockType={blockType} onAddBlock={onAddBlock} />
      ))}
    </div>
  )
}

interface PaletteItemProps {
  blockType: { id: string; label: string; color: string; description: string }
  onAddBlock: (type: string) => void
}

function PaletteItem({ blockType, onAddBlock }: PaletteItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "BLOCK",
    item: { type: blockType.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={drag}
            className={`${blockType.color} rounded-lg p-3 cursor-grab shadow-sm hover:shadow-md transition-shadow
                      ${isDragging ? "opacity-50" : "opacity-100"}
                      flex items-center justify-center text-white font-medium`}
            onClick={() => onAddBlock(blockType.id)}
          >
            {blockType.label}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{blockType.description}</p>
          <p className="text-xs mt-1">Click or drag to add</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
