import { truncatedConeParameters, nsSvg, nsInkscape, initSvg, addGroup } from "./template-functions.js";

/* SVG style parameters */
const templateFill = "#EEEEEE";
const templateStroke = "none";

const logoFill = "none";
const logoStroke = "red";
const logoStrokeDasharray = "1 1";

const logoMaskFill = "lightgray";
const logoMaskStroke = "none";

const form = document.getElementById("templateForm");

const templateContainer = document.getElementById("templateContainer");
const svg = document.querySelector("svg");
const downloadLink = document.getElementById("downloadLink");

const templateParametersTable = document.getElementById("templateParameters");
const tableTopRadiusValue = document.getElementById("topRadiusValue");
const tableBottomRadiusValue = document.getElementById("bottomRadiusValue");
const tableConeAngleValue = document.getElementById("coneAngleValue");
const graphicParametersTable = document.getElementById("graphicParameters");
const tableGraphicCenterRadiusValue = document.getElementById("graphicCenterRadiusValue");
const tableGraphicTopRadiusValue = document.getElementById("graphicTopRadiusValue");
const tableGraphicBottomRadiusValue = document.getElementById("graphicBottomRadiusValue");
const tableGraphicAngleValue = document.getElementById("graphicAngleValue");

function updateTableResults(units, toMm, topRadius, bottomRadius, coneAngleRad) {
  tableTopRadiusValue.textContent = (topRadius / toMm).toFixed(2) + " " + units;
  tableBottomRadiusValue.textContent = (bottomRadius / toMm).toFixed(2) + " " + units;
  tableConeAngleValue.textContent = (coneAngleRad * (180 / Math.PI)).toFixed(2) + "°";
}

function updateGraphicTableResults(units, toMm, topRadius, centerRadius, bottomRadius, coneAngleRad) {
  tableGraphicTopRadiusValue.textContent = (topRadius / toMm).toFixed(2) + " " + units;
  tableGraphicCenterRadiusValue.textContent = (centerRadius / toMm).toFixed(2) + " " + units;
  tableGraphicBottomRadiusValue.textContent = (bottomRadius / toMm).toFixed(2) + " " + units;
  tableGraphicAngleValue.textContent = (coneAngleRad * (180 / Math.PI)).toFixed(2) + "°";
}

function polar(radius, angle) {
  // Adjust so 0 is up
  return {
    x: radius * Math.cos(angle - Math.PI / 2),
    y: radius * Math.sin(angle - Math.PI / 2),
  };
}

function updateTemplateResults(event) {
  event.preventDefault();

  const units = document.getElementById("units").value;
  const toMm = units === "mm" ? 1 : units === "cm" ? 10 : 25.4;

  const topDiameter = Number(document.getElementById("topDiameter").value) * toMm;
  const bottomDiameter = Number(document.getElementById("bottomDiameter").value) * toMm;
  const height = Number(document.getElementById("height").value) * toMm;

  const logoWidth = Number(document.getElementById("logoSizeX").value || 0) * toMm;
  const logoHeight = Number(document.getElementById("logoSizeY").value || 0) * toMm;
  const logoCenterHeight = Number(document.getElementById("logoHeight").value || 0) * toMm;
  const logoMaskRadius = Number(document.getElementById("logoMaskingWidth").value || 0) * toMm;
  const alignmentBumpSize = Number(document.getElementById("logoAlignmentMarker").value || 0) * toMm;

  const hasLogo = logoWidth > 0 && logoHeight > 0;

  initSvg(svg, "Truncated Cone Template");

  const templateLayer = addGroup(svg, "Full Template");

  if (topDiameter == bottomDiameter) {
    // Handle simple case of a cylinder
    templateParametersTable.style.display = "none";

    const templateWidth = Math.PI * topDiameter;
    const templateHeight = height;

    // size for and render full cylinder template
    svg.setAttribute("viewBox", `0 ${hasLogo ? -alignmentBumpSize : 0} ${templateWidth} ${templateHeight}`);
    svg.setAttribute("width", templateWidth / toMm + units);
    svg.setAttribute("height", templateHeight / toMm + units);

    const template = document.createElementNS(nsSvg, "rect");
    template.setAttribute("x", "0");
    template.setAttribute("y", "0");
    template.setAttribute("width", templateWidth);
    template.setAttribute("height", templateHeight);
    template.setAttribute("fill", templateFill);
    template.setAttribute("stroke", templateStroke);
    template.setAttributeNS(nsInkscape, "inkscape:label", "Outline");
    templateLayer.appendChild(template);

    // populate SVG with logo placeholder
    if (hasLogo) {
      const logoLayer = addGroup(svg, "Logo");

      const logoMaskWidth = logoWidth + 2 * logoMaskRadius;
      const logoMaskHeight = templateHeight - logoCenterHeight + logoHeight / 2 + logoMaskRadius;
      const logoMask = document.createElementNS(nsSvg, "path");
      logoMask.setAttribute(
        "d",
        [
          `M ${(templateWidth - logoMaskWidth) / 2} 0`,
          `l ${logoMaskWidth / 2 - alignmentBumpSize} 0`,
          `${alignmentBumpSize} ${-alignmentBumpSize}`,
          `${alignmentBumpSize} ${alignmentBumpSize}`,
          `${logoMaskWidth / 2 - alignmentBumpSize} 0`,
          `0 ${logoMaskHeight}`,
          `${-logoMaskWidth / 2 + alignmentBumpSize} 0`,
          `${-alignmentBumpSize} ${alignmentBumpSize}`,
          `${-alignmentBumpSize} ${-alignmentBumpSize}`,
          `${-logoMaskWidth / 2 + alignmentBumpSize} 0`,
          "Z",
        ].join(" "),
      );
      logoMask.setAttribute("fill", logoMaskFill);
      logoMask.setAttribute("stroke", logoMaskStroke);
      logoMask.setAttributeNS(nsInkscape, "inkscape:label", "Logo Surrounding Mask");
      logoLayer.appendChild(logoMask);

      const logo = document.createElementNS(nsSvg, "rect");
      logo.setAttribute("x", (templateWidth - logoWidth) / 2);
      logo.setAttribute("y", templateHeight - logoCenterHeight - logoHeight / 2);
      logo.setAttribute("width", logoWidth);
      logo.setAttribute("height", logoHeight);
      logo.setAttribute("fill", logoFill);
      logo.setAttribute("stroke", logoStroke);
      logo.setAttribute("stroke-dasharray", logoStrokeDasharray);
      logo.setAttributeNS(nsInkscape, "inkscape:label", "Logo Placeholder");
      logoLayer.appendChild(logo);
    }
  } else {
    // calculate the cone parameters
    const flip = topDiameter < bottomDiameter;
    var maxD = flip ? bottomDiameter : topDiameter;
    var minD = flip ? topDiameter : bottomDiameter;
    const fullCone = truncatedConeParameters(maxD, minD, height);

    const halfAngle = fullCone.coneAngleRad / 2;
    const outerStart = polar(fullCone.outerRadius, -halfAngle);
    const innerStart = polar(fullCone.innerRadius, -halfAngle);
    const largeArcFlag = fullCone.coneAngleRad > Math.PI ? 1 : 0;
    const outerSweepFlag = flip ? 0 : 1;
    const innerSweepFlag = flip ? 1 : 0;

    updateTableResults(
      units,
      toMm,
      flip ? fullCone.innerRadius : fullCone.outerRadius,
      flip ? fullCone.outerRadius : fullCone.innerRadius,
      fullCone.coneAngleRad,
    );
    templateParametersTable.style.display = "block";

    const minX = largeArcFlag ? -fullCone.outerRadius : outerStart.x;
    const maxX = largeArcFlag ? fullCone.outerRadius : -outerStart.x;
    var minY, maxY;
    if (flip) {
      outerStart.y = -outerStart.y;
      innerStart.y = -innerStart.y;
      minY = Math.min(outerStart.y, innerStart.y);
      maxY = fullCone.outerRadius + alignmentBumpSize;
    } else {
      minY = -fullCone.outerRadius - alignmentBumpSize;
      maxY = Math.max(outerStart.y, innerStart.y);
    }

    // size for and render full cone template
    svg.setAttribute("viewBox", `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);
    svg.setAttribute("width", (maxX - minX) / toMm + units);
    svg.setAttribute("height", (maxY - minY) / toMm + units);

    const template = document.createElementNS(nsSvg, "path");
    template.setAttribute(
      "d",
      [
        `M ${outerStart.x} ${outerStart.y}`,
        `A ${fullCone.outerRadius} ${fullCone.outerRadius} 0 ${largeArcFlag} ${outerSweepFlag} ${-outerStart.x} ${outerStart.y}`,
        `L ${-innerStart.x} ${innerStart.y}`,
        `A ${fullCone.innerRadius} ${fullCone.innerRadius} 0 ${largeArcFlag} ${innerSweepFlag} ${innerStart.x} ${innerStart.y}`,
        "Z",
      ].join(" "),
    );
    template.setAttribute("fill", templateFill);
    template.setAttribute("stroke", templateStroke);
    template.setAttributeNS(nsInkscape, "inkscape:label", "Outline");
    templateLayer.appendChild(template);

    // populate SVG with logo placeholder
    if (hasLogo) {
      const logoCenterRadius = flip ? fullCone.outerRadius - logoCenterHeight : fullCone.innerRadius + logoCenterHeight;
      const logoHalfAngle = logoWidth / logoCenterRadius / 2;
      const logoMaskHalfAngle = (logoWidth + 2 * logoMaskRadius) / logoCenterRadius / 2;

      const logoOuterStart = polar(logoCenterRadius + logoHeight / 2, -logoHalfAngle);
      const logoCenterStart = polar(logoCenterRadius, -logoHalfAngle);
      const logoInnerStart = polar(logoCenterRadius - logoHeight / 2, -logoHalfAngle);
      var logoMaskTopRadius, logoMaskBottomRadius;
      var logoMaskOuterStart, logoMaskInnerStart;
      if (flip) {
        logoOuterStart.y = -logoOuterStart.y;
        logoCenterStart.y = -logoCenterStart.y;
        logoInnerStart.y = -logoInnerStart.y;

        logoMaskTopRadius = fullCone.innerRadius;
        logoMaskBottomRadius = logoCenterRadius + logoHeight / 2 + logoMaskRadius;
        logoMaskOuterStart = polar(-logoMaskTopRadius, -logoMaskHalfAngle);
        logoMaskInnerStart = polar(-logoMaskBottomRadius, -logoMaskHalfAngle);
      } else {
        logoMaskTopRadius = fullCone.outerRadius;
        logoMaskBottomRadius = logoCenterRadius - logoHeight / 2 - logoMaskRadius;
        logoMaskOuterStart = polar(logoMaskTopRadius, -logoMaskHalfAngle);
        logoMaskInnerStart = polar(logoMaskBottomRadius, -logoMaskHalfAngle);
      }

      updateGraphicTableResults(
        units,
        toMm,
        logoCenterRadius + ((flip ? -1 : 1) * logoHeight) / 2,
        logoCenterRadius,
        logoCenterRadius - ((flip ? -1 : 1) * logoHeight) / 2,
        2 * logoHalfAngle,
      );
      graphicParametersTable.style.display = null;

      const logoLayer = addGroup(svg, "Logo");

      const logoMask = document.createElementNS(nsSvg, "path");
      logoMask.setAttribute(
        "d",
        [
          `M ${logoMaskOuterStart.x} ${logoMaskOuterStart.y}`,
          `A ${logoMaskTopRadius} ${logoMaskTopRadius} 0 0 1 ${-logoMaskOuterStart.x} ${logoMaskOuterStart.y}`,
          `L ${-logoMaskInnerStart.x} ${logoMaskInnerStart.y}`,
          `A ${logoMaskBottomRadius} ${logoMaskBottomRadius} 0 0 0 ${logoMaskInnerStart.x} ${logoMaskInnerStart.y}`,
          "Z",
          `M ${-alignmentBumpSize} ${flip ? logoMaskTopRadius : -logoMaskTopRadius}`,
          `l ${alignmentBumpSize} ${-alignmentBumpSize}`,
          `${alignmentBumpSize} ${alignmentBumpSize}`,
          `M ${alignmentBumpSize} ${flip ? logoMaskBottomRadius : -logoMaskBottomRadius}`,
          `l ${-alignmentBumpSize} ${alignmentBumpSize}`,
          `${-alignmentBumpSize} ${-alignmentBumpSize}`,
        ].join(" "),
      );
      logoMask.setAttribute("fill", logoMaskFill);
      logoMask.setAttribute("stroke", logoMaskStroke);
      logoMask.setAttributeNS(nsInkscape, "inkscape:label", "Logo Surrounding Mask");
      logoLayer.appendChild(logoMask);

      const logo = document.createElementNS(nsSvg, "path");
      logo.setAttribute(
        "d",
        [
          `M ${logoCenterStart.x} ${logoCenterStart.y}`,
          `A ${logoCenterRadius} ${logoCenterRadius} 0 0 ${flip ? 0 : 1} 0 ${flip ? logoCenterRadius : -logoCenterRadius}`,
          `A ${logoCenterRadius} ${logoCenterRadius} 0 0 ${flip ? 0 : 1} ${-logoCenterStart.x} ${logoCenterStart.y}`,
          `M ${logoOuterStart.x} ${logoOuterStart.y}`,
          `A ${logoCenterRadius + logoHeight / 2} ${logoCenterRadius + logoHeight / 2} 0 0 ${flip ? 0 : 1} ${-logoOuterStart.x} ${logoOuterStart.y}`,
          `L ${-logoInnerStart.x} ${logoInnerStart.y}`,
          `A ${logoCenterRadius - logoHeight / 2} ${logoCenterRadius - logoHeight / 2} 0 0 ${flip ? 1 : 0} ${logoInnerStart.x} ${logoInnerStart.y}`,
          "Z",
        ].join(" "),
      );
      logo.setAttribute("fill", logoFill);
      logo.setAttribute("stroke", logoStroke);
      logo.setAttribute("stroke-dasharray", logoStrokeDasharray);
      logo.setAttributeNS(nsInkscape, "inkscape:label", "Logo Placeholder");
      logoLayer.appendChild(logo);
    } else {
      graphicParametersTable.style.display = "none";
    }
  }

  downloadLink.setAttribute("href", "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.outerHTML));
  templateContainer.style.display = "block";
}

function resetTemplateResults() {
  templateContainer.style.display = "none";
}

form.addEventListener("submit", updateTemplateResults);
form.addEventListener("reset", resetTemplateResults);
