
export function exceptCoreErrors(fn) {

  return (error) => {
    if ([TypeError, SyntaxError, ReferenceError].find(errorType => error instanceof errorType)) {
      throw error;
    } else {
      return fn(error);
    }
  };
}

export function isControlField(field) {
  return field.subfields === undefined;
}

export function isCoreError(error) {
  return ([EvalError, RangeError, URIError, TypeError, SyntaxError, ReferenceError].some(errorType => error instanceof errorType));
}
