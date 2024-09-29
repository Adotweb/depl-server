function decycle(obj, seen = new WeakSet()) {
  // Handle non-object types (primitives) directly
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  // If we've already seen this object, it's a circular reference
  if (seen.has(obj)) {
    return '[Circular]';
  }

  // Add the object to the set of seen objects
  seen.add(obj);

  // Handle arrays (recursively decycle each element)
  if (Array.isArray(obj)) {
    return obj.map(item => decycle(item, seen));
  }

  // Handle objects (recursively decycle each key-value pair)
  const decycledObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      decycledObj[key] = decycle(obj[key], seen);
    }
  }

  return decycledObj;
}

module.exports = { decycle };
