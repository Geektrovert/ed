"use client";
import { defaultEditorContent } from "@/lib/content";
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  ImageResizer,
  type JSONContent,
  handleCommandNavigation,
  handleImageDrop,
  handleImagePaste,
} from "novel";
import { useEffect, useState, useRef, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "@/components/selectors/color-selector";
import { LinkSelector } from "@/components/selectors/link-selector";
import { MathSelector } from "@/components/selectors/math-selector";
import { NodeSelector } from "@/components/selectors/node-selector";
import { Separator } from "@/components/ui/separator";

import GenerativeMenuSwitch from "@/components/editor/extensions/generative/generative-menu-switch";
import { uploadFn } from "./extensions/upload/image-upload";
import { TextButtons } from "@/components/selectors/text-buttons";
import { slashCommand, suggestionItems } from "@/components/editor/extensions/core/slash";

import hljs from "highlight.js";
import { findHandsontableNodes, extractHandsontableData } from "./extensions/spreadsheet/handsontable-utils";
import { processHandsontableInHtml } from "./extensions/spreadsheet/processHandsontableInHtml";

const extensions = [...defaultExtensions, slashCommand];

const TailwindAdvancedEditor = ({ editorId, onDebouncedUpdate }: { 
  editorId?: string;
  onDebouncedUpdate?: (html: string, content: JSONContent) => void;
}) => {
  const [initialContent, setInitialContent] = useState<null | JSONContent>(
    null
  );
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [charsCount, setCharsCount] = useState();

  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  const editorRef = useRef<EditorInstance | null>(null);

  //Apply Codeblock Highlighting on the HTML from editor.getHTML()
  const highlightCodeblocks = (content: string) => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    doc.querySelectorAll("pre code").forEach((el) => {
      // @ts-expect-error type error
      // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
      hljs.highlightElement(el);
    });
    return new XMLSerializer().serializeToString(doc);
  };

  const debouncedUpdates = useDebouncedCallback(
    (html: string) => {
      try {
        if (!editorRef.current) return;
        const editor = editorRef.current;
        
        // First, extract the current editor JSON
        const content = editor.getJSON();
        
        // Make sure we have content to avoid errors
        if (!content) {
          console.warn("No content available in editor");
          return;
        }
        
        // Extract Handsontable data for debugging and persistence
        const handsontableTables = findHandsontableNodes(content);
        const handsontableData = extractHandsontableData(content);
        
        if (handsontableTables.length > 0) {
          console.log(`Found ${handsontableTables.length} Handsontable tables`);
        }
        
        // Process the HTML to ensure it's valid
        const processedHtml = processHandsontableInHtml(html);
        if (!processedHtml || processedHtml.trim() === '') {
          console.warn("Empty HTML content after processing");
        }
        
        // Serialize content to HTML (includes Handsontable data)
        // and store in localStorage along with JSON
        if (typeof window !== "undefined") {
          let storageKey = "tiptap";
          if (editorId) {
            storageKey = `tiptap-${editorId}`;
          }
          
          try {
            // For better performance, only stringify once
            const jsonString = JSON.stringify(content);
            
            // Store the HTML content
            localStorage.setItem(`${storageKey}-html`, processedHtml);
            
            // Store the JSON content 
            localStorage.setItem(`${storageKey}-json`, jsonString);
            
            // Also store Handsontable data separately if we have any tables
            if (Object.keys(handsontableData).length > 0) {
              localStorage.setItem(
                `${storageKey}-handsontable`,
                JSON.stringify(handsontableData)
              );
            }
            
            // Update save status
            setSaveStatus("Saved");
            
            // Call the callback if provided
            if (onDebouncedUpdate) {
              onDebouncedUpdate(processedHtml, content);
            }
          } catch (storageError) {
            console.error("Failed to store content:", storageError);
            setSaveStatus("Error saving");
          }
        }
      } catch (error) {
        console.error("[Editor] Error in debouncedUpdates:", error);
        setSaveStatus("Error saving");
      }
    },
    // Using 300ms instead of 500ms for better responsiveness while maintaining 
    // efficient batching
    300
  );

  // Safe method to get HTML from editor with error handling
  const getSafeHTML = useCallback((editor: EditorInstance) => {
    try {
      return editor.getHTML();
    } catch (error) {
      console.error("Error getting HTML from editor:", error);
      
      // Create a simple version from JSON content
      try {
        const json = editor.getJSON();
        return processHandsontableInHtml(createSimpleHTML(json));
      } catch (innerError) {
        console.error("Failed to create fallback HTML:", innerError);
        return "<p>Error rendering content</p>";
      }
    }
  }, []);
  
  // Create a simplified HTML version from JSON content
  const createSimpleHTML = useCallback((json: JSONContent) => {
    if (!json.content) return "<p></p>";
    
    let html = "";
    
    // Simple recursive function to convert to HTML
    const processNode = (node: any) => {
      if (node.type === "paragraph") {
        let inner = "";
        if (node.content) {
          node.content.forEach((child: any) => {
            inner += processNode(child);
          });
        }
        return `<p>${inner || "<br>"}</p>`;
      } else if (node.type === "text") {
        let text = node.text || "";
        if (node.marks) {
          node.marks.forEach((mark: any) => {
            if (mark.type === "bold") text = `<strong>${text}</strong>`;
            if (mark.type === "italic") text = `<em>${text}</em>`;
            // Add other marks as needed
          });
        }
        return text;
      } else if (node.type === "handsontableNode") {
        return `<div data-type="handsontable" data-id="${node.attrs?.id || ''}" data-title="${node.attrs?.title || 'Spreadsheet'}"></div>`;
      } else if (node.content) {
        let inner = "";
        node.content.forEach((child: any) => {
          inner += processNode(child);
        });
        return inner;
      }
      
      return "";
    };
    
    if (json.content) {
      json.content.forEach((node: any) => {
        html += processNode(node);
      });
    }
    
    return html || "<p></p>";
  }, []);

  useEffect(() => {
    const content = window.localStorage.getItem("novel-content");
    if (content) setInitialContent(JSON.parse(content));
    else setInitialContent(defaultEditorContent);
  }, []);

  if (!initialContent) return null;

  return (
    <div className="relative w-full max-w-screen-lg">
      <div className="flex absolute right-5 top-5 z-10 mb-5 gap-2">
        <div className="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">
          {saveStatus}
        </div>
        <div
          className={
            charsCount
              ? "rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground"
              : "hidden"
          }
        >
          {charsCount} Words
        </div>
      </div>
      <EditorRoot>
        <EditorContent
          initialContent={initialContent}
          extensions={extensions}
          className="relative min-h-[500px] w-full max-w-screen-lg border-muted bg-background sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:shadow-lg"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) =>
              handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) =>
              handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class:
                "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          onUpdate={({ editor }) => {
            editorRef.current = editor;
            
            // Use the safe HTML getter to avoid serialization errors
            const html = getSafeHTML(editor);
            
            // Then update with the safe HTML
            debouncedUpdates(html);
          }}
          slotAfter={<ImageResizer />}
        >
          <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command?.(val)}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          <GenerativeMenuSwitch open={openAI} onOpenChange={setOpenAI}>
            <Separator orientation="vertical" />
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <Separator orientation="vertical" />

            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <Separator orientation="vertical" />
            <MathSelector />
            <Separator orientation="vertical" />
            <TextButtons />
            <Separator orientation="vertical" />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </GenerativeMenuSwitch>
        </EditorContent>
      </EditorRoot>
    </div>
  );
};

export default TailwindAdvancedEditor;
