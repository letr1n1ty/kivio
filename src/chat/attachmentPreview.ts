import { invoke } from '@tauri-apps/api/core'
import type { Attachment, PendingAttachment } from './types'
import { isTauriRuntime } from './utils'

type AttachmentLike = Pick<Attachment, 'path' | 'name' | 'type'>

function isLocalAttachmentPath(path: string): boolean {
  return path.includes('/') || path.includes('\\')
}

export async function loadAttachmentDataUrl(
  attachment: AttachmentLike,
  conversationId?: string | null,
): Promise<string | null> {
  if (!isTauriRuntime() || attachment.type !== 'image') return null
  const previewConversationId = isLocalAttachmentPath(attachment.path) ? null : conversationId
  try {
    const result = await invoke<{ success: boolean; data?: string; error?: string }>(
      'chat_read_attachment',
      {
        conversationId: previewConversationId ?? null,
        path: attachment.path,
      },
    )
    if (!result.success || !result.data) {
      console.warn('Failed to load attachment preview:', result.error ?? attachment.name)
      return null
    }
    return result.data
  } catch (err) {
    console.warn('Failed to load attachment preview:', err)
    return null
  }
}

export async function openAttachment(
  attachment: AttachmentLike,
  conversationId?: string | null,
): Promise<void> {
  if (!isTauriRuntime()) return
  await invoke('chat_open_attachment', {
    conversationId: conversationId ?? null,
    path: attachment.path,
  })
}

type ArtifactLike = {
  path?: string | null
  data_url?: string
  dataUrl?: string
}

function artifactInlineDataUrl(artifact: ArtifactLike): string {
  return artifact.dataUrl ?? artifact.data_url ?? ''
}

// 圖片 artifact 現在以"磁碟整圖 + path + 內聯縮圖"儲存。需要全解析度(點開檢視器)時,
// 用 path 經 chat_read_attachment 懶載入;無 path 的老 artifact 直接回退到內聯 data_url。
export async function loadArtifactDataUrl(
  artifact: ArtifactLike,
  conversationId?: string | null,
): Promise<string | null> {
  const inline = artifactInlineDataUrl(artifact)
  const path = artifact.path ?? ''
  if (!isTauriRuntime() || !path || !conversationId) return inline || null
  try {
    const result = await invoke<{ success: boolean; data?: string; error?: string }>(
      'chat_read_attachment',
      { conversationId, path },
    )
    if (!result.success || !result.data) return inline || null
    return result.data
  } catch (err) {
    console.warn('Failed to load artifact full image:', err)
    return inline || null
  }
}

export type DisplayAttachment = Attachment | PendingAttachment
