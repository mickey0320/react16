export function updateProps(dom, oldProps, newProps) {
  for (let key in oldProps) {
    if (!newProps.hasOwnProperty(key)) {
      dom.removeAttribute(key);
    }
  }
  for (let key in newProps) {
    if (key === "children") {
    } else if (/^on/.test(key)) {
      dom[key.toLocaleLowerCase()] = newProps[key];
    } else if (key === "style") {
      for (let styleKey in newProps.style) {
        dom.style[styleKey] = newProps.style[styleKey];
      }
    } else {
      dom.setAttribute(key, newProps[key]);
    }
  }
}
