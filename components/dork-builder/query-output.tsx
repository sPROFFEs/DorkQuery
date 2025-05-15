"use client";

import { useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SearchEngine } from "@/types/dork";
import { generateSearchUrl } from "@/lib/dork-utils";
import { useToast } from "@/hooks/use-toast";

interface QueryOutputProps {
  query: string;
  selectedEngine: SearchEngine;
}

export function QueryOutput({ query, selectedEngine }: QueryOutputProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  
  const handleCopy = async () => {
    if (!query) return;
    
    try {
      await navigator.clipboard.writeText(query);
      setIsCopied(true);
      
      toast({
        title: "Copied to clipboard",
        description: "The dork query has been copied to your clipboard.",
        duration: 3000,
      });
      
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy text to clipboard.",
        variant: "destructive",
      });
    }
  };
  
  const searchUrl = generateSearchUrl(query, selectedEngine);
  
  return (
    <div className="w-full rounded-lg border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <Label htmlFor="query-output" className="text-md font-semibold">
          Generated Dork Query
        </Label>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className={cn(
              "h-8 gap-1 px-2",
              isCopied && "bg-green-500/10 text-green-500"
            )}
            onClick={handleCopy}
            disabled={!query}
          >
            <Copy className="h-3.5 w-3.5" />
            <span>{isCopied ? "Copied" : "Copy"}</span>
          </Button>
          {query && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1 px-2"
              asChild
            >
              <a href={searchUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Search</span>
              </a>
            </Button>
          )}
        </div>
      </div>
      
      <div className="relative">
        <Input
          id="query-output"
          value={query}
          readOnly
          className="font-mono bg-muted"
          placeholder="Your dork query will appear here..."
        />
      </div>
      
      {!query && (
        <p className="mt-2 text-sm text-muted-foreground">
          Add blocks from the sidebar to build your dork query.
        </p>
      )}
    </div>
  );
}