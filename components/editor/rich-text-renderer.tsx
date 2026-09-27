import type { JSONContent } from "@tiptap/core";
import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { isMediaId, mediaObjectUrl } from "@/lib/content/rich-text-media";

const validAlignments = new Set(["left", "center", "right"]);
const validSizes = new Set(["small", "medium", "large", "full"]);
export function RichTextRenderer({ content }: { content?: JSONContent | null }) {
  if (!content?.content) return null;
  return (
    <Box
      component="div"
      sx={{
        "& img": { display: "block", maxWidth: "100%", height: "auto", borderRadius: 2, my: 1.5 },
        "& p, & ul, & ol, & blockquote, & h2, & h3": { my: 1.5 },
        "& ul, & ol": { pl: 3 },
        "& a": { color: "primary.main", textDecoration: "underline" },
        "& figure": { my: 2.5 },
      }}
    >
      {content.content.map((node, index) => (
        <NodeView key={index} node={node} />
      ))}
    </Box>
  );
}
function NodeView({ node }: { node: JSONContent }) {
  const children = node.content?.map((child, index) => <NodeView key={index} node={child} />);
  switch (node.type) {
    case "text":
      return <MarkedText node={node} />;
    case "paragraph":
      return <p>{children}</p>;
    case "heading":
      return node.attrs?.level === 3 ? <h3>{children}</h3> : <h2>{children}</h2>;
    case "blockquote":
      return <blockquote>{children}</blockquote>;
    case "bulletList":
      return <ul>{children}</ul>;
    case "orderedList":
      return <ol>{children}</ol>;
    case "listItem":
      return <li>{children}</li>;
    case "horizontalRule":
      return <hr />;
    case "image":
      return <MediaFigure node={node} />;
    default:
      return children ? <>{children}</> : null;
  }
}

function MarkedText({ node }: { node: JSONContent }) {
  let output: ReactNode = node.text ?? "";
  for (const mark of node.marks ?? []) {
    if (mark.type === "bold" || mark.type === "strong") output = <strong>{output}</strong>;
    else if (mark.type === "italic" || mark.type === "em") output = <em>{output}</em>;
    else if (mark.type === "link") {
      const href = safeLink(mark.attrs?.href);
      if (href)
        output = (
          <a href={href} target="_blank" rel="noreferrer">
            {output}
          </a>
        );
    }
  }
  return <>{output}</>;
}

function MediaFigure({ node }: { node: JSONContent }) {
  const mediaId = node.attrs?.mediaId;
  if (!isMediaId(mediaId)) return null;
  const align = validAlignments.has(String(node.attrs?.align))
    ? String(node.attrs?.align)
    : "center";
  const size = validSizes.has(String(node.attrs?.size)) ? String(node.attrs?.size) : "medium";
  const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
  const caption = typeof node.attrs?.caption === "string" ? node.attrs.caption : "";
  return (
    <Box
      component="figure"
      sx={{
        mx: align === "left" ? 0 : align === "right" ? "auto" : "auto",
        my: 2.5,
        maxWidth: size === "small" ? "33%" : size === "medium" ? "66%" : "100%",
        width: "100%",
        ...(align === "left" ? { ml: 0, mr: "auto" } : align === "right" ? { mr: 0, ml: "auto" } : {}),
      }}
    >
      <Box component="img" src={mediaObjectUrl(mediaId)} alt={alt} sx={{ display: "block", width: "100%", height: "auto", borderRadius: 2 }} />
      {caption && <Box component="figcaption" sx={{ mt: 1, color: "text.secondary", fontSize: "0.9rem" }}>{caption}</Box>}
    </Box>
  );
}

function safeLink(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value, "https://cultura.local");
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? value : null;
  } catch {
    return null;
  }
}
