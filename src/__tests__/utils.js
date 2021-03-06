/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
let changes = [];

function recordChangesToObjField(obj, field) {
  Object.defineProperty(obj, field, {
    get() {
      return this._current;
    },
    set(value) {
      changes.push(parseNode(value));
      console.log(value.selfBaseDuration)
      this._current = value;
    },
  });
}


function parseNode(node) {
  return {
    type: node.type,
    selfBaseDuration: node.selfBaseDuration,
    child: node.child,
    sibling: node.sibling
  }
}

function parseCompletedNode(node) {
  return {
    type: node.type,
    selfBaseDuration: node.selfBaseDuration,
  }
}


function mountToReactRoot(reactRoot) {
  // Reset changes
  changes = [];

  // Lift parent of react fibers tree
  const parent = reactRoot._reactRootContainer._internalRoot;
  const current = parent.current;

  // Add listener to react fibers tree so changes can be recorded
  recordChangesToObjField(parent, 'current');

  // Reassign react fibers tree to record initial state
  parent.current = current;
  return changes;
}


function traverseWith(fiber, callback) {
  callback(fiber);
  if (fiber.child) {
    traverseWith(fiber.child, callback);
  }
  if (fiber.sibling) {
    traverseWith(fiber.sibling, callback);
  }
}


/**
 *
 * @param {number} threshold The rendering time to filter for.
 */
function getAllSlowComponentRenders(threshold, changesArray) {
  const slowRenders = changesArray
    .map(flattenTree) // Flatten tree
    .flat() // Flatten 2d array into 1d array
    .filter((fiber) => checkTime(fiber, threshold)) // filter out all that don't meet threshold
    .map(parseCompletedNode) // removes circular references
  return slowRenders;
}



function flattenTree(tree) {
  // Closured array for storing fibers
  const arr = [];
  // Closured callback for adding to arr
  const callback = (fiber) => {
    arr.push(fiber);
  };
  traverseWith(tree, callback);
  return arr;
}



function checkTime(fiber, threshold) {
  return fiber.selfBaseDuration > threshold;
}



// module.exports = { mountToReactRoot, getAllSlowComponentRenders, traverseWith };
