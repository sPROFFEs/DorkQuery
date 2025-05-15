"use client"

import { useState, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
import { Search, Trash2, Github, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BlockPalette } from "../components/block-palette"
import { DorkCanvas } from "../components/dork-canvas"
import { DorkPreview } from "../components/dork-preview"
import { useMediaQuery } from "@/hooks/use-mobile"

// Define block types and their colors
export const BLOCK_TYPES = {
  SITE: { id: "site", label: "site:", color: "bg-blue-500", description: "Limit search to specific domain" },
  INURL: { id: "inurl", label: "inurl:", color: "bg-green-500", description: "Find pages with specific text in URL" },
  INTITLE: {
    id: "intitle",
    label: "intitle:",
    color: "bg-purple-500",
    description: "Find pages with specific text in title",
  },
  FILETYPE: { id: "filetype", label: "filetype:", color: "bg-orange-500", description: "Find specific file types" },
  EXT: { id: "ext", label: "ext:", color: "bg-pink-500", description: "Find files with specific extension" },
  INTEXT: {
    id: "intext",
    label: "intext:",
    color: "bg-yellow-500",
    description: "Find pages containing specific text",
  },
  LINK: { id: "link", label: "link:", color: "bg-indigo-500", description: "Find pages that link to specific URL" },
  CUSTOM: { id: "custom", label: "custom", color: "bg-gray-500", description: "Add custom text or operators" },
}

// Define search engines
const SEARCH_ENGINES = [
  { id: "google", name: "Google", url: "https://www.google.com/search?q=" },
  { id: "bing", name: "Bing", url: "https://www.bing.com/search?q=" },
  { id: "duckduckgo", name: "DuckDuckGo", url: "https://duckduckgo.com/?q=" },
  { id: "yahoo", name: "Yahoo", url: "https://search.yahoo.com/search?p=" },
]

export interface DorkBlock {
  id: string
  type: string
  value: string
}

export default function VisualDorkBuilder() {
  const [blocks, setBlocks] = useState<DorkBlock[]>([])
  const [dorkString, setDorkString] = useState("")
  const [searchEngine, setSearchEngine] = useState(SEARCH_ENGINES[0])
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Generate dork string whenever blocks change
  useEffect(() => {
    const newDorkString = blocks
      .map((block) => {
        if (block.type === "custom") {
          return block.value
        }
        return `${BLOCK_TYPES[block.type as keyof typeof BLOCK_TYPES].label}${block.value}`
      })
      .join(" ")
    setDorkString(newDorkString)
  }, [blocks])

  const handleAddBlock = (type: string) => {
    const newBlock: DorkBlock = {
      id: `block-${Date.now()}`,
      type,
      value: "",
    }
    setBlocks([...blocks, newBlock])
  }

  const handleUpdateBlock = (id: string, value: string) => {
    setBlocks(
      blocks.map((block) => {
        if (block.id === id) {
          return { ...block, value }
        }
        return block
      }),
    )
  }

  const handleRemoveBlock = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id))
  }

  const handleMoveBlock = (dragIndex: number, hoverIndex: number) => {
    const dragBlock = blocks[dragIndex]
    const newBlocks = [...blocks]
    newBlocks.splice(dragIndex, 1)
    newBlocks.splice(hoverIndex, 0, dragBlock)
    setBlocks(newBlocks)
  }

  const handleClearCanvas = () => {
    setBlocks([])
  }

  const handleSearch = () => {
    if (dorkString.trim()) {
      window.open(`${searchEngine.url}${encodeURIComponent(dorkString)}`, "_blank")
    }
  }

  return (
    <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="sticky top-0 z-10 border-b bg-white dark:bg-gray-800 shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="h-6 w-6 rounded bg-blue-500"></div>
                <div className="h-6 w-6 rounded bg-green-500"></div>
                <div className="h-6 w-6 rounded bg-purple-500"></div>
              </div>
              <h1 className="text-xl font-bold">Visual Dork Builder</h1>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/yourusername/visual-dork-builder"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
            {/* Block Palette */}
            <div className="order-2 md:order-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-4">Dork Blocks</h2>
                <BlockPalette blockTypes={BLOCK_TYPES} onAddBlock={handleAddBlock} />
              </div>

              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-4">Search Options</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Search Engine</label>
                    <Select
                      value={searchEngine.id}
                      onValueChange={(value) => {
                        const engine = SEARCH_ENGINES.find((e) => e.id === value)
                        if (engine) setSearchEngine(engine)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select search engine" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEARCH_ENGINES.map((engine) => (
                          <SelectItem key={engine.id} value={engine.id}>
                            {engine.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full" onClick={handleSearch} disabled={!dorkString.trim()}>
                    <Search className="mr-2 h-4 w-4" /> Search with {searchEngine.name}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleClearCanvas}
                    disabled={blocks.length === 0}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Clear Canvas
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Canvas and Preview */}
            <div className="order-1 md:order-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-4">Build Your Dork</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Drag blocks from the palette and drop them here. Connect them to build your dork query.
                </p>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg min-h-[300px] p-4">
                  <DorkCanvas
                    blocks={blocks}
                    blockTypes={BLOCK_TYPES}
                    onUpdateBlock={handleUpdateBlock}
                    onRemoveBlock={handleRemoveBlock}
                    onMoveBlock={handleMoveBlock}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-4">Generated Dork</h2>
                <DorkPreview dorkString={dorkString} />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <Tabs defaultValue="help">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="help">Help</TabsTrigger>
                    <TabsTrigger value="examples">Examples</TabsTrigger>
                  </TabsList>
                  <TabsContent value="help" className="mt-4 space-y-4">
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        <Info className="h-4 w-4" /> How to use this tool
                      </h3>
                      <ul className="mt-2 space-y-2 text-sm">
                        <li>1. Drag blocks from the palette to the canvas</li>
                        <li>2. Fill in the values for each block</li>
                        <li>3. Rearrange blocks by dragging them</li>
                        <li>4. Remove blocks by clicking the X button</li>
                        <li>5. See your dork query update in real-time</li>
                        <li>6. Select a search engine and click Search</li>
                      </ul>
                    </div>
                  </TabsContent>
                  <TabsContent value="examples" className="mt-4 space-y-4">
                    <div>
                      <h3 className="font-medium">Example Dorks</h3>
                      <ul className="mt-2 space-y-2 text-sm">
                        <li>
                          <code>site:github.com inurl:admin</code> - Find admin pages on GitHub
                        </li>
                        <li>
                          <code>filetype:pdf site:edu</code> - Find PDF files on educational sites
                        </li>
                        <li>
                          <code>intitle:"index of" intext:password</code> - Find directory listings with password files
                        </li>
                        <li>
                          <code>site:example.com ext:php intext:mysql</code> - Find PHP files with MySQL references
                        </li>
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t bg-white dark:bg-gray-800 py-4 mt-8">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Visual Dork Builder - Use responsibly and ethically</p>
          </div>
        </footer>
      </div>
    </DndProvider>
  )
}
