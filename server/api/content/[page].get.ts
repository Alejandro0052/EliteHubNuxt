import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const page = getRouterParam(event, 'page')
    
    if (!page) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Page parameter is required'
      })
    }

    const content = await prisma.content.findUnique({
      where: {
        page: page
      }
    })

    if (!content) {
      // Return default content if not found
      return {
        page,
        title: '',
        subtitle: '',
        content: '',
        metadata: {}
      }
    }

    return content
  } catch (error) {
    console.error('Error fetching content:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})