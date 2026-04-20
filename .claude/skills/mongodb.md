# mongodb

Apply MongoDB + Node.js/Mongoose best practices to the current codebase.

## What this skill does

When invoked, review the relevant MongoDB/Mongoose code in context and apply (or explain) these best practices:

---

## Best Practices

### 1. Connection — singleton with global cache

Never open a new connection per request. Use a module-level cached connection:

```ts
// lib/mongodb.ts
import mongoose from 'mongoose'

declare global { var _mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } }

const cached = global._mongoose ?? (global._mongoose = { conn: null, promise: null })

export async function connectToDatabase() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI!, {
      bufferCommands: false,
    })
  }
  cached.conn = await cached.promise
  return cached.conn
}
```

**Why:** In serverless (Next.js, Cloud Run with cold starts), each invocation can create a new module scope. The `global` cache survives across hot reloads in dev and across requests in the same container instance in prod.

---

### 2. Always call `connectToDatabase()` before any query

```ts
// Every API route handler:
await connectToDatabase()
const user = await User.findById(id)
```

Never assume the connection is open. Mongoose buffers commands by default (`bufferCommands: true`) which can hide connection errors — keep `bufferCommands: false` to surface them early.

---

### 3. Models — prevent recompilation with `models.X || model()`

```ts
export const User = models.User || model<IUser>('User', userSchema)
```

In Next.js hot reload, modules re-run. Without this guard, Mongoose throws `"Cannot overwrite model once compiled"`.

---

### 4. Lean queries for read-only data

```ts
// Returns plain JS objects — much faster, no Mongoose overhead
const posts = await BlogPost.find({}).sort({ date: -1 }).limit(30).lean()
```

Use `.lean()` when you don't need virtuals, methods, or change tracking.

---

### 5. Select only the fields you need

```ts
// Only fetch name and email — never pull password into API responses
const user = await User.findById(id, 'name email watchlist')
```

Reduces wire size and prevents accidental data leaks.

---

### 6. Indexes — declare them in the schema

```ts
blogPostSchema.index({ date: -1 })          // fast sorted queries
userSchema.index({ email: 1 }, { unique: true })  // already unique: true in field def
```

For TTL indexes (auto-delete documents):
```ts
schema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 50 })
```

---

### 7. Upsert pattern for idempotent writes

```ts
await Profile.findOneAndUpdate(
  { userId },                          // filter
  { name, title, bio },               // update
  { upsert: true, new: true }         // create if missing, return updated doc
)
```

---

### 8. Error handling — always catch DB errors in API routes

```ts
try {
  await connectToDatabase()
  const user = await User.findById(id)
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(user)
} catch (err) {
  console.error('DB error:', err)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
```

Never let an unhandled Mongoose error bubble to a 500 without logging.

---

### 9. Use TypeScript interfaces for all schemas

```ts
export interface IUser {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  watchlist: string[]
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>({ ... }, { timestamps: true })
```

`timestamps: true` auto-adds `createdAt` / `updatedAt`.

---

### 10. Environment — validate URI at startup

```ts
if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set')
```

Fail fast rather than getting a cryptic connection error mid-request.

---

## Quick checklist

- [ ] Single cached connection via `connectToDatabase()`
- [ ] `bufferCommands: false`
- [ ] `models.X || model(...)` guard on every model
- [ ] `.lean()` on read-only list queries
- [ ] `.select()` to limit returned fields
- [ ] Indexes declared in schema (not added ad-hoc)
- [ ] `findOneAndUpdate` with `{ upsert: true, new: true }` for idempotent writes
- [ ] try/catch around every DB call in API routes
- [ ] TypeScript interface for every schema
- [ ] MONGODB_URI validated at startup
