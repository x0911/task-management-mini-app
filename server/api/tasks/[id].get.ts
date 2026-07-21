import { taskRepository } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Task id is required.' })

  const task = await taskRepository.findById(id)
  if (!task) throw createError({ statusCode: 404, statusMessage: 'Task not found.' })

  return task
})
