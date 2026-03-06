const API_SERVER_URL = 'http://localhost:5000'

export const getImgUrl = (thumbnail) => {
    if (!thumbnail) return ''

    // If already a full link, use it directly.
    if (/^https?:\/\//i.test(thumbnail)) return thumbnail

    // If returned from Node upload API (e.g. /uploads/xxx.png), prefix backend URL.
    if (thumbnail.startsWith('/uploads/')) return `${API_SERVER_URL}${thumbnail}`

    // Fallback for local bundled assets (mock data).
    return new URL(`../assets/books/${thumbnail}`, import.meta.url).toString()
}
