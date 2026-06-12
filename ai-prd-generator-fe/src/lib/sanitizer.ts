export function sanitizeHTML(html: string): string {
  if (typeof window === 'undefined') return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const ALLOWED_TAGS = new Set([
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr',
    'ul', 'ol', 'li', 'pre', 'code', 'blockquote',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'strong', 'em', 'span', 'div', 'a'
  ]);

  const ALLOWED_ATTRS = new Set(['href', 'target', 'class', 'rel']);

  const sanitizeNode = (node: Node) => {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        const tagName = el.tagName.toLowerCase();

        if (!ALLOWED_TAGS.has(tagName)) {
          el.parentNode?.removeChild(el);
          continue;
        }

        const attrs = Array.from(el.attributes);
        for (const attr of attrs) {
          const attrName = attr.name.toLowerCase();

          if (!ALLOWED_ATTRS.has(attrName) || attrName.startsWith('on')) {
            el.removeAttribute(attr.name);
            continue;
          }

          if (attrName === 'href') {
            const val = attr.value.trim().toLowerCase();
            if (val.startsWith('javascript:') || val.startsWith('data:')) {
              el.removeAttribute(attr.name);
            }
          }
        }

        sanitizeNode(el);
      } else if (child.nodeType !== Node.TEXT_NODE) {
        child.parentNode?.removeChild(child);
      }
    }
  };

  sanitizeNode(doc.body);
  return doc.body.innerHTML;
}
