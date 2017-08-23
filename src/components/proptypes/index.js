const types = {
  Element(props, propName, componentName) {
    if (typeof window === 'undefined') return null;
    else if (props[propName] instanceof window.Element === false) {
      return new Error(`Invalid prop '${propName}' supplied to '${componentName}'. Validation failed.`);
    }
    return null;
  },
  defaults: {
    Element: undefined,
  },
};

export default types;
