# Object Rendering - Usage Examples

## Quick Fix Guide

### Problem
You're getting this error:
```
Error: Objects are not valid as a React child (found: object with keys {_id, name, email})
```

### Solution
Never render objects directly. Use one of these three methods:

---

## Method 1: Access Specific Properties ⭐ (RECOMMENDED)

This is the **best and most common** approach:

```tsx
// ❌ WRONG
<div>{user}</div>

// ✅ CORRECT
<div>
  <p>Name: {user?.name}</p>
  <p>Email: {user?.email}</p>
  <p>Phone: {user?.phone}</p>
</div>
```

### More Examples:

```tsx
// Display user info
<div className="user-card">
  <h3>{user?.name}</h3>
  <p>{user?.email}</p>
  {user?.phone && <p>{user.phone}</p>}
</div>

// Display course info
<div className="course-card">
  <h2>{course?.title}</h2>
  <p>{course?.description}</p>
  <span>${course?.price}</span>
</div>

// Display nested properties
<div>
  <p>{user?.profile?.bio}</p>
  <p>{order?.shippingAddress?.city}</p>
  <p>{product?.reviews?.length} reviews</p>
</div>

// Display in table
<tr>
  <td>{enrollment?.user?.name}</td>
  <td>{enrollment?.course?.title}</td>
  <td>{enrollment?.status}</td>
</tr>
```

---

## Method 2: Use SafeText Component

When you need a quick fallback or want to automatically extract displayable text:

```tsx
import SafeText from '@/components/SafeText';

// ❌ WRONG
<div>{user}</div>

// ✅ CORRECT - automatically shows user.name or user.email
<div>
  <SafeText value={user} />
</div>

// With fallback
<div>
  <SafeText value={user} fallback="No user" />
</div>

// With className
<div>
  <SafeText value={user?.name} className="font-bold text-lg" />
</div>
```

### SafeText Examples:

```tsx
// Display object with automatic property extraction
<SafeText value={user} /> 
// Shows: user.name or user.email or user._id

<SafeText value={course} />
// Shows: course.title or course._id

<SafeText value={product} />
// Shows: product.name or product.title or product._id

// With custom fallback
<SafeText value={order?.trackingNumber} fallback="N/A" />

// In a list
{items.map(item => (
  <div key={item._id}>
    <SafeText value={item.product?.name} fallback="Unknown Product" />
  </div>
))}
```

---

## Method 3: Use toText Utility

For programmatic conversion or when you need the text value:

```tsx
import { toText } from '@/lib/utils';

// ❌ WRONG
<div>{user}</div>

// ✅ CORRECT
<div>{toText(user)}</div>

// Use in computed values
const displayName = toText(user?.name) || 'Anonymous';
<div>{displayName}</div>

// Use in template literals
<div>Hello, {toText(user)}!</div>
```

### toText Examples:

```tsx
// Basic usage
<p>{toText(user)}</p>
<p>{toText(course)}</p>
<p>{toText(product)}</p>

// With optional chaining
<p>{toText(user?.profile?.bio)}</p>

// In arrays
<p>{toText([1, 2, 3])}</p> // "1, 2, 3"

// In conditions
<p>{user ? toText(user) : 'No user'}</p>
```

---

## Common Scenarios

### Scenario 1: Displaying User Info in a Card

```tsx
// ❌ WRONG
function UserCard({ user }) {
  return (
    <div>
      <p>{user}</p>
    </div>
  );
}

// ✅ CORRECT - Method 1 (Best)
function UserCard({ user }) {
  return (
    <div className="card">
      <h3>{user?.name}</h3>
      <p>{user?.email}</p>
      {user?.phone && <p>{user.phone}</p>}
      <p>{user?.role}</p>
    </div>
  );
}

// ✅ CORRECT - Method 2 (Quick)
function UserCard({ user }) {
  return (
    <div className="card">
      <SafeText value={user} className="font-bold" />
    </div>
  );
}
```

### Scenario 2: Displaying a List of Items

```tsx
// ❌ WRONG
function UserList({ users }) {
  return (
    <div>
      {users.map(user => (
        <div key={user._id}>{user}</div>
      ))}
    </div>
  );
}

// ✅ CORRECT
function UserList({ users }) {
  return (
    <div>
      {users.map(user => (
        <div key={user._id}>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
}
```

### Scenario 3: Displaying Nested Objects

```tsx
// ❌ WRONG
<div>
  <p>Address: {order.shippingAddress}</p>
</div>

// ✅ CORRECT
<div>
  <p>Street: {order?.shippingAddress?.street}</p>
  <p>City: {order?.shippingAddress?.city}</p>
  <p>Zip: {order?.shippingAddress?.zipCode}</p>
</div>

// ✅ ALSO CORRECT - Using SafeText
<div>
  <p>Address: <SafeText value={order?.shippingAddress} /></p>
</div>
```

### Scenario 4: Conditional Rendering

```tsx
// ❌ WRONG
<div>{user || 'No user'}</div>

// ✅ CORRECT
<div>{user?.name || 'No user'}</div>

// ✅ ALSO CORRECT
<div>
  {user ? (
    <span>{user.name}</span>
  ) : (
    <span>No user</span>
  )}
</div>

// ✅ ALSO CORRECT - Using SafeText
<div>
  <SafeText value={user} fallback="No user" />
</div>
```

### Scenario 5: In Table Rows

```tsx
// ❌ WRONG
<tr>
  <td>{enrollment.user}</td>
  <td>{enrollment.course}</td>
</tr>

// ✅ CORRECT
<tr>
  <td>{enrollment?.user?.name}</td>
  <td>{enrollment?.course?.title}</td>
  <td>{enrollment?.status}</td>
</tr>
```

### Scenario 6: In Forms

```tsx
// ❌ WRONG
<input value={user} />

// ✅ CORRECT
<input value={user?.name || ''} />

// For displaying object in read-only field
<input 
  value={toText(user)} 
  readOnly 
/>
```

---

## Advanced: safeGet Utility

For safely accessing deeply nested properties:

```tsx
import { safeGet } from '@/lib/utils';

// Instead of:
<p>{user?.profile?.settings?.notifications?.email}</p>

// Use:
<p>{safeGet(user, 'profile.settings.notifications.email')}</p>

// Examples:
<p>{safeGet(order, 'shippingAddress.city')}</p>
<p>{safeGet(product, 'reviews.0.comment')}</p>
<p>{safeGet(enrollment, 'user.profile.bio')}</p>
```

---

## Summary Table

| Scenario | Method | Example |
|----------|--------|---------|
| Display specific property | Access directly | `{user?.name}` |
| Display nested property | Optional chaining | `{user?.profile?.bio}` |
| Quick display of object | SafeText | `<SafeText value={user} />` |
| Need text value | toText | `{toText(user)}` |
| Deep nested access | safeGet | `{safeGet(user, 'profile.bio')}` |
| List of objects | map + properties | `{users.map(u => <div>{u.name}</div>)}` |

---

## Remember

✅ **DO:**
- Access specific properties: `{user?.name}`
- Use optional chaining: `{user?.profile?.bio}`
- Use SafeText when needed: `<SafeText value={user} />`

❌ **DON'T:**
- Render entire objects: `{user}`
- Render nested objects: `{user.profile}`
- Forget optional chaining: `{user.name}` (can crash if user is null)
