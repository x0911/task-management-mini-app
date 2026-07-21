import { v4 as uuid } from 'uuid'
import { taskRepository } from '~/server/utils/db'
import { validateTaskPayload } from '~/server/utils/validateTask'
import type { Task } from '~/types/task'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const result = validateTaskPayload(body)

  if (!result.valid) {
    throw createError({ statusCode: 422, statusMessage: 'Validation failed', data: { errors: result.errors } })
  }

  const now = new Date().toISOString()
  const task: Task = {
    id: uuid(),
    title: result.data!.title,
    description: result.data!.description,
    status: result.data!.status,
    dueDate: result.data!.dueDate,
    createdAt: now,
    updatedAt: now
  }

  await taskRepository.create(task)
  setResponseStatus(event, 201)
  return task
})
