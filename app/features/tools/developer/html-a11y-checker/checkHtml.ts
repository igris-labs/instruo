import type { DefaultTreeAdapterTypes } from "parse5";
import { parse } from "parse5";
export interface Finding {
  severity: "error" | "warning" | "info";
  title: string;
  detail: string;
}
export function checkHtml(source: string): Finding[] {
  if (source.length > 200_000)
    return [
      {
        severity: "error",
        title: "Document too large",
        detail: "Check a document smaller than 200,000 characters.",
      },
    ];
  if (!source.trim())
    return [
      {
        severity: "info",
        title: "Add HTML to begin",
        detail: "Paste a document or fragment. No scripts or resources are loaded.",
      },
    ];
  type Element = DefaultTreeAdapterTypes.Element;
  const elements: Element[] = [];
  function visit(node: DefaultTreeAdapterTypes.Node) {
    if ("tagName" in node) elements.push(node);
    if ("childNodes" in node) for (const child of node.childNodes) visit(child);
  }
  visit(parse(source));
  const attr = (node: Element, name: string) =>
    node.attrs.find((item) => item.name === name)?.value ?? "";
  const has = (node: Element, name: string) => node.attrs.some((item) => item.name === name);
  const text = (node: DefaultTreeAdapterTypes.Node): string =>
    "value" in node ? node.value : "childNodes" in node ? node.childNodes.map(text).join("") : "";
  const ids = new Map<string, Element>();
  const findings: Finding[] = [];
  const add = (severity: Finding["severity"], title: string, detail: string) => {
    if (!findings.some((item) => item.title === title)) findings.push({ severity, title, detail });
  };
  for (const element of elements) {
    const id = attr(element, "id");
    if (id) {
      if (ids.has(id))
        add(
          "error",
          "Duplicate element IDs",
          `Duplicate ID: ${id}. Labels and references must identify one element.`,
        );
      else ids.set(id, element);
    }
  }
  function name(element: Element) {
    return (
      attr(element, "aria-label").trim() ||
      attr(element, "aria-labelledby")
        .split(/\s+/)
        .map((id) => ids.get(id))
        .filter(Boolean)
        .map((item) => text(item!))
        .join(" ")
        .trim() ||
      text(element).trim()
    );
  }
  for (const element of elements) {
    const tag = element.tagName;
    if (tag === "html" && /<html\b/i.test(source) && !attr(element, "lang").trim())
      add("error", "Document language missing", "Add a valid lang attribute to the html element.");
    if (tag === "img" && !has(element, "alt"))
      add(
        "error",
        "Image alternative text missing",
        'Use descriptive alt text for meaningful images; use alt="" only for decorative images.',
      );
    if (
      tag === "button" &&
      !name(element) &&
      !element.childNodes.some(
        (child) => "tagName" in child && child.tagName === "img" && attr(child, "alt"),
      )
    )
      add("error", "Unnamed button", "Give every button a visible label or an accessible name.");
    if (tag === "a" && has(element, "href") && !name(element))
      add("error", "Unnamed link", "Give each link descriptive text or an accessible name.");
    if (
      ["input", "select", "textarea"].includes(tag) &&
      attr(element, "type") !== "hidden" &&
      !["submit", "button", "reset", "image"].includes(attr(element, "type"))
    ) {
      let parent = element.parentNode;
      let nested = false;
      while (parent) {
        if ("tagName" in parent && parent.tagName === "label" && text(parent).trim()) nested = true;
        parent = "parentNode" in parent ? parent.parentNode : null;
      }
      const named =
        attr(element, "aria-label").trim() ||
        attr(element, "aria-labelledby")
          .split(/\s+/)
          .some((id) => ids.has(id) && text(ids.get(id)!).trim());
      const labelled =
        nested ||
        elements.some(
          (label) =>
            label.tagName === "label" &&
            attr(label, "for") === attr(element, "id") &&
            attr(element, "id") &&
            text(label).trim(),
        );
      if (!named && !labelled)
        add(
          "error",
          "Form control may be unlabeled",
          "An id alone is not a label. Associate a label element or an accessible name.",
        );
    }
  }
  let level = 0;
  for (const element of elements.filter((item) => /^h[1-6]$/.test(item.tagName))) {
    const next = Number(element.tagName[1]);
    if (level && next > level + 1)
      add(
        "warning",
        "Heading levels skipped",
        "Keep headings in a logical hierarchy, without jumping over a level.",
      );
    level = next;
  }
  if (!elements.some((item) => item.tagName === "main"))
    add(
      "warning",
      "Main landmark missing",
      "Use one main landmark for the primary content of a full page.",
    );
  return findings.length
    ? findings
    : [
        {
          severity: "info",
          title: "No common structural issues found",
          detail:
            "This is a static source check, not a full accessibility audit. Test keyboard access, contrast, dynamic states and assistive technology separately.",
        },
      ];
}
