"use client"

import type React from "react"

import { useDrop } from "react-dnd"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { DorkBlockItem } from "@/app/page"

interface DropZoneProps {
  onDrop: (item: { type: string }) => void
  blocks: DorkBlockItem[]
  blockTypes: {
    id: string
    label: string
    icon: React.ReactNode
    description: string
    color: string
  }[]
  onUpdateBlock: (id: string, value: string) => void
  onRemoveBlock: (id: string) => void
}

export default function DropZone({ onDrop, blocks, blockTypes, onUpdateBlock, onRemoveBlock }: DropZoneProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "DORK_BLOCK",
    drop: (item: { type: string }) => {
      onDrop(item)
      return { name: "DropZone" }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  return (
    <div
      ref={drop}
      className={`min-h-[300px] rounded-md transition-colors
                ${isOver ? "bg-gray-800" : "bg-gray-900"}
                ${blocks.length === 0 ? "flex flex-col items-center justify-center" : "p-4"}`}
    >
      {blocks.length === 0 ? (
        <div className="text-center p-6">
          <p className="text-gray-400 mb-2">Your dork builder is empty</p>
          <p className="text-gray-500 text-sm">Add blocks from the sidebar to start building your dork query</p>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block) => {
            const blockType = blockTypes.find((type) => type.id === block.type)
            if (!blockType) return null

            return (
              <div key={block.id} className="flex items-center gap-2 group">
                <div className={`${blockType.color} rounded-l-md p-3 flex items-center`}>
                  <div className="bg-black bg-opacity-30 rounded-full p-1.5 mr-3">{blockType.icon}</div>
                  <span className="font-mono font-bold">{blockType.label}</span>
                </div>
                <Input
                  type="text"
                  value={block.value}
                  onChange={(e) => onUpdateBlock(block.id, e.target.value)}
                  placeholder={`Enter ${blockType.id === "custom" ? "custom term" : "value"}...`}
                  className="flex-1 bg-gray-800 border-gray-700 rounded-none rounded-r-md"
                />
                <button
                  onClick={() => onRemoveBlock(block.id)}
                  className="p-2 rounded-full hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove block"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
