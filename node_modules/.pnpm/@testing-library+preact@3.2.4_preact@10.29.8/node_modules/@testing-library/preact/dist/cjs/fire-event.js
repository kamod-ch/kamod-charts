"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fireEvent = void 0;
var _dom = require("@testing-library/dom");
var _preact = require("preact");
let isCompat = false;

//  Detects if preact/compat is used
const oldHook = _preact.options.vnode;
_preact.options.vnode = vnode => {
  if (vnode.$$typeof) isCompat = true;
  if (oldHook) oldHook(vnode);
};

//  Renames event to match React (preact/compat) version
const renameEventCompat = key => {
  return key === 'change' ? 'input' : key;
};

// Similar to RTL we make are own fireEvent helper that just calls DTL's fireEvent with that
// we can that any specific behaviors to the helpers we need
const fireEvent = (...args) => (0, _dom.fireEvent)(...args);
exports.fireEvent = fireEvent;
Object.keys(_dom.fireEvent).forEach(key => {
  fireEvent[key] = (elem, init) => {
    // Preact registers event-listeners in lower-case, so onPointerStart becomes pointerStart
    // here we will copy this behavior, when we fire an element we will fire it in lowercase so
    // we hit the Preact listeners.
    const eventName = `on${key.toLowerCase()}`;
    const isInElem = (eventName in elem);
    // Preact changes all change events to input events when running 'preact/compat',
    // making the event name out of sync.
    // The problematic code is in: preact/compat/src/render.js > handleDomVNode()
    const keyFiltered = !isCompat ? key : renameEventCompat(key);
    return isInElem ? _dom.fireEvent[keyFiltered](elem, init) : (0, _dom.fireEvent)(elem, (0, _dom.createEvent)(keyFiltered[0].toUpperCase() + keyFiltered.slice(1), elem, init));
  };
});