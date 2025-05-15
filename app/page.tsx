"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, Search, Info, ExternalLink, Code, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function DorkingLab() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [dorkQuery, setDorkQuery] = useState("")
  const [targetDomain, setTargetDomain] = useState("")
  const [selectedEngine, setSelectedEngine] = useState<"google" | "bing" | "duckduckgo" | "yahoo">("google")

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    setTheme(savedTheme || systemTheme)
  }, [])

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const applyTemplate = (template: string) => {
    const templates: Record<string, string> = {
      "login-pages": 'intitle:"login" OR inurl:"login" OR intext:"sign in"',
      "config-files": "ext:conf OR ext:config OR ext:cfg OR ext:ini",
      webcams: 'intitle:"webcam" OR inurl:"webcam" OR intext:"live camera"',
      "backup-files": "ext:bak OR ext:backup OR ext:old OR ext:sql~",
      "sql-errors": '"SQL syntax error" OR "mysql error with query"',
      "directory-listings": 'intitle:"index of /"',
      "env-files": 'ext:.env DB_HOST',
      "open-redirects": 'inurl:"redirect=" OR inurl:"url=" OR inurl:"return=" OR inurl:"next="',
      "log-files": 'ext:log intext:error',
      "database-dumps": 'ext:sql | ext:dbf | ext:mdb',
      "apache-status": 'intitle:"Apache Status" "Server Status"',
      "php-info": 'ext:php intitle:"phpinfo()"',
      "exposed-git": 'inurl:".git"',
      "ftp-servers": 'intitle:"FTP Index of"',
      "login-panels": 'inurl:login OR inurl:signin OR intitle:Login',
      "exposed-backups": 'ext:bkf | ext:bkp | ext:bak | ext:old | ext:backup',
      "open-ports": 'port 21 OR port 22 OR port 23 OR port 80 OR port 443',
    }

    let query = templates[template]
    if (targetDomain) {
      query = `site:${targetDomain} ` + query
    }
    setDorkQuery(query)
  }

  const prependDomain = () => {
    if (!targetDomain) return
    const domainString = `site:${targetDomain}`
    const alreadyHas = dorkQuery.includes(domainString)
    setDorkQuery((prev) => alreadyHas ? prev : `${domainString} ${prev}`)
  }

  const executeSearch = () => {
    const query = encodeURIComponent(dorkQuery)
    const searchUrls = {
      google: `https://www.google.com/search?q=${query}`,
      bing: `https://www.bing.com/search?q=${query}`,
      duckduckgo: `https://duckduckgo.com/?q=${query}`,
      yahoo: `https://search.yahoo.com/search?p=${query}`,
    }
    window.open(searchUrls[selectedEngine], "_blank")
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

      <main className="container py-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Dork Builder</CardTitle>
              <CardDescription>Create and customize your search dorks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="example.com"
                  value={targetDomain}
                  onChange={(e) => setTargetDomain(e.target.value)}
                />
                <Button onClick={prependDomain}><Globe className="w-4 h-4 mr-1" /> Add</Button>
              </div>

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
                    {Object.keys({
                      "login-pages": "",
                      "config-files": "",
                      webcams: "",
                      "backup-files": "",
                      "sql-errors": "",
                      "directory-listings": "",
                      "env-files": "",
                      "open-redirects": "",
                      "log-files": "",
                      "database-dumps": "",
                      "apache-status": "",
                      "php-info": "",
                      "exposed-git": "",
                      "ftp-servers": "",
                      "login-panels": "",
                      "exposed-backups": "",
                      "open-ports": "",
                    }).map((key) => (
                      <SelectItem key={key} value={key}>{key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Search Engine</CardTitle>
              <CardDescription>Select a search engine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(["google", "bing", "duckduckgo", "yahoo"] as const).map((engine) => (
                <div key={engine} className="flex items-center space-x-2">
                  <Checkbox
                    id={engine}
                    checked={selectedEngine === engine}
                    onCheckedChange={() => setSelectedEngine(engine)}
                  />
                  <label htmlFor={engine} className="text-sm font-medium capitalize">
                    {engine}
                  </label>
                </div>
              ))}

              <Button
                className="w-full h-12 text-lg"
                onClick={executeSearch}
                disabled={!dorkQuery.trim()}
              >
                <Search className="mr-2 h-5 w-5" /> Search Now
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20">
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
                    <li><code className="bg-muted px-1 rounded">site:</code> - Limit search to specific domain</li>
                    <li><code className="bg-muted px-1 rounded">inurl:</code> - Find pages with specific text in URL</li>
                    <li><code className="bg-muted px-1 rounded">intitle:</code> - Find pages with specific text in title</li>
                    <li><code className="bg-muted px-1 rounded">filetype:</code> - Find specific file types</li>
                    <li><code className="bg-muted px-1 rounded">ext:</code> - Find files with specific extension</li>
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="resources" className="space-y-4 mt-4">
                <div className="grid gap-2">
                  <a href="https://www.exploit-db.com/google-hacking-database" target="_blank" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <ExternalLink className="h-4 w-4" /> Google Hacking Database (GHDB)
                  </a>
                  <a href="https://github.com/opsdisk/pagodo" target="_blank" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <ExternalLink className="h-4 w-4" /> Pagodo - Passive Google Dork Tool
                  </a>
                  <a href="https://book.hacktricks.xyz/generic-methodologies-and-resources/google-hacking" target="_blank" className="flex items-center gap-2 text-sm text-primary hover:underline">
                    <ExternalLink className="h-4 w-4" /> HackTricks - Google Hacking Guide
                  </a>
                  <a href="https://www.shodan.io/" target="_blank" className="flex items-center gap-2 text-sm text-primary hover:underline">
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
