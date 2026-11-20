function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function downloadCsv(
  filename: string,
  header: string[],
  rows: (string | number | null)[][],
) {
  const esc = (v: string | number | null) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  triggerDownload(URL.createObjectURL(blob), filename);
}

/**
 * Serialize the first Recharts SVG inside `container`, resolving CSS
 * variables to computed colors so the file stands alone.
 */
export function downloadSvg(container: HTMLElement, filename: string) {
  const original = container.querySelector("svg");
  if (!original) return;
  const clone = original.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const origEls = original.querySelectorAll("*");
  const cloneEls = clone.querySelectorAll("*");
  const colorAttrs = ["fill", "stroke", "stop-color", "color"];
  origEls.forEach((el, i) => {
    const target = cloneEls[i];
    if (!target) return;
    const cs = getComputedStyle(el);
    for (const attr of colorAttrs) {
      const raw = el.getAttribute(attr);
      if (raw && raw.includes("var(")) {
        const resolved =
          attr === "stop-color"
            ? cs.stopColor
            : attr === "fill"
              ? cs.fill
              : attr === "stroke"
                ? cs.stroke
                : cs.color;
        target.setAttribute(attr, resolved);
      }
    }
  });

  const bg = getComputedStyle(document.documentElement)
    .getPropertyValue("--background")
    .trim();
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("width", "100%");
  rect.setAttribute("height", "100%");
  rect.setAttribute("fill", bg || "#ffffff");
  clone.insertBefore(rect, clone.firstChild);
  clone.setAttribute(
    "style",
    "font-family:'Geist Variable',ui-sans-serif,system-ui,sans-serif",
  );

  const xml = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  triggerDownload(URL.createObjectURL(blob), filename);
}
