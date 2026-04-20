import mongoose from 'mongoose'

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

const globalWithMongoose = global as typeof globalThis & {
  mongooseCache: MongooseCache
}

if (!globalWithMongoose.mongooseCache) {
  globalWithMongoose.mongooseCache = { conn: null, promise: null }
}

const cache = globalWithMongoose.mongooseCache

export async function connectToDatabase() {
  if (cache.conn) return cache.conn

  if (!cache.promise) {
    const MONGODB_URI = process.env.MONGODB_URI as string
    if (!MONGODB_URI) throw new Error('MONGODB_URI is not defined')
    cache.promise = mongoose.connect(MONGODB_URI).then(() => mongoose)
  }

  cache.conn = await cache.promise
  return cache.conn
}
