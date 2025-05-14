import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { sql } from '@codemirror/lang-sql';
import { darcula } from '@uiw/codemirror-theme-darcula';
import { validateCode } from '../utils/validation';

interface CodeEditorProps {
  initialCode: string;
  language: 'javascript' | 'html' | 'sql';
  validation?: string;
  solution?: string;
  onCodeValidated?: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  initialCode, 
  language, 
  validation, 
  solution,
  onCodeValidated 
}) => {
  const { t } = useTranslation();
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  
  // Get the language extension for CodeMirror
  const getLangExtension = () => {
    switch (language) {
      case 'javascript':
        return javascript({ jsx: true });
      case 'sql':
        return sql();
      default:
        return javascript();
    }
  };
  
  // Run the code and check if it's correct
  const runCode = () => {
    if (!validation) {
      setResult({ success: true, message: "No validation available for this exercise." });
      return;
    }
    
    try {
      const isValid = validateCode(code, validation);
      
      if (isValid) {
        setResult({ success: true, message: "Great job! Your code works correctly." });
        if (onCodeValidated) {
          onCodeValidated();
        }
      } else {
        setResult({ success: false, message: "Your code doesn't meet the requirements. Try again!" });
      }
    } catch (error) {
      console.error('Validation error:', error);
      setResult({ success: false, message: "Error running code validation. Please try again." });
    }
  };
  
  // Reset code to initial state
  const resetCode = () => {
    setCode(initialCode);
    setResult(null);
    setShowSolution(false);
  };
  
  // Toggle showing the solution
  const toggleSolution = () => {
    if (showSolution) {
      resetCode();
    } else {
      setShowSolution(true);
      if (solution) {
        setCode(solution);
      }
    }
  };
  
  return (
    <div className="code-editor border border-gray-700 rounded-md overflow-hidden">
      <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
        <div className="text-sm font-medium text-gray-300">
          {language === 'javascript' && 'JavaScript'}
          {language === 'html' && 'HTML'}
          {language === 'sql' && 'SQL'}
        </div>
        <div className="flex space-x-2">
          {solution && (
            <button
              className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
              onClick={toggleSolution}
            >
              {showSolution ? t('courses.reset') : "Show Solution"}
            </button>
          )}
          <button
            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
            onClick={resetCode}
          >
            {t('courses.reset')}
          </button>
          <button
            className="text-xs px-2 py-1 bg-green-700 hover:bg-green-600 text-white rounded"
            onClick={runCode}
          >
            {t('courses.run')}
          </button>
        </div>
      </div>
      
      <CodeMirror
        value={code}
        height="300px"
        theme={darcula}
        extensions={[getLangExtension()]}
        onChange={(value) => {
          setCode(value);
          setResult(null);
        }}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          searchKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
      />
      
      {result && (
        <div className={`p-4 text-sm ${result.success ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
          {result.message}
        </div>
      )}
    </div>
  );
};

export default CodeEditor;