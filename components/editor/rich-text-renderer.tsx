import type { JSONContent } from "@tiptap/core";
import type { ReactNode } from "react";
import { isMediaId, mediaObjectUrl } from "@/lib/content/rich-text-media";

const validAlignments = new Set(["left", "center", "right"]);
const validSizes = new Set(["small", "medium", "large", "full"]);
export function RichTextRenderer({ content }: { content?: JSONContent | null }) {
  if (!content?.content) return null;
  return (
    <div className="rich-content">
      {content.content.map((node, index) => (
        <NodeView key={index} node={node} />
      ))}
    </div>
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
    <figure className={`rich-media rich-media--${align} rich-media--${size}`}>
      <img src={mediaObjectUrl(mediaId)} alt={alt} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
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
