'use client'

import { useQuery } from 'convex/react'
import { useEffect, useRef, useState } from 'react'
import type { FunctionReference } from 'convex/server'

const PREFIX = 'oo-cache:'

function readCache<T>(key: string): T | undefined {
  try {
    const raw = sessionStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : undefined
  } catch {
    return undefined
  }
}

function writeCache<T>(key: string, value: T) {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // storage full or unavailable — cache is a nice-to-have, fail silently
  }
}

/**
 * Wraps useQuery with a sessionStorage instant-paint cache: on repeat visits
 * within the same tab session, the last-known result renders immediately
 * (no loading flash) while Convex's live query fetches fresh data behind it
 * and reconciles once it resolves.
 */
export function useCachedQuery<Query extends FunctionReference<'query'>>(
  query: Query,
  args: Query['_args'] | 'skip',
  cacheKey: string
): Query['_returnType'] | undefined {
  const live = useQuery(query, args as Parameters<typeof useQuery<Query>>[1])
  const key = args === 'skip' ? null : cacheKey
  // Starts undefined on both server and client so the first hydration pass
  // always matches, then hydrates from sessionStorage post-mount (browser-only).
  const [cached, setCached] = useState<Query['_returnType'] | undefined>(undefined)
  const lastKey = useRef<string | null>(null)

  useEffect(() => {
    if (lastKey.current !== key) {
      lastKey.current = key
      setCached(key ? readCache(key) : undefined)
    }
  }, [key])

  useEffect(() => {
    if (key && live !== undefined) writeCache(key, live)
  }, [key, live])

  if (args === 'skip') return live
  return live !== undefined ? live : cached
}
