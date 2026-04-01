/* General functions for creating Inkscape-compatible SVG templates. */

const nsSvg = "http://www.w3.org/2000/svg";
const nsInkscape = "http://www.inkscape.org/namespaces/inkscape";

/**
 * Initializes the provided SVG element with accessibility attributes and a title.
 * @param {SVGSVGElement} svg The SVG element to initialize.
 * @param {string} title The title to set for the SVG element.
 */
function initSvg(svg, title) {
  svg.innerHTML = "";
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-labelledby", "templateTitle");
  svg.setAttribute("xmlns", nsSvg);
  svg.setAttribute("xmlns:inkscape", nsInkscape);

  const titleElement = document.createElementNS(nsSvg, "title");
  titleElement.setAttribute("id", "templateTitle");
  titleElement.textContent = title;
  svg.appendChild(titleElement);
}

/**
 * Adds an SVG group element to the provided SVG element with the specified label for Inkscape layer support.
 * @param {SVGSVGElement} svg The SVG element to which the group will be added.
 * @param {string} label The Inkscapelabel to set for the group element.
 * @returns {SVGGElement} The created SVG group element.
 */
function addGroup(svg, label) {
  const group = document.createElementNS(nsSvg, "g");

  group.setAttributeNS(nsInkscape, "inkscape:label", label);
  group.setAttributeNS(nsInkscape, "inkscape:groupmode", "layer");

  svg.appendChild(group);

  return group;
}

export { nsSvg, nsInkscape, initSvg, addGroup };

/* Functions for truncated cone calculations. */

/**
 * Given the measurable dimensions of a truncated cone, calcualtes the parameters needed to unwrap the outer surface of the cone into a flat template.
 * @param {number} dMax The outer diameter of the truncated cone.
 * @param {number} dMin The diameter at the point of truncation.
 * @param {number} h The height of the truncated cone.
 * @returns {Object}
 */
function truncatedConeParameters(dMax, dMin, h) {
  const arcLengthTop = Math.PI * dMax;
  const arcLengthBottom = Math.PI * dMin;
  const slantHeight = Math.sqrt(Math.pow(h, 2) + Math.pow((dMax - dMin) / 2, 2));

  const innerRadius = (arcLengthBottom * slantHeight) / (arcLengthTop - arcLengthBottom);
  const coneAngleRad = arcLengthBottom / innerRadius;
  const outerRadius = innerRadius + slantHeight;

  return {
    coneAngleRad,
    innerRadius,
    outerRadius,
  };
}

export { truncatedConeParameters };
