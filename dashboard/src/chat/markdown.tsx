import type { ReactNode } from "react";

/** Minimal, dependency-free markdown for assistant answers. */

function inline(text: string, keyBase: string): ReactNode[] {
  const parts = text.split(
    /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\(source:[^)]*\))/g,
  );
  return parts.map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2)
      return <em key={key}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code
          key={key}
          className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground"
        >
          {part.slice(1, -1)}
        </code>
      );
    if (part.startsWith("(source:"))
      return (
        <span
          key={key}
          className="mx-0.5 inline-flex max-w-full items-center rounded border border-finland/40 bg-finland/10 px-1.5 py-0 align-baseline font-mono text-[10px] text-finland"
        >
          {part.slice(1, -1)}
        </span>
      );
    return <span key={key}>{part}</span>;
  });
}

export function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let k = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (line.trim().startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(
        <pre
          key={k++}
          className="overflow-x-auto rounded-lg border border-border bg-muted/60 p-2.5 font-mono text-[11px] leading-relaxed"
        >
          {code.join("\n")}
        </pre>,
      );
      continue;
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push(
        <div key={k++} className="mt-1 text-sm font-semibold text-foreground">
          {inline(heading[2], `h${k}`)}
        </div>,
      );
      i++;
      continue;
    }

    if (/^\s*([-*•])\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*•])\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*•])\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={k++} className="space-y-1 pl-1">
          {items.map((it, j) => (
            <li key={j} className="flex gap-2">
              <span
                className="mt-1.75 size-1 shrink-0 rounded-full bg-finland"
                aria-hidden
              />
              <span>{inline(it, `ul${k}-${j}`)}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={k++} className="list-decimal space-y-1 pl-5">
          {items.map((it, j) => (
            <li key={j}>{inline(it, `ol${k}-${j}`)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    if (line.trim() === "---") {
      blocks.push(<hr key={k++} className="border-border" />);
      i++;
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,4}\s|\s*([-*•])\s|\s*\d+[.)]\s|```)/.test(lines[i]) &&
      lines[i].trim() !== "---"
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={k++} className="leading-relaxed">
        {inline(para.join(" "), `p${k}`)}
      </p>,
    );
  }

  return <div className="space-y-2 text-sm text-foreground/90">{blocks}</div>;
}
