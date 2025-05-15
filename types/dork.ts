export type SearchEngine = 'google' | 'bing' | 'duckduckgo';

export interface DorkBlock {
  id: string;
  type: string;
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