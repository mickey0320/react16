import { TAG_ROOT } from "./constants";
import scheduleRoot from "./schedule";

function render(vdom, container) {
  const rootFiber = {
    tag: TAG_ROOT,
    stateNode: container,
    props: { children: [vdom] },
  };
  scheduleRoot(rootFiber);
}

const ReactDOM = {
  render,
};

export default ReactDOM;
