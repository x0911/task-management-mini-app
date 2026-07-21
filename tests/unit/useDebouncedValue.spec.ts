import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick, effectScope } from 'vue'
import { useDebouncedValue } from '../../composables/useDebouncedValue'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

function withScope<T>(fn: () => T): T {
  const scope = effectScope()
  return scope.run(fn)!
}

describe('useDebouncedValue', () => {
  it('initializes with the source value', () => {
    const source = ref('hello')
    const debounced = withScope(() => useDebouncedValue(source, 300))
    expect(debounced.value).toBe('hello')
  })

  it('does not update immediately when the source changes', async () => {
    const source = ref('a')
    const debounced = withScope(() => useDebouncedValue(source, 300))
    source.value = 'ab'
    await nextTick()
    expect(debounced.value).toBe('a')
  })

  it('updates after the delay elapses', async () => {
    const source = ref('a')
    const debounced = withScope(() => useDebouncedValue(source, 300))
    source.value = 'abc'
    await nextTick()
    vi.advanceTimersByTime(300)
    expect(debounced.value).toBe('abc')
  })

  it('resets the timer on rapid consecutive changes', async () => {
    const source = ref('a')
    const debounced = withScope(() => useDebouncedValue(source, 300))

    source.value = 'ab'
    await nextTick()
    vi.advanceTimersByTime(200)

    source.value = 'abc'
    await nextTick()
    vi.advanceTimersByTime(200)
    expect(debounced.value).toBe('a')

    vi.advanceTimersByTime(100)
    expect(debounced.value).toBe('abc')
  })
})
