export function isEmpty(obj: Record<string, any>): boolean {
  return Object.entries(obj).length === 0 && obj.constructor === Object;
}

export function hasOwnProperty(obj: Record<any, any>, property: string): boolean {
  if (!obj) {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(obj, property);
}

export function deleteKey(obj: Record<string, any>, target: string): Record<string, any> {
  const newObj = Object.create(null);
  Object.keys(obj).forEach((key) => {
    if (key !== target) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
}
