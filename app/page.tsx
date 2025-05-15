"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, Search, Info, ExternalLink, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DorkingLab() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [dorkQuery, setDorkQuery] = useState("")
  const [urlEncode, setUrlEncode] = useState(true)
  const [selectedEngines, setSelectedEngines] = useState({
    google: true,
    bing: false,
    duckduckgo: false,
    yahoo: false,
  })

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

    setTheme(savedTheme || systemTheme)
  }, [])

  // Update document class when theme changes
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleEngineChange = (engine: keyof typeof selectedEngines) => {
    setSelectedEngines({
      ...selectedEngines,
      [engine]: !selectedEngines[engine],
    })
  }

  const applyTemplate = (template: string) => {
    const templates: Record<string, string> = {
      "login-pages": 'intitle:"login" OR inurl:"login" OR intext:"sign in"',
      "config-files": "ext:conf OR ext:config OR ext:cfg OR ext:ini",
      webcams: 'intitle:"webcam" OR inurl:"webcam" OR intext:"live camera"',
      "backup-files": "ext:bak OR ext:backup OR ext:old OR ext:sql~",
      "sql-errors": '"SQL syntax error" OR "mysql error with query"',
    }

    setDorkQuery(templates[template])
  }

  const executeSearch = () => {
    const query = urlEncode ? encodeURIComponent(dorkQuery) : dorkQuery

    const searchUrls = {
      google: `https://www.google.com/search?q=${query}`,
      bing: `https://www.bing.com/search?q=${query}`,
      duckduckgo: `https://duckduckgo.com/?q=${query}`,
      yahoo: `https://search.yahoo.com/search?p=${query}`,
    }

    Object.entries(selectedEngines).forEach(([engine, isSelected]) => {
      if (isSelected && engine in searchUrls) {
        window.open(searchUrls[engine as keyof typeof searchUrls], "_blank")
      }
    })
  }

  return (
    <div className="min-h-screen bg-background font-mono">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Dorking Lab – OSINT Tool</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </header>

      <main className="container py-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Dork Builder Panel */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Dork Builder</CardTitle>
              <CardDescription>Create and customize your search dorks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Dork Query</label>
                <Textarea
                  placeholder="Enter your dork query (e.g., inurl:admin site:example.com)"
                  className="font-mono text-sm h-32 bg-background"
                  value={dorkQuery}
                  onChange={(e) => setDorkQuery(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Predefined Templates</label>
                <Select onValueChange={applyTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="login-pages">Login Pages</SelectItem>
                    <SelectItem value="config-files">Config Files</SelectItem>
                    <SelectItem value="webcams">Webcams</SelectItem>
                    <SelectItem value="backup-files">Backup Files</SelectItem>
                    <SelectItem value="sql-errors">SQL Errors</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="url-encode" checked={urlEncode} onCheckedChange={setUrlEncode} />
                <label htmlFor="url-encode" className="text-sm font-medium">
                  Auto URL-encode query
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Search Engine Panel */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Search Engines</CardTitle>
              <CardDescription>Select engines to execute your dork</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="google"
                    checked={selectedEngines.google}
                    onCheckedChange={() => handleEngineChange("google")}
                  />
                  <label htmlFor="google" className="text-sm font-medium">
                    Google
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bing"
                    checked={selectedEngines.bing}
                    onCheckedChange={() => handleEngineChange("bing")}
                  />
                  <label htmlFor="bing" className="text-sm font-medium">
                    Bing
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="duckduckgo"
                    checked={selectedEngines.duckduckgo}
                    onCheckedChange={() => handleEngineChange("duckduckgo")}
                  />
                  <label htmlFor="duckduckgo" className="text-sm font-medium">
                    DuckDuckGo
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="yahoo"
                    checked={selectedEngines.yahoo}
                    onCheckedChange={() => handleEngineChange("yahoo")}
                  />
                  <label htmlFor="yahoo" className="text-sm font-medium">
                    Yahoo
                  </label>
                </div>
              </div>

              <Button
                className="w-full h-12 text-lg"
                onClick={executeSearch}
                disabled={!dorkQuery.trim() || !Object.values(selectedEngines).some(Boolean)}
              >
                <Search className="mr-2 h-5 w-5" /> Search Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* OSINT Resources Section */}
        <Card className="mt-6 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Info className="h-5 w-5" /> OSINT Resources & Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tips">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tips">Usage Tips</TabsTrigger>
                <TabsTrigger value="resources">External Resources</TabsTrigger>
              </TabsList>
              <TabsContent value="tips" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Effective Dork Operators</h3>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>
                      <code className="bg-muted px-1 rounded">site:</code> - Limit search to specific domain
                    </li>
                    <li>
                      <code className="bg-muted px-1 rounded">inurl:</code> - Find pages with specific text in URL
                    </li>
                    <li>
                      <code className="bg-muted px-1 rounded">intitle:</code> - Find pages with specific text in title
                    </li>
                    <li>
                      <code className="bg-muted px-1 rounded">filetype:</code> - Find specific file types
                    </li>
                    <li>
                      <code className="bg-muted px-1 rounded">ext:</code> - Find files with specific extension
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Combining Operators</h3>
                  <p className="text-sm">
                    Use <code className="bg-muted px-1 rounded">AND</code>,{" "}
                    <code className="bg-muted px-1 rounded">OR</code>, and{" "}
                    <code className="bg-muted px-1 rounded">-</code> (minus) to create complex queries.
                  </p>
                  <p className="text-sm">
                    Example: <code className="bg-muted px-1 rounded">site:example.com intext:password -login</code>
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="resources" className="space-y-4 mt-4">
                <div className="grid gap-2">
                  <a
                    href="https://www.exploit-db.com/google-hacking-database"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" /> Google Hacking Database (GHDB)
                  </a>
                  <a
                    href="https://github.com/opsdisk/pagodo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" /> Pagodo - Passive Google Dork Tool
                  </a>
                  <a
                    href="https://book.hacktricks.xyz/generic-methodologies-and-resources/google-hacking"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" /> HackTricks - Google Hacking Guide
                  </a>
                  <a
                    href="https://www.shodan.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" /> Shodan - Search Engine for IoT
                  </a>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container">
          <p>Dorking Lab – OSINT Tool | Use responsibly and ethically</p>
        </div>
      </footer>
    </div>
  )
}
