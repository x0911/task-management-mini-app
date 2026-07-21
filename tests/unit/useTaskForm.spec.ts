import { describe, it, expect } from 'vitest'
import { useTaskForm, toDateInputValue } from '../../composables/useTaskForm'

function futureDateInput(daysAhead = 3) {
  const date = new Date(Date.now() + daysAhead * 86400000)
  return date.toISOString().slice(0, 10)
}

function pastDateInput(daysAgo = 3) {
  const date = new Date(Date.now() - daysAgo * 86400000)
  return date.toISOString().slice(0, 10)
}

describe('useTaskForm', () => {
  it('starts with sensible defaults when no initial value is given', () => {
    const { form } = useTaskForm()
    expect(form.title).toBe('')
    expect(form.status).toBe('pending')
  })

  it('hydrates from an initial task value', () => {
    const { form } = useTaskForm({ title: 'Existing', status: 'done', dueDate: new Date().toISOString() })
    expect(form.title).toBe('Existing')
    expect(form.status).toBe('done')
  })

  it('fails validation when title is empty', () => {
    const { form, validate, errors } = useTaskForm()
    form.dueDate = futureDateInput()
    const valid = validate()
    expect(valid).toBe(false)
    expect(errors.title).toBe('Title is required.')
  })

  it('fails validation when title is only whitespace', () => {
    const { form, validate, errors } = useTaskForm()
    form.title = '   '
    form.dueDate = futureDateInput()
    expect(validate()).toBe(false)
    expect(errors.title).toBe('Title is required.')
  })

  it('fails validation when title exceeds 140 characters', () => {
    const { form, validate, errors } = useTaskForm()
    form.title = 'a'.repeat(141)
    form.dueDate = futureDateInput()
    expect(validate()).toBe(false)
    expect(errors.title).toContain('140 characters')
  })

  it('fails validation when due date is missing', () => {
    const { form, validate, errors } = useTaskForm()
    form.title = 'Valid title'
    form.dueDate = ''
    expect(validate()).toBe(false)
    expect(errors.dueDate).toBe('Due date is required.')
  })

  it('fails validation when due date is in the past and future dates are required', () => {
    const { form, validate, errors } = useTaskForm()
    form.title = 'Valid title'
    form.dueDate = pastDateInput()
    expect(validate()).toBe(false)
    expect(errors.dueDate).toBe('Due date must be in the future.')
  })

  it('allows a past due date when requireFutureDueDate is false', () => {
    const { form, validate, errors } = useTaskForm(undefined, { requireFutureDueDate: false })
    form.title = 'Valid title'
    form.dueDate = pastDateInput()
    expect(validate()).toBe(true)
    expect(errors.dueDate).toBeUndefined()
  })

  it('passes validation with a valid title and future due date', () => {
    const { form, validate } = useTaskForm()
    form.title = 'Valid title'
    form.dueDate = futureDateInput()
    expect(validate()).toBe(true)
  })

  it('builds a submission payload with an ISO due date and trimmed title', () => {
    const { form, validate, toPayload } = useTaskForm()
    form.title = '  Valid title  '
    form.description = '  notes  '
    form.dueDate = futureDateInput()
    validate()
    const payload = toPayload()
    expect(payload.title).toBe('Valid title')
    expect(payload.description).toBe('notes')
    expect(new Date(payload.dueDate).toString()).not.toBe('Invalid Date')
  })
})

describe('toDateInputValue', () => {
  it('converts an ISO string to a yyyy-mm-dd date input value', () => {
    expect(toDateInputValue('2026-08-05T00:00:00.000Z')).toBe('2026-08-05')
  })

  it('returns an empty string for an empty input', () => {
    expect(toDateInputValue('')).toBe('')
  })

  it('returns an empty string for an invalid date string', () => {
    expect(toDateInputValue('not-a-date')).toBe('')
  })
})
