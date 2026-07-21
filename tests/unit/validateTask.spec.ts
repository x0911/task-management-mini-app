import { describe, it, expect } from 'vitest'
import { validateTaskPayload } from '../../server/utils/validateTask'

const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()
const past = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()

describe('validateTaskPayload (create mode)', () => {
  it('accepts a fully valid payload', () => {
    const result = validateTaskPayload({
      title: 'Ship release',
      description: 'Notes',
      status: 'pending',
      dueDate: future
    })
    expect(result.valid).toBe(true)
    expect(result.data?.title).toBe('Ship release')
  })

  it('rejects a missing title', () => {
    const result = validateTaskPayload({ title: '', status: 'pending', dueDate: future })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Title is required.')
  })

  it('rejects a whitespace-only title', () => {
    const result = validateTaskPayload({ title: '   ', status: 'pending', dueDate: future })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Title is required.')
  })

  it('rejects a title over 140 characters', () => {
    const result = validateTaskPayload({ title: 'a'.repeat(141), status: 'pending', dueDate: future })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Title must be 140 characters or fewer.')
  })

  it('rejects a description over 2000 characters', () => {
    const result = validateTaskPayload({
      title: 'Valid',
      description: 'a'.repeat(2001),
      status: 'pending',
      dueDate: future
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Description must be 2000 characters or fewer.')
  })

  it('rejects an invalid status', () => {
    const result = validateTaskPayload({ title: 'Valid', status: 'archived', dueDate: future })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Status must be one of pending, in-progress, done.')
  })

  it('rejects a missing due date', () => {
    const result = validateTaskPayload({ title: 'Valid', status: 'pending', dueDate: '' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Due date is required and must be a valid date.')
  })

  it('rejects an unparsable due date', () => {
    const result = validateTaskPayload({ title: 'Valid', status: 'pending', dueDate: 'not-a-date' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Due date is required and must be a valid date.')
  })

  it('rejects a due date in the past', () => {
    const result = validateTaskPayload({ title: 'Valid', status: 'pending', dueDate: past })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Due date must be in the future.')
  })

  it('collects multiple errors at once', () => {
    const result = validateTaskPayload({ title: '', status: 'bogus', dueDate: past })
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBe(3)
  })

  it('defaults status to pending when data is otherwise valid but status omitted is not allowed', () => {
    const result = validateTaskPayload({ title: 'Valid', dueDate: future })
    expect(result.valid).toBe(false)
  })
})

describe('validateTaskPayload (partial/update mode)', () => {
  it('allows a partial payload with only status changing', () => {
    const result = validateTaskPayload({ status: 'done' }, { partial: true })
    expect(result.valid).toBe(true)
    expect(result.data?.status).toBe('done')
  })

  it('allows a past due date on update (editing an existing overdue task)', () => {
    const result = validateTaskPayload({ dueDate: past }, { partial: true })
    expect(result.valid).toBe(true)
  })

  it('still rejects an empty title if title is explicitly provided', () => {
    const result = validateTaskPayload({ title: '' }, { partial: true })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Title is required.')
  })

  it('still rejects an invalid status if explicitly provided', () => {
    const result = validateTaskPayload({ status: 'nope' }, { partial: true })
    expect(result.valid).toBe(false)
  })

  it('rejects an unparsable due date if explicitly provided', () => {
    const result = validateTaskPayload({ dueDate: 'nonsense' }, { partial: true })
    expect(result.valid).toBe(false)
  })

  it('accepts an empty object as a no-op patch', () => {
    const result = validateTaskPayload({}, { partial: true })
    expect(result.valid).toBe(true)
  })
})
