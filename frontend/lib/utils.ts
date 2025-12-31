/**
 * Utility functions for the frontend
 */

/**
 * Safely converts any value to a displayable string
 * Prevents "Objects are not valid as a React child" errors
 * 
 * @param value - Any value that needs to be displayed in JSX
 * @returns A string representation of the value
 */
export function toText(value: any): string {
  // Handle null or undefined
  if (value === null || value === undefined) {
    return '';
  }
  
  // Handle strings
  if (typeof value === 'string') {
    return value;
  }
  
  // Handle numbers and booleans
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  
  // Handle objects - extract common properties
  if (typeof value === 'object') {
    // Handle arrays
    if (Array.isArray(value)) {
      return value.map(item => toText(item)).join(', ');
    }
    
    // Handle objects with common display properties
    return value.name || value.title || value.email || value._id || JSON.stringify(value);
  }
  
  // Fallback
  return String(value);
}

/**
 * Safely get a nested property from an object
 * Returns empty string if property doesn't exist
 * 
 * @param obj - The object to get the property from
 * @param path - The path to the property (e.g., 'user.name')
 * @returns The property value or empty string
 */
export function safeGet(obj: any, path: string): string {
  try {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        return '';
      }
    }
    
    return toText(result);
  } catch {
    return '';
  }
}
