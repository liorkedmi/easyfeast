import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const createUrl = (pathname, params) => {
  const paramsString = params.toString();
  const queryString = `${paramsString.length ? "?" : ""}${paramsString}`;

  return `${pathname}${queryString}`;
};

export const inlineStyles = (doc) => {
  const allElements = doc.getElementsByTagName("*");

  // Iterate through each element
  for (let i = 0; i < allElements.length; i++) {
    const element = allElements[i];

    if (
      ["META", "SCRIPT", "STYLE", "LINK", "TITLE"].includes(element.tagName)
    ) {
      continue;
    }

    // Get the computed style of the element
    const computedStyle = getComputedStyle(element);

    // Create a style attribute string
    let inlineStyle = "";

    // Iterate through the computed style properties and add them to the inline style
    for (let j = 0; j < computedStyle.length; j++) {
      const property = computedStyle[j];
      const value = computedStyle.getPropertyValue(property);
      inlineStyle += `${property}: ${value}; `;
    }

    // Set the inline style attribute of the element
    element.style.cssText = inlineStyle;
  }
};

export const getAttachmentFile = (content, filename) => {
  let node;
  let file;

  try {
    const html = content;

    node = document.createElement("dummy");
    node.style.display = "none";
    node.innerHTML = html;
    node
      .querySelectorAll("meta, title, script, link, style")
      .forEach((node) => {
        node.remove();
      });

    document.body.appendChild(node);

    inlineStyles(node);

    file = new File([node.innerHTML], filename, {
      type: "text/html",
    });
  } finally {
    node.remove();
  }

  return file;
};
