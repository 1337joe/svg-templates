import { describe, it, expect } from "vitest";
import { addGroup, initSvg, nsInkscape, nsSvg, truncatedConeParameters } from "../src/js/template-functions.js";

describe("initSvg", () => {
  it("resets and initializes an svg with title metadata", () => {
    // stub elements for testing without a DOM
    class MockElement {
      constructor(tagName) {
        this.tagName = tagName;
        this.attributes = new Map();
        this.children = [];
        this.textContent = "";
      }

      setAttribute(name, value) {
        this.attributes.set(name, value);
      }

      getAttribute(name) {
        return this.attributes.get(name);
      }
    }

    const svg = {
      innerHTML: "existing content",
      attributes: new Map(),
      children: [],
      setAttribute(name, value) {
        this.attributes.set(name, value);
      },
      getAttribute(name) {
        return this.attributes.get(name);
      },
      appendChild(child) {
        this.children.push(child);
      },
    };

    const originalDocument = global.document;
    global.document = {
      createElementNS(namespace, tagName) {
        const element = new MockElement(tagName);
        element.namespaceURI = namespace;
        return element;
      },
    };

    const expectedTitle = "Template Name";

    try {
      initSvg(svg, expectedTitle);
    } finally {
      global.document = originalDocument; // restore original document after test
    }

    expect(svg.innerHTML).toBe("");

    expect(svg.children).toHaveLength(1);
    const title = svg.children[0];
    expect(title.tagName).toBe("title");
    expect(title.namespaceURI).toBe(nsSvg);
    expect(title.getAttribute("id")).not.toBeNull();
    const actualTitleId = title.getAttribute("id");
    expect(title.textContent).toBe(expectedTitle);

    expect(svg.getAttribute("role")).toBe("img");
    expect(svg.getAttribute("aria-labelledby")).toBe(actualTitleId);
    expect(svg.getAttribute("xmlns")).toBe(nsSvg);
    expect(svg.getAttribute("xmlns:inkscape")).toBe(nsInkscape);
  });
});

describe("addGroup", () => {
  it("creates and appends an inkscape layer group", () => {
    // stub elements for testing without a DOM
    const svg = {
      children: [],
      appendChild(child) {
        this.children.push(child);
      },
    };

    const createdGroups = [];
    const originalDocument = global.document;
    global.document = {
      createElementNS(namespace, tagName) {
        const attributesNs = [];
        const group = {
          tagName,
          namespaceURI: namespace,
          attributesNs,
          setAttributeNS(ns, name, value) {
            this.attributesNs.push({ ns, name, value });
          },
        };
        createdGroups.push(group);
        return group;
      },
    };

    const expectedLabel = "Layer Name";

    let group;
    try {
      group = addGroup(svg, expectedLabel);
    } finally {
      global.document = originalDocument; // restore original document after test
    }

    expect(createdGroups).toHaveLength(1);
    expect(group).toBe(createdGroups[0]);
    expect(group.tagName).toBe("g");
    expect(group.namespaceURI).toBe(nsSvg);
    expect(group.attributesNs).toEqual([
      { ns: nsInkscape, name: "inkscape:label", value: expectedLabel },
      { ns: nsInkscape, name: "inkscape:groupmode", value: "layer" },
    ]);
    expect(svg.children).toEqual([group]);
  });
});

describe("truncatedConeParameters", () => {
  it("calculates parameters for a simple truncated cone", () => {
    // 3:4:5 triangle for easy verification (note that maxD is diameter, so double the 3)
    const truncatedHeight = 1 / 4; // cut off the bottom 1/4 of the cone, calculate height, min diameter, and resulting inner radius from this
    const parameters = truncatedConeParameters(6, 6 * truncatedHeight, 4 * (1 - truncatedHeight));
    expect(parameters.outerRadius).toBeCloseTo(5);
    expect(parameters.innerRadius).toBeCloseTo(5 * truncatedHeight);
    expect(parameters.coneAngleRad).toBeCloseTo((216 * Math.PI) / 180);
  });
});
