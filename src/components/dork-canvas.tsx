import { useDrop } from "react-dnd"
import type { DorkBlock } from "../App"
import { DorkBlockItem } from "./dork-block-item"

interface DorkCanvasProps {
  blocks: DorkBlock[]
  blockTypes: Record<string, { id: string; label: string; color: string; description: string }>
  onUpdateBlock: (id: string, value: string) => void
  onRemoveBlock: (id: string) => void
  onMoveBlock: (dragIndex: number, hoverIndex: number) => void
}

export function DorkCanvas({ blocks, blockTypes, onUpdateBlock, onRemoveBlock, onMoveBlock }: DorkCanvasProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "BLOCK",
    drop: (item: { type: string }) => {
      return { name: "Canvas" }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  return (
    <div
      ref={drop}
      className={`min-h-[200px] transition-colors ${
        isOver && blocks.length === 0 ? "bg-gray-200 dark:bg-gray-600" : ""
      } ${blocks.length === 0 ? "flex items-center justify-center" : ""}`}
    >
      {blocks.length === 0 ? (
        <div className="text-center text-gray-400 dark:text-gray-500">
          <p>Drag blocks here or click on blocks in the palette</p>
        </div>
      ) : (
        <div className="space-y-2">
          {blocks.map((block, index) => (
            <DorkBlockItem
              key={block.id}
              index={index}
              block={block}
              blockType={blockTypes[block.type as keyof typeof blockTypes]}
              onUpdateBlock={onUpdateBlock}
              onRemoveBlock={onRemoveBlock}
              onMoveBlock={onMoveBlock}
            />
          ))}
        </div>
      )}
    </div>
  )
}
