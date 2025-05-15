"use client"

import { useState, useEffect } from "react"
import {
  Moon,
  Sun,
  Search,
  Info,
  ExternalLink,
  Code
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

export default function DorkingLab() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [dorkQuery, setDorkQuery] = useState("")
  const [urlEncode, setUrlEncode] = useState(true)
  const [targetDomain, setTargetDomain] = useState("")
  const [selectedEngines, setSelectedEngines] = useState({
    google: true,
    bing: false,
    duckduckgo: false,
    yahoo: false
  })

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

  const handleEngineChange = (engine: keyof typeof selectedEngines) => {
    setSelectedEngines({
      ...selectedEngines,
      [engine]: !selectedEngines[engine]
    })
  }

  const applyTemplate = (template: string) => {
    const templates: Record<string, string> = {
      "login-pages": 'intitle:"login" OR inurl:"login" OR intext:"sign in"',
      "config-files": "ext:conf OR ext:config OR ext:cfg OR ext:ini",
      webcams: 'intitle:"webcam" OR inurl:"webcam" OR intext:"live camera"',
      "backup-files": "ext:bak OR ext:backup OR ext:old OR ext:sql~",
      "sql-errors": '"SQL syntax error" OR "mysql error with query"',
      "index-of": 'intitle:"index of" OR intitle:"index of /admin"',
      "password-files": 'filetype:log intext:password OR filetype:txt intext:password',
      "env-files": 'ext:env intext:DB_PASSWORD OR intext:AWS_SECRET',
      "db-dumps": 'filetype:sql OR filetype:dbf OR filetype:mdb',
      "excel-docs": 'filetype:xls OR filetype:xlsx intext:username',
      "php-info": 'ext:php intitle:"phpinfo()"',
      "git-repos": 'intitle:"index of" ".git"',
      "sensitive-directories": 'intitle:"index of" /private OR /confidential',
      "api-keys": 'intext:"api_key" OR intext:"apikey" filetype:env',
      "open-redirects": 'inurl:"redirect=" OR inurl:"url=" OR inurl:"return="',
      "log-files": 'filetype:log intext:error OR intext:exception',
      "sql-dumps": 'ext:sql | ext:dbf | ext:mdb intext:"dump"',
      "ftp-indexes": 'intitle:"index of" inurl:ftp',
      "intitle-admin": 'intitle:"admin panel" OR inurl:"admin/login"',
      "public-docs": 'filetype:pdf OR filetype:docx OR filetype:xlsx "confidential"',
      "directory-listings": 'intitle:"index of /" + (parent directory)',
      "exposed-logs": 'inurl:/logs/ filetype:log',
      "database-admin": 'intitle:"phpMyAdmin" OR intitle:"MySQL Admin"',
      "exposed-jenkins": 'intitle:"Dashboard [Jenkins]" OR inurl:"/view/All/builds"'
    }

    const selectedTemplate = templates[template]
    const finalQuery = targetDomain ? `site:${targetDomain} ${selectedTemplate}` : selectedTemplate
    setDorkQuery(finalQuery)
  }

  const executeSearch = () => {
    let query = dorkQuery
    if (targetDomain && !query.includes(`site:${targetDomain}`)) {
      query = `site:${targetDomain} ${query}`
    }
    query = urlEncode ? encodeURIComponent(query) : query

    const searchUrls = {
      google: `https://www.google.com/search?q=${query}`,
      bing: `https://www.bing.com/search?q=${query}`,
      duckduckgo: `https://duckduckgo.com/?q=${query}`,
      yahoo: `https://search.yahoo.com/search?p=${query}`
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
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}<span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </header>

      <main className="container py-6">
        <div className="grid gap-6 md:grid-cols-2">
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

              <div className="space-y-2">
                <label className="text-sm font-medium block">Target Domain (optional)</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    className="border rounded-md px-3 py-2 text-sm w-full bg-background"
                    placeholder="example.com"
                    value={targetDomain}
                    onChange={(e) => setTargetDomain(e.target.value.trim())}
                  />
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setDorkQuery((prev) =>
                        targetDomain ? `site:${targetDomain} ${prev}` : prev
                      )
                    }
                    disabled={!targetDomain || !dorkQuery}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Predefined Templates</label>
                <Select onValueChange={applyTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries({
                      "login-pages": "Login Pages",
                      "config-files": "Config Files",
                      webcams: "Webcams",
                      "backup-files": "Backup Files",
                      "sql-errors": "SQL Errors",
                      "index-of": "Index of Directories",
                      "password-files": "Password Files",
                      "env-files": ".env Files",
                      "db-dumps": "Database Dumps",
                      "excel-docs": "Excel Docs",
                      "php-info": "PHP Info",
                      "git-repos": "Git Repos",
                      "sensitive-directories": "Sensitive Directories",
                      "api-keys": "API Keys",
                      "open-redirects": "Open Redirects",
                      "log-files": "Log Files",
                      "sql-dumps": "SQL Dumps",
                      "ftp-indexes": "FTP Indexes",
                      "intitle-admin": "Admin Panels",
                      "public-docs": "Public Docs",
                      "directory-listings": "Directory Listings",
                      "exposed-logs": "Exposed Logs",
                      "database-admin": "Database Admin",
                      "exposed-jenkins": "Exposed Jenkins"
                    }).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
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

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Search Engines</CardTitle>
              <CardDescription>Select engines to execute your dork</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {Object.entries(selectedEngines).map(([engine, checked]) => (
                  <div key={engine} className="flex items-center space-x-2">
                    <Checkbox
                      id={engine}
                      checked={checked}
                      onCheckedChange={() => handleEngineChange(engine as keyof typeof selectedEngines)}
                    />
                    <label htmlFor={engine} className="text-sm font-medium capitalize">
                      {engine}
                    </label>
                  </div>
                ))}
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

        {/* Tips and Resources Card remains the same */}

      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container">
          <p>Dorking Lab – OSINT Tool | Use responsibly and ethically</p>
        </div>
      </footer>
    </div>
  )
}
