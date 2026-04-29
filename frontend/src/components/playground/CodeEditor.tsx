import Editor, { OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import React, { useEffect, useRef, useState } from "react";
import { MonacoBinding } from "y-monaco";
import { CursorManager } from "@/components/cursor";
import { useAwareness } from "@/hooks/useCanvasCollaboration";
import { useWebSocketStatus } from "@/lib/collaboration/WebSocketManager";
import { CollaborationProvider } from "@/lib/collaboration/YjsProvider";

interface CodeEditorProps {
  roomName: string;
  mobileMode?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  mobileMode = false,
  roomName,
}) => {
  const [provider] = useState(() => new CollaborationProvider(roomName));
  const bindingRef = useRef<MonacoBinding | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] = useState<editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    return () => {
      provider.destroy();
      bindingRef.current?.destroy();
    };
  }, [provider]);

  const status = useWebSocketStatus(provider);
  const remoteUsers = useAwareness(provider.awareness);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    setEditorInstance(editor);

    const type = provider.doc.getText("monaco");
    bindingRef.current = new MonacoBinding(
      type,
      editor.getModel()!,
      new Set([editor]),
      provider.awareness,
    );

    // Custom theme for Monaco to match the app aesthetic
    monaco.editor.defineTheme("web3-lab-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "666666", fontStyle: "italic" },
        { token: "keyword", foreground: "ef4444", fontStyle: "bold" },
        { token: "string", foreground: "10b981" },
      ],
      colors: {
        "editor.background": "#09090b",
        "editor.lineHighlightBackground": "#18181b",
        "editorCursor.foreground": "#ef4444",
      },
    });

    monaco.editor.setTheme("web3-lab-dark");
  };

  return (
    <div ref={containerRef} className="group relative flex flex-grow flex-col">
      <div className="absolute right-2 top-2 z-10 flex max-w-[calc(100%-1rem)] flex-wrap items-center justify-end gap-2">
        <div className="flex -space-x-2">
          {/* Local user avatar */}
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-black text-[8px] font-bold"
            style={{ backgroundColor: provider.localUser.color }}
            title={`You (${provider.localUser.name})`}
          >
            ME
          </div>
          {/* Remote collaborator avatars */}
          {remoteUsers.map((user) => (
            <div
              key={user.clientId}
              className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-black text-[8px] font-bold text-white"
              style={{ backgroundColor: user.color }}
              title={user.name}
            >
              {user.name.charAt(0)}
            </div>
          ))}
        </div>
        <div
          className={`flex items-center gap-2 rounded border border-white/10 bg-black/50 px-2 py-1 text-[9px] font-bold uppercase tracking-tighter ${
            status === "connected"
              ? "text-green-500"
              : status === "connecting"
                ? "text-amber-500"
                : "text-red-500"
          }`}
        >
          <div
            className={`h-1.5 w-1.5 rounded-full ${
              status === "connected"
                ? "bg-green-500 shadow-[0_0_5px_#22c55e]"
                : status === "connecting"
                  ? "animate-pulse bg-amber-500"
                  : "bg-red-500"
            }`}
          />
          {status}
        </div>
      </div>

      {/* Editor with cursor overlay */}
      <div className="relative flex-grow">
        <Editor
          height="100%"
          defaultLanguage="rust"
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: mobileMode ? 12 : 14,
            fontFamily: "monospace",
            lineNumbers: mobileMode ? "off" : "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            theme: "web3-lab-dark",
            automaticLayout: true,
            wordWrap: mobileMode ? "on" : "off",
            folding: !mobileMode,
            glyphMargin: !mobileMode,
            lineDecorationsWidth: mobileMode ? 4 : 10,
            lineNumbersMinChars: mobileMode ? 2 : 5,
            padding: { top: mobileMode ? 44 : 20 },
          }}
        />

        {/* Framer Motion animated remote cursors overlay */}
        {editorInstance && provider.awareness && (
          <CursorManager
            editor={editorInstance}
            awareness={provider.awareness}
            containerRef={containerRef}
          />
        )}
      </div>
    </div>
  );
};
