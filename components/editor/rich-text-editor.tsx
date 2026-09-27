"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect, useRef, useState } from "react";
import { Alert, Box, Paper, Typography } from "@mui/material";
import { Button } from "@/components/ui/button";
import {
  mediaObjectUrl,
  richTextForEditor,
  richTextForStorage,
} from "@/lib/content/rich-text-media";
const MediaImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      mediaId: { default: null },
      caption: { default: null },
      align: { default: "center" },
      size: { default: "medium" },
    };
  },
});
export function RichTextEditor({
  initialContent,
  onChange,
  kind = "EVENT",
}: {
  initialContent?: object | null;
  onChange: (content: object) => void;
  kind?: "EVENT" | "PLACE";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      MediaImage.configure({ allowBase64: false }),
    ],
    content: initialContent
      ? richTextForEditor(initialContent)
      : { type: "doc", content: [{ type: "paragraph" }] },
    immediatelyRender: false,
    onUpdate: ({ editor: instance }) => onChange(richTextForStorage(instance.getJSON())),
  });
  useEffect(() => {
    if (editor && initialContent) editor.commands.setContent(richTextForEditor(initialContent));
  }, [editor, initialContent]);
  if (!editor)
    return (
      <Typography component="p" color="text.secondary">
        Cargando editor…
      </Typography>
    );
  const editorInstance = editor;
  async function uploadImage(file: File) {
    if (!/image\/(jpeg|png|webp)/.test(file.type)) {
      setError("Formato no permitido. Usa JPG, PNG o WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar 5 MB.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const presignResponse = await fetch("/api/v1/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, mimeType: file.type, size: file.size, filename: file.name }),
      });
      const prepared = await presignResponse.json().catch(() => null);
      if (!presignResponse.ok)
        throw new Error(prepared?.error?.message ?? "No fue posible preparar la imagen.");
      if (!prepared.data?.uploadUrl) throw new Error("No fue posible preparar la imagen");
      const uploadResponse = await fetch(prepared.data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadResponse.ok) throw new Error("No fue posible transferir la imagen a RustFS.");
      const completeResponse = await fetch("/api/v1/uploads/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectKey: prepared.data.objectKey, alt: file.name }),
      });
      const completed = await completeResponse.json().catch(() => null);
      if (!completeResponse.ok || !completed.data?.id)
        throw new Error(completed?.error?.message ?? "No fue posible registrar la imagen.");
      editorInstance
        .chain()
        .focus()
        .setImage({
          src: mediaObjectUrl(completed.data.id),
          alt: file.name,
          mediaId: completed.data.id,
        } as never)
        .run();
    } catch (error) {
      setError(error instanceof Error ? error.message : "No fue posible subir la imagen.");
    } finally {
      setUploading(false);
    }
  }
  return (
    <Paper
      variant="outlined"
      sx={{
        borderColor: "#d7e2dc",
        borderRadius: 1,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 0.5,
          p: 1,
          borderBottom: "1px solid #d7e2dc",
        }}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          sx={toolbarButtonSx}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Negrita
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          sx={toolbarButtonSx}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Cursiva
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          sx={toolbarButtonSx}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          sx={toolbarButtonSx}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Lista
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          sx={toolbarButtonSx}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          Cita
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          sx={toolbarButtonSx}
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Subiendo…" : "Imagen"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadImage(file);
            e.currentTarget.value = "";
          }}
        />
      </Box>
      <Typography component="p" color="text.secondary">
        Formatos permitidos: JPG, PNG y WebP. Tamaño máximo: 5 MB.
      </Typography>
      {error && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}
      <Box sx={{ "& .tiptap": { minHeight: 180, p: 1.5, outline: "none" } }}>
        <EditorContent editor={editor} />
      </Box>
    </Paper>
  );
}

const toolbarButtonSx = {
  minWidth: 0,
  px: 1,
  py: 0.5,
  borderColor: "#d7e2dc",
  bgcolor: "background.default",
  color: "text.primary",
  borderRadius: 1,
  "&:hover": { borderColor: "#9db9ad", bgcolor: "background.paper" },
};
