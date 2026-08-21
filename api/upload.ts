import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { hasValidAdminSession } from '../src/lib/adminAuth.js'

/**
 * Client-upload broker for Vercel Blob.
 *
 * Two kinds of POSTs land here (see HandleUploadBody):
 *  - "generate client token" from the admin browser -> gated by the admin
 *    session (cookie + CSRF header), because without it anyone could mint
 *    upload tokens into our store;
 *  - "upload completed" webhook from Vercel Blob servers -> NOT session-gated
 *    (they carry no admin cookie); the SDK validates its own payload signature.
 *
 * The file bytes themselves never pass through this function: the browser
 * PUTs them directly to Blob storage with a short-lived token, which sidesteps
 * the 4.5 MB serverless body limit.
 */

const IMAGE_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp']
/** Client-side compression targets < 1 MB; this is a hard abuse ceiling. */
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024

class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
  }
}

function firstHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body as HandleUploadBody,
      request: req,
      onBeforeGenerateToken: async () => {
        const cookie = firstHeader(req.headers.cookie)
        const csrfToken = firstHeader(req.headers['x-csrf-token'])
        if (!hasValidAdminSession(cookie, csrfToken)) {
          throw new UnauthorizedError()
        }
        return {
          allowedContentTypes: IMAGE_CONTENT_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: true,
        }
      },
      onUploadCompleted: async ({ blob }) => {
        // URL persistence happens when the admin saves content; this is audit log only.
        console.log(`[upload] completed: ${blob.pathname} (${blob.contentType})`)
      },
    })

    return res.status(200).json(jsonResponse)
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    console.error('[upload] failed:', err instanceof Error ? err.message : err)
    return res.status(400).json({ error: err instanceof Error ? err.message : 'Upload failed' })
  }
}
