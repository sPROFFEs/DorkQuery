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
// import { Textarea } from "@/components/ui/textarea" // No longer directly used here
// import { Switch } from "@/components/ui/switch" // No longer directly used here
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // No longer directly used here
import {
  Card,
  CardContent,
  // CardDescription, // No longer directly used here
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
// import { DorkBlock, DorkBlockType } from "@/types/dork" // Types will be handled by DorkingInterface
// import { PREDEFINED_DORK_BLOCKS } from "@/lib/dork-utils" // Data will be handled by DorkingInterface
import { DorkingInterface } from "@/components/dork-builder/dorking-interface"; // Import the new main component

// const generateId = () => Math.random().toString(36).substring(2, 9) // ID generation will be handled internally by components

export default function DorkingLab() {
  // Theme & Accessibility states
  const [theme, setTheme] = useState<"light" | "dark" | "high-contrast">("dark")
  const [fontSize, setFontSize] = useState(14) // px

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

      {/* Render the DorkingInterface which now contains the main dork building UI and logic */}
      <main>
        <DorkingInterface />
      </main>

      {/* Side Panel for Accessibility & Theme - kept in app/page.tsx */}
      <div className="fixed bottom-6 right-6 space-y-6">
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
      <footer className="mt-12 text-center text-muted-foreground text-sm">
        © 2025 DorkLabs • Made for OSINT enthusiasts
      </footer>
    </div>
  )
}
