/**
 * SafeText Component
 * 
 * A wrapper component that safely renders any value, preventing
 * "Objects are not valid as a React child" errors
 */

import React from 'react';

interface SafeTextProps {
  value: any;
  fallback?: string;
  className?: string;
}

/**
 * Safely converts any value to a displayable string
 */
function toText(value: any): string {
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
    
    // Handle React elements (don't convert them)
    if (React.isValidElement(value)) {
      return value as any;
    }
    
    // Handle objects with common display properties
    return value.name || value.title || value.email || value._id || '[Object]';
  }
  
  // Fallback
  return String(value);
}

/**
 * Component that safely renders any value
 * 
 * Usage:
 * <SafeText value={user} /> // renders user.name or user.email
 * <SafeText value={user.name} /> // renders the name string
 * <SafeText value={someObject} fallback="N/A" /> // shows "N/A" if no displayable text
 */
export default function SafeText({ value, fallback = '', className }: SafeTextProps) {
  const text = toText(value) || fallback;
  
  // If it's a React element, return it directly
  if (React.isValidElement(text)) {
    return text;
  }
  
  return <span className={className}>{text}</span>;
}
