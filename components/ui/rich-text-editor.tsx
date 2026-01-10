"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Heading2, Quote, Undo, Redo } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { useEffect } from "react"; // <--- PENTING: Import useEffect

// --- TOOLBAR COMPONENT (Sama seperti sebelumnya) ---
const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  return (
    <div className="border-b border-slate-200 bg-slate-50 p-2 flex flex-wrap gap-1 rounded-t-md">
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 2 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        aria-label="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Toggle>
      
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </Toggle>

      <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

      <Toggle
        size="sm"
        pressed={editor.isActive("bulletList")}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        aria-label="Bullet List"
      >
        <List className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("orderedList")}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        aria-label="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("blockquote")}
        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        aria-label="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </Toggle>

      <div className="w-px h-6 bg-slate-300 mx-1 self-center" />

      <Toggle
        size="sm"
        onPressedChange={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        aria-label="Undo"
      >
        <Undo className="h-4 w-4" />
      </Toggle>
       <Toggle
        size="sm"
        onPressedChange={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        aria-label="Redo"
      >
        <Redo className="h-4 w-4" />
      </Toggle>
    </div>
  );
};

// --- MAIN EDITOR COMPONENT ---
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    // Hapus content di sini, kita handle via useEffect di bawah
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // --- FIX: DETEKSI PERUBAHAN DATA (UPDATE FORM) ---
  useEffect(() => {
    if (!editor || !value) return;

    // Logic: Jika konten di editor beda dengan value dari DB, 
    // DAN editor sedang TIDAK difokus (tidak sedang diketik user), maka update isinya.
    // Ini mencegah data lama menimpa data baru saat user loading edit form.
    
    // Kita cek apakah isinya beda (untuk hindari infinite loop)
    if (editor.getHTML() !== value) {
      // Kita paksa setContent hanya jika editor belum disentuh user (not focused)
      // atau isinya benar-benar kosong (initial load).
      if (!editor.isFocused) {
         editor.commands.setContent(value);
      }
    }
  }, [value, editor]);

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}