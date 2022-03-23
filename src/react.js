import { ELEMENT_TEXT } from "./constants";
import scheduleRoot from "./schedule";
import { Update } from "./updateQueue";

function createElement(type, config, ...children) {
  const { key, ...props } = config;
  delete props.__self;
  delete props.__source;
  props.children = children.map((child) => {
    return typeof child === "string" || typeof child === "number"
      ? {
          type: ELEMENT_TEXT,
          props: { text: child },
        }
      : child;
  });

  return {
    type,
    props,
  };
}

class Component {
  constructor(props) {
    this.props = props;
  }
  static isReactComponent = true;
  setState(nextState) {
    const update = new Update(nextState);
    this.internalFiber.updateQueue.enqueue(update);
    scheduleRoot();
  }
}

const React = {
  createElement,
  Component,
};

export default React;
