import { PrismaClient } from '@prisma/client'
import { getServerSession } from '#auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const session = await getServerSession(event)
    
    if (!session?.user?.id) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // Check if user is admin
    const user = await prisma.usuario.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { isAdmin: true }
    })

    if (!user?.isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: Admin access required'
      })
    }

    const page = getRouterParam(event, 'page')
    const body = await readBody(event)
    
    if (!page) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Page parameter is required'
      })
    }

    const { title, subtitle, content, metadata } = body

    const updatedContent = await prisma.content.upsert({
      where: {
        page: page
      },
      update: {
        title,
        subtitle,
        content,
        metadata
      },
      create: {
        page,
        title,
        subtitle,
        content,
        metadata
      }
    })

    return updatedContent
  } catch (error) {
    console.error('Error updating content:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})