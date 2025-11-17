/**
 * Helper untuk Next.js 15 - Unwrap params Promise
 * 
 * Next.js 15 mengubah params menjadi Promise.
 * Gunakan helper ini untuk menunggu params sebelum digunakan.
 * 
 * @example
 * // Sebelum (Next.js 14):
 * export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
 *   const data = await prisma.item.findUnique({ where: { id: params.id } })
 * }
 * 
 * // Sesudah (Next.js 15):
 * export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
 *   const { id } = await context.params
 *   const data = await prisma.item.findUnique({ where: { id } })
 * }
 */

// Type helper for Next.js 15 route params
export type RouteContext<T> = {
  params: Promise<T>
}

// Helper function to unwrap params
export async function getParams<T>(context: RouteContext<T>): Promise<T> {
  return await context.params
}
