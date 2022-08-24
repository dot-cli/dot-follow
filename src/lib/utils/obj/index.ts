// Removes null and undefined entries
// Warning: it mutates the object
export const removeEmptyEntries = (obj: Record<any, any>): Record<any, any> => {
  for (const key in obj) {
    if (obj[key] === null || obj[key] === undefined) {
      delete obj[key]
    }
  }
  return obj
}
