import { taskRepository } from '~/server/utils/db'

export default defineEventHandler(async () => {
  const tasks = await taskRepository.findAll()
  return tasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
})
