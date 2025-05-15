import { SearchEngine, DorkBlock } from '@/types/dork';

// Predefined dork blocks that users can add to their query
export const PREDEFINED_DORK_BLOCKS: DorkBlock[] = [
  {
    id: 'site',
    type: 'site',
    operator: 'site:',
    value: '',
    placeholder: 'example.com',
    icon: 'globe',
    description: 'Search within a specific website or domain',
  },
  {
    id: 'inurl',
    type: 'inurl',
    operator: 'inurl:',
    value: '',
    placeholder: 'admin',
    icon: 'link',
    description: 'Search for pages with a specific word in the URL',
  },
  {
    id: 'filetype',
    type: 'filetype',
    operator: 'filetype:',
    value: '',
    placeholder: 'pdf',
    icon: 'file',
    description: 'Search for specific file types',
  },
  {
    id: 'intitle',
    type: 'intitle',
    operator: 'intitle:',
    value: '',
    placeholder: 'index of',
    icon: 'heading',
    description: 'Search for pages with a specific word in the title',
  },
  {
    id: 'intext',
    type: 'intext',
    operator: 'intext:',
    value: '',
    placeholder: 'password',
    icon: 'text',
    description: 'Search for pages containing specific text',
  },
  {
    id: 'cache',
    type: 'cache',
    operator: 'cache:',
    value: '',
    placeholder: 'example.com',
    icon: 'history',
    description: 'Show Google\'s cached version of a page',
  },
  {
    id: 'related',
    type: 'related',
    operator: 'related:',
    value: '',
    placeholder: 'example.com',
    icon: 'link-2',
    description: 'Find sites related to a given domain',
  },
  {
    id: 'ext',
    type: 'ext',
    operator: 'ext:',
    value: '',
    placeholder: 'log',
    icon: 'file-text',
    description: 'Find files by extension (alias for filetype)',
  },
  {
    id: 'allintext',
    type: 'allintext',
    operator: 'allintext:',
    value: '',
    placeholder: 'username password',
    icon: 'align-left',
    description: 'Find pages where all the terms appear in the text',
  },
  {
    id: 'allintitle',
    type: 'allintitle',
    operator: 'allintitle:',
    value: '',
    placeholder: 'login page',
    icon: 'type',
    description: 'Find pages where all the terms appear in the title',
  },
  {
    id: 'allinurl',
    type: 'allinurl',
    operator: 'allinurl:',
    value: '',
    placeholder: 'auth login',
    icon: 'link',
    description: 'Find pages where all the terms appear in the URL',
  },
  {
    id: 'allinanchor',
    type: 'allinanchor',
    operator: 'allinanchor:',
    value: '',
    placeholder: 'download free',
    icon: 'anchor',
    description: 'Find pages with specific anchor text',
  },
  {
    id: 'author',
    type: 'author',
    operator: 'author:',
    value: '',
    placeholder: 'john doe',
    icon: 'user',
    description: 'Search for documents by author (Google Scholar)',
  },
  {
    id: 'before',
    type: 'before',
    operator: 'before:',
    value: '',
    placeholder: '2023-01-01',
    icon: 'calendar',
    description: 'Search for content published before a date',
  },
  {
    id: 'after',
    type: 'after',
    operator: 'after:',
    value: '',
    placeholder: '2023-01-01',
    icon: 'calendar',
    description: 'Search for content published after a date',
  },
  {
    id: 'define',
    type: 'define',
    operator: 'define:',
    value: '',
    placeholder: 'phishing',
    icon: 'book',
    description: 'Get the definition of a word',
  },
  {
    id: 'custom',
    type: 'custom',
    operator: '',
    value: '',
    placeholder: 'keyword or phrase',
    icon: 'edit-3',
    description: 'Add a custom search term',
  }
];

// Generate a unique ID for new blocks
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Format the dork query based on the blocks and selected search engine
export const formatDorkQuery = (blocks: DorkBlock[], engine: SearchEngine): string => {
  if (blocks.length === 0) return '';
  
  // Format blocks into a query string
  const queryParts = blocks.map(block => {
    if (block.type === 'custom') {
      return block.value;
    }
    
    if (block.value.trim() === '') {
      return '';
    }
    
    // Handle special formatting for different search engines if needed
    return `${block.operator}${block.value.trim()}`;
  }).filter(part => part !== '');
  
  return queryParts.join(' ');
};

// Generate the full search URL based on the query and engine
export const generateSearchUrl = (query: string, engine: SearchEngine): string => {
  if (!query) return '';
  
  const encodedQuery = encodeURIComponent(query);
  
  switch (engine) {
    case 'google':
      return `https://www.google.com/search?q=${encodedQuery}`;
    case 'bing':
      return `https://www.bing.com/search?q=${encodedQuery}`;
    case 'duckduckgo':
      return `https://duckduckgo.com/?q=${encodedQuery}`;
    default:
      return `https://www.google.com/search?q=${encodedQuery}`;
  }
};

// Create a new block instance from a predefined block type
export const createNewBlock = (predefinedBlock: DorkBlock): DorkBlock => {
  return {
    ...predefinedBlock,
    id: generateId(),
    value: ''
  };
};