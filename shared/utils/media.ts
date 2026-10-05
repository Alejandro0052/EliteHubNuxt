export const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.ogg']

export function isVideoUrl(url: string): boolean {
	const match = url.toLowerCase().match(/\.[a-z0-9]+$/)
	const ext = match ? match[0] : ''
	return VIDEO_EXTENSIONS.includes(ext)
}
