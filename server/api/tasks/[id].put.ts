import { taskRepository } from '~/server/utils/db'
import { validateTaskPayload } from '~/server/utils/validateTask'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Task id is required.' })

  const body = await readBody(event)
  const result = validateTaskPayload(body, { partial: true })

  if (!result.valid) {
    throw createError({ statusCode: 422, statusMessage: 'Validation failed', data: { errors: result.errors } })
  }

  const updated = await taskRepository.update(id, result.data)
  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Task not found.' })

  return updated
})
