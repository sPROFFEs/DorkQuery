export type SearchEngine = 'google' | 'bing' | 'duckduckgo';

export type DorkBlockType =
  | "site"
  | "inurl"
  | "filetype"
  | "intitle"
  | "intext"
  | "cache"
  | "related"
  | "custom";

export interface DorkBlock {
  id: string;
  type: DorkBlockType;
  operator: string;
  value: string;
  placeholder: string;
  icon: string;
  description: string;
}

export interface DorkState {
  blocks: DorkBlock[];
  selectedEngine: SearchEngine;
}