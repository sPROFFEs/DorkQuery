import React from 'react';
import { sanitizeHTML } from '../utils/validation';

interface MarkdownRendererProps {
  content: string;
}

// Simple markdown renderer
// In a real application, you might want to use a library like react-markdown
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Convert markdown to HTML
  const renderMarkdown = (markdown: string): string => {
    let html = markdown;
    
    // Headers
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-5 mb-3">$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-900 px-1 py-0.5 rounded text-green-400 font-mono">$1</code>');
    
    // Code blocks
    html = html.replace(/```([a-z]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="bg-gray-900 p-4 rounded-md my-4 overflow-x-auto font-mono text-sm"><code class="language-${lang}">${sanitizeHTML(code.trim())}</code></pre>`;
    });
    
    // Lists
    html = html.replace(/^\d+\.\s*(.*$)/gm, '<li class="ml-6 list-decimal">$1</li>');
    html = html.replace(/^-\s*(.*$)/gm, '<li class="ml-6 list-disc">$1</li>');
    
    // Wrap adjacent list items in ul/ol
    html = html.replace(/<li class="ml-6 list-decimal">([\s\S]*?)(?=(<\/code>|<h|$))/g, '<ol class="list-decimal my-3">$1</ol>');
    html = html.replace(/<li class="ml-6 list-disc">([\s\S]*?)(?=(<\/code>|<h|$))/g, '<ul class="list-disc my-3">$1</ul>');
    
    // Paragraphs
    html = html.replace(/^(?!<[aho]|<\/|<pre|<ul|<ol|<li)(.*$)/gm, '<p class="my-3">$1</p>');
    
    return html;
  };
  
  return (
    <div 
      className="markdown-content text-gray-200"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
};

export default MarkdownRenderer;