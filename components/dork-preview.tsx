"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DorkPreviewProps {
  dorkString: string
}

export function DorkPreview({ dorkString }: DorkPreviewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(dorkString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 font-mono text-sm break-all min-h-[60px]">
          {dorkString || <span className="text-gray-400 dark:text-gray-500">Your dork query will appear here</span>}
        </div>
        {dorkString && (
          <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span className="sr-only">{copied ? "Copied" : "Copy to clipboard"}</span>
          </Button>
        )}
      </div>
    </div>
  )
}
