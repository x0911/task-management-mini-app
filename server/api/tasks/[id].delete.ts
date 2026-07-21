import { taskRepository } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Task id is required.' })

  const removed = await taskRepository.remove(id)
  if (!removed) throw createError({ statusCode: 404, statusMessage: 'Task not found.' })

  setResponseStatus(event, 204)
  return null
})
