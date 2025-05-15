"use client"

import type React from "react"

import { useDrag } from "react-dnd"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DorkBlockProps {
  id: string
  label: string
  icon: React.ReactNode
  description: string
  color: string
}

export default function DorkBlock({ id, label, icon, description, color }: DorkBlockProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "DORK_BLOCK",
    item: { type: id },
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
            className={`${color} rounded-md p-3 cursor-grab transition-all
                      ${isDragging ? "opacity-50" : "opacity-100"}
                      hover:brightness-110 active:brightness-90
                      flex items-center`}
          >
            <div className="bg-black bg-opacity-30 rounded-full p-1.5 mr-3">{icon}</div>
            <div>
              <div className="font-mono font-bold">{label}</div>
              <div className="text-xs text-white text-opacity-80 line-clamp-1">{description}</div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
