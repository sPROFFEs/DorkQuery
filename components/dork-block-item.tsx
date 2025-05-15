"use client"

import { useRef } from "react"
import { useDrag, useDrop } from "react-dnd"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { DorkBlock } from "../app/page"

interface DorkBlockItemProps {
  index: number
  block: DorkBlock
  blockType: { id: string; label: string; color: string; description: string }
  onUpdateBlock: (id: string, value: string) => void
  onRemoveBlock: (id: string) => void
  onMoveBlock: (dragIndex: number, hoverIndex: number) => void
}

interface DragItem {
  index: number
  id: string
  type: string
}

export function DorkBlockItem({
  index,
  block,
  blockType,
  onUpdateBlock,
  onRemoveBlock,
  onMoveBlock,
}: DorkBlockItemProps) {
  const ref = useRef<HTMLDivElement>(null)

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | null }>({
    accept: "BLOCK_ITEM",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      onMoveBlock(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: "BLOCK_ITEM",
    item: () => {
      return { id: block.id, index }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  drag(drop(ref))

  return (
    <div
      ref={ref}
      className={`flex items-center gap-2 ${isDragging ? "opacity-50" : "opacity-100"} transition-opacity`}
      data-handler-id={handlerId}
    >
      <div className={`${blockType.color} rounded-l-lg p-3 cursor-grab text-white font-medium flex-shrink-0`}>
        {blockType.label}
      </div>
      <Input
        type="text"
        value={block.value}
        onChange={(e) => onUpdateBlock(block.id, e.target.value)}
        placeholder={block.type === "custom" ? "Enter custom text..." : "Enter value..."}
        className="rounded-none rounded-r-lg border-l-0 flex-grow"
      />
      <button
        onClick={() => onRemoveBlock(block.id)}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="Remove block"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
