import {
  DELETION,
  ELEMENT_TEXT,
  PLACEMENT,
  TAG_CLASS,
  TAG_FUNCTION,
  TAG_HOST,
  TAG_ROOT,
  TAG_TEXT,
  UPDATE,
} from "./constants";
import { UpdateQueue } from "./updateQueue";
import { updateProps } from "./utils";

let workInProgressRoot = null;
let nextUnitOfWork = null;
let currentRoot = null;
const deletions = [];

function scheduleRoot(rootFiber) {
  if (currentRoot && currentRoot.alternate) {
    workInProgressRoot = currentRoot.alternate;
    if (rootFiber) {
      workInProgressRoot.props = rootFiber.props;
    }
    workInProgressRoot.alternate = currentRoot;
  } else if (currentRoot) {
    if (rootFiber) {
      rootFiber.alternate = currentRoot;
      workInProgressRoot = rootFiber;
    } else {
      workInProgressRoot = {
        ...currentRoot,
        alternate: currentRoot,
      };
    }
  } else {
    workInProgressRoot = rootFiber;
  }
  workInProgressRoot.firstEffect =
    workInProgressRoot.lastEffect =
    workInProgressRoot.nextEffect =
      null;
  nextUnitOfWork = workInProgressRoot;
}

function workLoop(deadline) {
  while (nextUnitOfWork && deadline.timeRemaining() > 1) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  if (!nextUnitOfWork) {
    // 进入commit阶段
    commitRoot();
  }
  window.requestIdleCallback(workLoop, {
    timeout: 500,
  });
}

function performUnitOfWork(currentFiber) {
  beginWork(currentFiber);
  if (currentFiber.child) {
    return currentFiber.child;
  }
  while (currentFiber) {
    completeUnitOfWork(currentFiber);
    if (currentFiber.sibling) {
      return currentFiber.sibling;
    }
    currentFiber = currentFiber.return;
  }
}

function beginWork(currentFiber) {
  if (currentFiber.tag === TAG_ROOT) {
    updateTagRoot(currentFiber);
  } else if (currentFiber.tag === TAG_TEXT) {
    updateTagText(currentFiber);
  } else if (currentFiber.tag === TAG_HOST) {
    updateTagHost(currentFiber);
  } else if (currentFiber.tag === TAG_CLASS) {
    updateTagClass(currentFiber);
  }
}

function updateTagRoot(currentFiber) {
  const children = currentFiber.props.children;
  reconcileChildren(currentFiber, children);
}
function updateTagText(currentFiber) {
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDOM(currentFiber);
  }
}
function updateTagHost(currentFiber) {
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDOM(currentFiber);
  }
  updateProps(currentFiber.stateNode, {}, currentFiber.props);
  const newChildren = currentFiber.props.children;
  reconcileChildren(currentFiber, newChildren);
}
function updateTagClass(currentFiber) {
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = new currentFiber.type(currentFiber.props);
    currentFiber.stateNode.internalFiber = currentFiber;
    currentFiber.updateQueue = new UpdateQueue();
  }
  currentFiber.stateNode.state = currentFiber.updateQueue.forceUpdate(
    currentFiber.stateNode.state
  );
  const newElement = currentFiber.stateNode.render();
  reconcileChildren(currentFiber, [newElement]);
}

function createDOM(currentFiber) {
  if (currentFiber.tag === TAG_TEXT) {
    return document.createTextNode(currentFiber.props.text);
  } else if (currentFiber.tag === TAG_HOST) {
    return document.createElement(currentFiber.type);
  }
}

function reconcileChildren(currentFiber, children) {
  let currentIndex = 0;
  let previousFiber;
  let oldFiber = currentFiber.alternate && currentFiber.alternate.child;
  if (oldFiber) {
    oldFiber.firstEffect = oldFiber.lastEffect = oldFiber.nextEffect = null;
  }
  while (currentIndex < children.length || oldFiber) {
    const child = children[currentIndex];
    let tag;
    const isSameType = child && oldFiber && oldFiber.type === child.type;
    let newFiber;
    if (child && child.type === ELEMENT_TEXT) {
      tag = TAG_TEXT;
    } else if (child && typeof child.type === "string") {
      tag = TAG_HOST;
    } else if (child && typeof child.type === "function") {
      if (child.type.isReactComponent) {
        tag = TAG_CLASS;
      } else {
        tag = TAG_FUNCTION;
      }
    }
    if (isSameType) {
      if (oldFiber.alternate) {
        newFiber = oldFiber.alternate;
        newFiber.props = child.props;
        newFiber.alternate = oldFiber;
        newFiber.effectTag = UPDATE;
        newFiber.nextEffect = null;
        newFiber.updateQueue = oldFiber.updateQueue;
      } else {
        newFiber = {
          tag: oldFiber.tag,
          stateNode: oldFiber.stateNode,
          type: oldFiber.type,
          props: child.props,
          return: currentFiber,
          effectTag: UPDATE,
          alternate: oldFiber,
          updateQueue: oldFiber.updateQueue,
        };
      }
    } else {
      if (child) {
        newFiber = {
          tag,
          stateNode: null,
          type: child.type,
          props: child.props,
          return: currentFiber,
          effectTag: PLACEMENT,
        };
      }
      if (oldFiber) {
        oldFiber.effectTag = DELETION;
        deletions.push(oldFiber);
      }
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    if (newFiber) {
      if (currentIndex === 0) {
        currentFiber.child = newFiber;
      } else {
        previousFiber.sibling = newFiber;
      }
      previousFiber = newFiber;
      currentIndex++;
    }
  }
}

// 构建effectList
function completeUnitOfWork(currentFiber) {
  const returnFiber = currentFiber.return;
  if (returnFiber) {
    if (!returnFiber.firstEffect) {
      returnFiber.firstEffect = currentFiber.firstEffect;
    }
    if (currentFiber.lastEffect) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber.firstEffect;
      }
      returnFiber.lastEffect = currentFiber.lastEffect;
    }
    const effectTag = currentFiber.effectTag;
    if (effectTag) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber;
      } else {
        returnFiber.firstEffect = currentFiber;
      }
      returnFiber.lastEffect = currentFiber;
    }
  }
}

function commitRoot() {
  if (!workInProgressRoot) return;
  deletions.forEach(commitWork);
  let currentFiber = workInProgressRoot.firstEffect;
  while (currentFiber) {
    commitWork(currentFiber);
    currentFiber = currentFiber.nextEffect;
  }
  currentRoot = workInProgressRoot;
  workInProgressRoot = null;
  deletions.length = 0;
}

function commitWork(currentFiber) {
  let returnFiber = currentFiber.return;

  while (
    returnFiber.tag !== TAG_ROOT &&
    returnFiber.tag !== TAG_HOST &&
    returnFiber.tag !== TAG_TEXT
  ) {
    returnFiber = returnFiber.return;
  }
  const returnDOM = returnFiber.stateNode;
  if (currentFiber.effectTag === PLACEMENT) {
    let nextFiber = currentFiber;
    while (nextFiber.tag !== TAG_HOST && nextFiber.tag !== TAG_TEXT) {
      nextFiber = nextFiber.child;
    }
    returnDOM.appendChild(nextFiber.stateNode);
  } else if (currentFiber.effectTag === DELETION) {
    commitDeletion(currentFiber, returnDOM);
  } else if (currentFiber.effectTag === UPDATE) {
    if (currentFiber.tag === TAG_TEXT) {
      if (currentFiber.props.text !== currentFiber.alternate.props.text) {
        currentFiber.stateNode.textContent = currentFiber.props.text;
      }
    } else if (currentFiber.tag === TAG_HOST) {
      updateProps(
        currentFiber.stateNode,
        currentFiber.alternate.props,
        currentFiber.props
      );
    }
  }
}

function commitDeletion(currentFiber, returnDOM) {
  if (currentFiber.tag === TAG_HOST || currentFiber.tag === TAG_TEXT) {
    returnDOM.removeChild(currentFiber.stateNode);
  } else {
    commitDeletion(currentFiber.child, returnDOM);
  }
}

window.requestIdleCallback(workLoop, {
  timeout: 500,
});

export default scheduleRoot;
