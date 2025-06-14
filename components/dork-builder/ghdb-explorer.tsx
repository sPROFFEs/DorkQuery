"use client";

import { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { GhdbEntry, fetchGhdbDorks } from "@/lib/ghdb-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Download, // For import button
  DatabaseZap // Placeholder for GHDB section title
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GhdbExplorerProps {
  onImportDork: (entry: GhdbEntry) => void;
}

const RECORDS_PER_PAGE = 15;

export function GhdbExplorer({ onImportDork }: GhdbExplorerProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [entries, setEntries] = useState<GhdbEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0); // 0-indexed
  const [totalFilteredRecords, setTotalFilteredRecords] = useState<number>(0);

  const { toast } = useToast();

  const handleFetchEntries = async (page: number, currentSearchTerm: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchGhdbDorks(currentSearchTerm, page * RECORDS_PER_PAGE, RECORDS_PER_PAGE);
      setEntries(response.entries);
      setTotalFilteredRecords(response.recordsFiltered);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        title: "Error Fetching Dorks",
        description: errorMessage,
        variant: "destructive",
      });
      setEntries([]); // Clear entries on error
      setTotalFilteredRecords(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleFetchEntries(0, ""); // Initial load
  }, []); // Empty dependency array ensures this runs only on mount

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = () => {
    handleFetchEntries(0, searchTerm); // Reset to page 0 for new search
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleNextPage = () => {
    if ((currentPage + 1) * RECORDS_PER_PAGE < totalFilteredRecords) {
      handleFetchEntries(currentPage + 1, searchTerm);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      handleFetchEntries(currentPage - 1, searchTerm);
    }
  };

  const totalPages = Math.ceil(totalFilteredRecords / RECORDS_PER_PAGE);

  return (
    <Card className="w-full flex flex-col h-full"> {/* Flex container for full height if desired */}
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <DatabaseZap className="h-6 w-6" />
          <span>GHDB Dork Explorer</span>
        </CardTitle>
        <CardDescription>
          Search and import dorks from the Google Hacking Database.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow flex flex-col">
        {/* Search Section */}
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Search GHDB (e.g., filetype:pdf password)"
            value={searchTerm}
            onChange={handleSearchInputChange}
            onKeyPress={handleKeyPress}
            className="flex-grow"
            disabled={isLoading}
          />
          <Button onClick={handleSearchSubmit} disabled={isLoading}>
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center flex-grow py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Searching GHDB...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center flex-grow py-10 text-destructive">
            <AlertTriangle className="h-12 w-12" />
            <p className="mt-2 text-center">Error: {error}</p>
            <Button variant="outline" onClick={() => handleFetchEntries(currentPage, searchTerm)} className="mt-4">
              Try Again
            </Button>
          </div>
        )}

        {/* Results Section */}
        {!isLoading && !error && (
          <>
            {entries.length > 0 ? (
              <div className="space-y-3 overflow-y-auto flex-grow pr-2 max-h-[calc(100vh-400px)]"> {/* Max height for scroll */}
                {entries.map((entry) => (
                  <Card key={entry.id} className="p-3 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-sm mb-1">{entry.title}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onImportDork(entry);
                          toast({ title: "Dork Imported!", description: `"${entry.dork}" added to your workspace.` });
                        }}
                        title="Import this dork"
                        className="text-primary hover:text-primary/80 px-2 py-1 h-auto"
                      >
                        <Download className="h-4 w-4 mr-1" /> Import
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Category: {entry.category}</p>
                    <p className="text-xs text-muted-foreground mb-2">Date: {entry.date}</p>
                    <code className="text-xs bg-muted p-1 rounded-sm block break-all select-all">
                      {entry.dork}
                    </code>
                    <a
                      href={entry.urlToGhdbPage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline mt-1 inline-block"
                    >
                      View on Exploit-DB
                    </a>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-grow py-10">
                <Search className="h-12 w-12 text-muted-foreground opacity-50" />
                <p className="mt-2 text-muted-foreground">No results found for your query.</p>
              </div>
            )}

            {/* Pagination Section */}
            {totalFilteredRecords > 0 && (
              <div className="flex items-center justify-between pt-4 border-t mt-auto">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage + 1} of {totalPages} ({totalFilteredRecords} results)
                </p>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 0 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={(currentPage + 1) * RECORDS_PER_PAGE >= totalFilteredRecords || isLoading}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
