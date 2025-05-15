"use client"

import { useState, useEffect } from "react"
import {
  Moon,
  Sun,
  Search,
  Info,
  ExternalLink,
  Code,
  PlusCircle,
  Trash2,
  Edit2,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface DorkBlock {
  id: string
  type: DorkBlockType
  operator: string
  value: string
  placeholder: string
  description: string
}

// Additional advanced dorks and exploit-based dorks
const EXPLOIT_DB_DORKS = [
  {
    type: "exploitdb",
    operator: "inurl:",
    placeholder: "view/index.shtml",
    description: "Common vulnerable paths (ExploitDB)",
  },
  {
    type: "exploitdb",
    operator: "intitle:",
    placeholder: "index of /admin",
    description: "Directory listing for admin portals",
  },
  {
    type: "exploitdb",
    operator: "filetype:sql",
    placeholder: "passwords",
    description: "Possible SQL dump with passwords",
  },
  {
    type: "exploitdb",
    operator: "ext:log",
    placeholder: "error",
    description: "Publicly exposed .log files",
  },
  {
    type: "exploitdb",
    operator: "filetype:conf",
    placeholder: "apache",
    description: "Configuration files exposed",
  },
  {
    type: "exploitdb",
    operator: "inurl:login",
    placeholder: "admin",
    description: "Common login pages indexed",
  },
  {
    type: "exploitdb",
    operator: "ext:bak",
    placeholder: "config",
    description: "Backup configuration files exposed",
  }
]

const PREDEFINED_BLOCKS = [
  {
    type: "site",
    operator: "site:",
    placeholder: "example.com",
    description: "Search within a specific website or domain",
  },
  {
    type: "inurl",
    operator: "inurl:",
    placeholder: "admin",
    description: "Search for pages with a specific word in the URL",
  },
  {
    type: "filetype",
    operator: "filetype:",
    placeholder: "pdf",
    description: "Search for specific file types",
  },
  {
    type: "intitle",
    operator: "intitle:",
    placeholder: "index of",
    description: "Search for pages with a specific word in the title",
  },
  {
    type: "intext",
    operator: "intext:",
    placeholder: "password",
    description: "Search for pages containing specific text",
  },
  {
    type: "cache",
    operator: "cache:",
    placeholder: "example.com",
    description: "Show Google’s cached version of a page",
  },
  {
    type: "related",
    operator: "related:",
    placeholder: "example.com",
    description: "Find sites related to a given domain",
  },
  {
    type: "ext",
    operator: "ext:",
    placeholder: "log",
    description: "Search by file extension (alternative to filetype)",
  },
  {
    type: "allintext",
    operator: "allintext:",
    placeholder: "login password",
    description: "Find pages containing all specified words in the text",
  },
  {
    type: "allintitle",
    operator: "allintitle:",
    placeholder: "admin login",
    description: "Find pages containing all specified words in the title",
  },
  {
    type: "allinurl",
    operator: "allinurl:",
    placeholder: "admin login",
    description: "Find pages containing all specified words in the URL",
  },
  {
    type: "allinanchor",
    operator: "allinanchor:",
    placeholder: "download free",
    description: "Find pages with links containing all words in the anchor text",
  },
  ...EXPLOIT_DB_DORKS
]

const generateId = () => Math.random().toString(36).substring(2, 9)

export default function DorkingLab() {
  // Theme & Accessibility states
  const [theme, setTheme] = useState<"light" | "dark" | "high-contrast">("dark")
  const [fontSize, setFontSize] = useState(14) // px

  // Blocks states
  const [blocks, setBlocks] = useState<DorkBlock[]>([])
  const [customBlocks, setCustomBlocks] = useState<DorkBlock[]>([])

  // Search engine: only one selectable
  const [selectedEngine, setSelectedEngine] = useState<
    "google" | "bing" | "duckduckgo" | "yahoo"
  >("google")

  // New custom block input states
  const [newCustomOperator, setNewCustomOperator] = useState("")
  const [newCustomPlaceholder, setNewCustomPlaceholder] = useState("")
  const [newCustomDescription, setNewCustomDescription] = useState("")

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as
      | "light"
      | "dark"
      | "high-contrast"
      | null
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"

    setTheme(savedTheme || systemTheme)
  }, [])

  // Update document class and font size when theme or font size changes
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark", "high-contrast")
    document.documentElement.classList.add(theme)
    localStorage.setItem("theme", theme)

    document.documentElement.style.fontSize = fontSize + "px"
  }, [theme, fontSize])

  // Add a new block from predefined or custom
  const addBlock = (block: Omit<DorkBlock, "id" | "value">) => {
    setBlocks([
      ...blocks,
      { ...block, id: generateId(), value: "" }, // start empty value
    ])
  }

  // Add a new custom block saved by user
  const saveCustomBlock = () => {
    if (
      !newCustomOperator.trim() ||
      !newCustomPlaceholder.trim() ||
      !newCustomDescription.trim()
    ) {
      alert("Please fill all fields to create a custom block")
      return
    }
    if (!newCustomOperator.endsWith(":")) {
      alert("Operator should end with a colon (:)")
      return
    }

    const newBlock: DorkBlock = {
      id: generateId(),
      type: "custom",
      operator: newCustomOperator.trim(),
      value: "",
      placeholder: newCustomPlaceholder.trim(),
      description: newCustomDescription.trim(),
    }
    setCustomBlocks([...customBlocks, newBlock])
    // reset form inputs
    setNewCustomOperator("")
    setNewCustomPlaceholder("")
    setNewCustomDescription("")
  }

  // Update block value on user input
  const updateBlockValue = (id: string, newValue: string) => {
    setBlocks(
      blocks.map((block) =>
        block.id === id ? { ...block, value: newValue } : block
      )
    )
  }

  // Remove a block
  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id))
  }

  // Build query string from blocks
  const buildQuery = () => {
    const parts = blocks
      .map((b) => {
        if (!b.value.trim()) return null
        if (b.type === "custom") return `${b.operator}${b.value.trim()}`
        return `${b.operator}${b.value.trim()}`
      })
      .filter(Boolean)
    return parts.join(" ")
  }

  // Execute search on selected engine
  const executeSearch = () => {
    const query = buildQuery()
    if (!query) {
      alert("Add at least one block with a value")
      return
    }
    const encodedQuery = encodeURIComponent(query)
    const urls = {
      google: `https://www.google.com/search?q=${encodedQuery}`,
      bing: `https://www.bing.com/search?q=${encodedQuery}`,
      duckduckgo: `https://duckduckgo.com/?q=${encodedQuery}`,
      yahoo: `https://search.yahoo.com/search?p=${encodedQuery}`,
    }
    window.open(urls[selectedEngine], "_blank")
  }

  // Handle search engine change (only one can be selected)
  const handleEngineChange = (engine: typeof selectedEngine) => {
    setSelectedEngine(engine)
  }

  // Toggle theme through options (dark, light, high-contrast)
  const cycleTheme = () => {
    if (theme === "dark") setTheme("light")
    else if (theme === "light") setTheme("high-contrast")
    else setTheme("dark")
  }

  return (
    <div className="min-h-screen bg-background font-mono px-4 py-6 max-w-6xl mx-auto">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mb-6">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">DorkLabs – OSINT Tool</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={cycleTheme} title="Toggle theme (Dark, Light, High Contrast)">
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <CheckCircle className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      <main className="grid gap-6 md:grid-cols-3">
        {/* Blocks builder */}
        <Card className="border-primary/20 col-span-2">
          <CardHeader>
            <CardTitle className="text-primary">Visual Dork Builder</CardTitle>
            <CardDescription>
              Add, edit, and combine dork blocks visually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {[...PREDEFINED_BLOCKS, ...customBlocks].map((block) => (
                <Button
                  key={block.operator + block.placeholder}
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock(block)}
                >
                  {block.operator}
                </Button>
              ))}
            </div>

            {blocks.length === 0 && (
              <p className="text-muted-foreground mt-4">Add blocks above to start building your dork.</p>
            )}

            <div className="space-y-3 mt-4">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center gap-2"
                  aria-label={`Block for operator ${block.operator}`}
                >
                  <span className="font-mono bg-primary/10 px-2 py-1 rounded select-none">
                    {block.operator}
                  </span>
                  <input
                    type="text"
                    placeholder={block.placeholder}
                    value={block.value}
                    onChange={(e) => updateBlockValue(block.id, e.target.value)}
                    className="flex-grow rounded border border-gray-300 px-2 py-1 font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label={`Input for ${block.operator} block`}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeBlock(block.id)}
                    aria-label="Remove block"
                    title="Remove block"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              className="mt-6"
              onClick={executeSearch}
              disabled={blocks.length === 0 || blocks.every(b => !b.value.trim())}
            >
              <Search className="mr-2 h-4 w-4" /> Search {selectedEngine.charAt(0).toUpperCase() + selectedEngine.slice(1)}
            </Button>
          </CardContent>
        </Card>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Search engine selection */}
          <Card>
            <CardHeader>
              <CardTitle>Search Engine</CardTitle>
              <CardDescription>
                Select one search engine (only one active)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(["google", "bing", "duckduckgo", "yahoo"] as const).map(
                (engine) => (
                  <div key={engine} className="flex items-center space-x-2 mb-2">
                    <input
                      type="radio"
                      id={`engine-${engine}`}
                      name="search-engine"
                      checked={selectedEngine === engine}
                      onChange={() => handleEngineChange(engine)}
                      className="cursor-pointer"
                    />
                    <label
                      htmlFor={`engine-${engine}`}
                      className="cursor-pointer select-none"
                    >
                      {engine.charAt(0).toUpperCase() + engine.slice(1)}
                    </label>
                  </div>
                )
              )}
            </CardContent>
          </Card>

          {/* Custom block creation */}
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Block</CardTitle>
              <CardDescription>
                Define a new operator block to reuse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                type="text"
                placeholder="Operator (e.g., myop:)"
                value={newCustomOperator}
                onChange={(e) => setNewCustomOperator(e.target.value)}
                className="w-full rounded border border-gray-300 px-2 py-1 font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Custom operator"
              />
              <input
                type="text"
                placeholder="Placeholder (e.g., something)"
                value={newCustomPlaceholder}
                onChange={(e) => setNewCustomPlaceholder(e.target.value)}
                className="w-full rounded border border-gray-300 px-2 py-1 font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Custom placeholder"
              />
              <input
                type="text"
                placeholder="Description"
                value={newCustomDescription}
                onChange={(e) => setNewCustomDescription(e.target.value)}
                className="w-full rounded border border-gray-300 px-2 py-1 font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Custom description"
              />
              <Button onClick={saveCustomBlock} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Save Custom Block
              </Button>
            </CardContent>
          </Card>

          {/* Accessibility & Theme */}
          <Card>
            <CardHeader>
              <CardTitle>Accessibility & Theme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label htmlFor="font-size" className="block font-semibold">
                Font Size: {fontSize}px
              </label>
              <input
                id="font-size"
                type="range"
                min={12}
                max={24}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
                aria-valuemin={12}
                aria-valuemax={24}
                aria-valuenow={fontSize}
                aria-label="Font size slider"
              />
              <p className="text-sm text-muted-foreground">
                Use the theme button on top-right to cycle between Dark, Light,
                and High Contrast themes.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="mt-12 text-center text-muted-foreground text-sm">
        © 2025 DorkLabs • Made for OSINT enthusiasts
      </footer>
    </div>
  )
}
