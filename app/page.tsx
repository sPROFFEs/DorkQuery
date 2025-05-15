"use client"

import { useState, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import {
  Search,
  Globe,
  Link,
  FileText,
  Type,
  File,
  Clock,
  Share2,
  Edit,
  Github,
  Shield,
  Moon,
  Sun,
  Copy,
} from "lucide-react"
import DorkBlock from "@/components/DorkBlock"
import DropZone from "@/components/DropZone"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define the block types with their properties
const BLOCK_TYPES = [
  {
    id: "site",
    label: "site:",
    icon: <Globe className="h-5 w-5" />,
    description: "Search within a specific domain",
    color: "bg-blue-600",
  },
  {
    id: "inurl",
    label: "inurl:",
    icon: <Link className="h-5 w-5" />,
    description: "Search for pages with a specific URL",
    color: "bg-green-600",
  },
  {
    id: "filetype",
    label: "filetype:",
    icon: <FileText className="h-5 w-5" />,
    description: "Search for specific file types",
    color: "bg-orange-600",
  },
  {
    id: "intitle",
    label: "intitle:",
    icon: <Type className="h-5 w-5" />,
    description: "Search for pages with a specific title",
    color: "bg-purple-600",
  },
  {
    id: "intext",
    label: "intext:",
    icon: <File className="h-5 w-5" />,
    description: "Search for pages containing specific text",
    color: "bg-yellow-600",
  },
  {
    id: "cache",
    label: "cache:",
    icon: <Clock className="h-5 w-5" />,
    description: "Show Google's cached version of a page",
    color: "bg-red-600",
  },
  {
    id: "related",
    label: "related:",
    icon: <Share2 className="h-5 w-5" />,
    description: "Find sites related to a given URL",
    color: "bg-indigo-600",
  },
  {
    id: "custom",
    label: "Custom",
    icon: <Edit className="h-5 w-5" />,
    description: "Add a custom search term",
    color: "bg-gray-600",
  },
]

// Define search engines
const SEARCH_ENGINES = [
  { id: "google", name: "Google" },
  { id: "bing", name: "Bing" },
  { id: "duckduckgo", name: "DuckDuckGo" },
  { id: "yahoo", name: "Yahoo" },
]

// Define the block interface
export interface DorkBlockItem {
  id: string
  type: string
  value: string
}

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [droppedBlocks, setDroppedBlocks] = useState<DorkBlockItem[]>([])
  const [searchEngine, setSearchEngine] = useState(SEARCH_ENGINES[0])
  const [dorkQuery, setDorkQuery] = useState("")

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Update document class when theme changes
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(theme)
  }, [theme])

  // Generate dork query whenever blocks change
  useEffect(() => {
    const query = droppedBlocks
      .map((block) => {
        const blockType = BLOCK_TYPES.find((type) => type.id === block.type)
        if (block.type === "custom") {
          return block.value
        }
        return `${blockType?.label}${block.value}`
      })
      .join(" ")

    setDorkQuery(query)
  }, [droppedBlocks])

  // Handle dropping a block
  const handleDrop = (item: { type: string }) => {
    const newBlock: DorkBlockItem = {
      id: `block-${Date.now()}`,
      type: item.type,
      value: "",
    }
    setDroppedBlocks([...droppedBlocks, newBlock])
  }

  // Handle updating a block's value
  const handleUpdateBlock = (id: string, value: string) => {
    setDroppedBlocks(
      droppedBlocks.map((block) => {
        if (block.id === id) {
          return { ...block, value }
        }
        return block
      }),
    )
  }

  // Handle removing a block
  const handleRemoveBlock = (id: string) => {
    setDroppedBlocks(droppedBlocks.filter((block) => block.id !== id))
  }

  // Handle copying the dork query
  const handleCopyQuery = () => {
    navigator.clipboard.writeText(dorkQuery)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`min-h-screen bg-black text-white`}>
        {/* Header */}
        <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            <h1 className="text-xl font-bold">Visual Dork Builder</h1>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:text-gray-300"
            >
              <Github className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a href="#" className="flex items-center hover:text-gray-300">
              <Shield className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Responsible Use</span>
            </a>
            <button onClick={toggleTheme} className="p-1 rounded-full hover:bg-gray-800">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4">
          {/* Title and Search Engine Selector */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-xl font-bold mb-2 sm:mb-0">Build Your Dork Query</h2>
            <div className="flex items-center">
              <span className="mr-2">Search Engine:</span>
              <Select
                value={searchEngine.id}
                onValueChange={(value) => {
                  const engine = SEARCH_ENGINES.find((e) => e.id === value)
                  if (engine) setSearchEngine(engine)
                }}
              >
                <SelectTrigger className="w-[130px] bg-gray-900 border-gray-700">
                  <SelectValue placeholder="Select engine" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  {SEARCH_ENGINES.map((engine) => (
                    <SelectItem key={engine.id} value={engine.id}>
                      {engine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
            {/* Sidebar with Draggable Blocks */}
            <div className="bg-gray-900 border border-gray-800 rounded-md p-4">
              <h3 className="text-lg font-bold mb-4">Dork Blocks</h3>
              <div className="space-y-3">
                {BLOCK_TYPES.map((blockType) => (
                  <DorkBlock
                    key={blockType.id}
                    id={blockType.id}
                    label={blockType.label}
                    icon={blockType.icon}
                    description={blockType.description}
                    color={blockType.color}
                  />
                ))}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="space-y-4">
              {/* Dork Builder Drop Zone */}
              <div className="bg-gray-900 border border-gray-800 rounded-md p-4">
                <h3 className="text-lg font-bold mb-4">Dork Builder</h3>
                <DropZone
                  onDrop={handleDrop}
                  blocks={droppedBlocks}
                  blockTypes={BLOCK_TYPES}
                  onUpdateBlock={handleUpdateBlock}
                  onRemoveBlock={handleRemoveBlock}
                />
              </div>

              {/* Generated Query Display */}
              <div className="bg-gray-900 border border-gray-800 rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Generated Dork Query</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyQuery}
                    disabled={!dorkQuery}
                    className="border-gray-700 hover:bg-gray-800"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="bg-gray-800 rounded-md p-3 font-mono text-sm min-h-[60px]">
                  {dorkQuery ? dorkQuery : <span className="text-gray-500">Your dork query will appear here...</span>}
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  {!dorkQuery && "Add blocks from the sidebar to build your dork query."}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DndProvider>
  )
}
