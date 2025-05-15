"use client";

import { SearchEngine } from "@/types/dork";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchEngineSelectorProps {
  value: SearchEngine;
  onChange: (value: SearchEngine) => void;
}

export function SearchEngineSelector({
  value,
  onChange,
}: SearchEngineSelectorProps) {
  const handleChange = (newValue: string) => {
    onChange(newValue as SearchEngine);
  };

  return (
    <div className="w-full max-w-[200px]">
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select search engine" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="google">Google</SelectItem>
          <SelectItem value="bing">Bing</SelectItem>
          <SelectItem value="duckduckgo">DuckDuckGo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}