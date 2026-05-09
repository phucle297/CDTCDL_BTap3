/**
 * SVG manipulation utilities
 * Placeholder for SVG editor logic
 */

/**
 * Create an SVG element with given attributes
 */
export function createSVGElement<T extends keyof SVGElementTagNameMap>(
  tag: T,
  attrs: Record<string, string | number>
): SVGElementTagNameMap[T] {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, String(value));
  });
  return el;
}

/**
 * Serialize SVG element to string
 */
export function serializeSVG(svgElement: SVGElement): string {
  const serializer = new XMLSerializer();
  return serializer.serializeToString(svgElement);
}

/**
 * Parse SVG string into a document
 */
export function parseSVG(svgString: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(svgString, 'image/svg+xml');
}
