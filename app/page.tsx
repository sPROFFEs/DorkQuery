"use client";

import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SearchEngineSelector } from "@/components/dork-builder/search-engine-selector";
import { DorkBlockList } from "@/components/dork-builder/dork-block-list";
import { DorkBuilderArea } from "@/components/dork-builder/dork-builder-area";
import { QueryOutput } from "@/components/dork-builder/query-output";
import { SearchEngine, DorkBlock } from "@/types/dork";
import { Database, Github, Search } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  const [query, setQuery] = useState("");
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>("google");

  // Function to add a block to the builder
  const handleAddBlock = (block: DorkBlock) => {
    // This will be handled directly by the DorkBuilderArea component
    // through the onAddBlock prop
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            <h1 className="text-xl font-bold">Visual Dork Builder</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a
              href="https://www.google.com/about/unwanted-software-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Responsible Use</span>
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container py-6">
        {/* Top bar with search engine selector */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium">Build Your Dork Query</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Search Engine:</span>
            <SearchEngineSelector
              value={selectedEngine}
              onChange={setSelectedEngine}
            />
          </div>
        </div>

        {/* Main grid layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
          {/* Sidebar with available blocks */}
          <aside className="order-2 lg:order-1">
            <DorkBlockList onAddBlock={handleAddBlock} />
          </aside>

          {/* Main builder area */}
          <div className="order-1 flex flex-col gap-6 lg:order-2">
            <DorkBuilderArea
              onQueryChange={setQuery}
              selectedEngine={selectedEngine}
              onAddBlock={handleAddBlock}
            />
            <QueryOutput query={query} selectedEngine={selectedEngine} />
          </div>
        </div>
      </div>
      
      <Toaster />
    </main>
  );
}