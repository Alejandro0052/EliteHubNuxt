export const useContent = () => {
  const { data: session } = useAuth()
  
  const isAdmin = computed(() => {
    return session.value?.user?.isAdmin || false
  })

  const getContent = async (page: string) => {
    try {
      const { data } = await $fetch(`/api/content/${page}`)
      return data
    } catch (error) {
      console.error('Error fetching content:', error)
      return {
        page,
        title: '',
        subtitle: '',
        content: '',
        metadata: {}
      }
    }
  }

  const updateContent = async (page: string, contentData: any) => {
    try {
      const data = await $fetch(`/api/content/${page}`, {
        method: 'PUT',
        body: contentData
      })
      return data
    } catch (error) {
      console.error('Error updating content:', error)
      throw error
    }
  }

  return {
    isAdmin,
    getContent,
    updateContent
  }
}