"use client"

import { useEffect, useRef } from "react"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  height?: string
}

export default function CodeEditor({ value, onChange, language = "javascript", height = "200px" }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoRef = useRef<any>(null)

  useEffect(() => {
    // Cargar Monaco Editor dinámicamente
    import("monaco-editor").then((monaco) => {
      if (editorRef.current) {
        // Limpiar editor anterior si existe
        if (monacoRef.current) {
          monacoRef.current.dispose()
        }

        // Configurar tema oscuro
        monaco.editor.defineTheme("hackingTheme", {
          base: "vs-dark",
          inherit: true,
          rules: [],
          colors: {
            "editor.background": "#111111",
            "editor.foreground": "#FFFFFF",
            "editor.lineHighlightBackground": "#1A1A1A",
            "editorCursor.foreground": "#00FF00",
            "editorLineNumber.foreground": "#3D3D3D",
            "editor.selectionBackground": "#264F78",
            "editor.inactiveSelectionBackground": "#3A3D41",
          },
        })

        // Crear editor
        const editor = monaco.editor.create(editorRef.current, {
          value,
          language,
          theme: "hackingTheme",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          automaticLayout: true,
          lineNumbers: "on",
          scrollbar: {
            vertical: "visible",
            horizontal: "visible",
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        })

        // Actualizar valor cuando cambie
        editor.onDidChangeModelContent(() => {
          onChange(editor.getValue())
        })

        // Guardar referencia para limpieza
        monacoRef.current = editor
      }
    })

    return () => {
      // Limpiar editor al desmontar
      if (monacoRef.current) {
        monacoRef.current.dispose()
      }
    }
  }, [language, onChange])

  return (
    <div
      ref={editorRef}
      style={{
        height,
        width: "100%",
        border: "1px solid #333",
        borderRadius: "0.375rem",
      }}
    />
  )
}
