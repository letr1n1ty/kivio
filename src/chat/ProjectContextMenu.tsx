import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FolderOpen, Pencil, Trash2 } from 'lucide-react'
import type { ConversationMenuAnchor } from './ConversationContextMenu'

interface ProjectContextMenuProps {
  anchor: ConversationMenuAnchor
  hasRootFolder: boolean
  onRename: () => void
  onOpenFolder: () => void
  onDelete: () => void
  onClose: () => void
}

export function ProjectContextMenu({
  anchor,
  hasRootFolder,
  onRename,
  onOpenFolder,
  onDelete,
  onClose,
}: ProjectContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (menuRef.current?.contains(target)) return
      onClose()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  return createPortal(
    <div
      ref={menuRef}
      className="chat-motion-popover fixed z-[200] min-w-[180px] rounded-xl border border-neutral-200/90 bg-white py-1.5 shadow-lg dark:border-neutral-700 dark:bg-[#2a2a2c]"
      style={{ left: anchor.left, top: anchor.top }}
      role="menu"
    >
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center gap-3 px-3.5 py-2 text-left text-[13px] text-neutral-800 transition-colors hover:bg-black/[0.04] dark:text-neutral-100 dark:hover:bg-white/[0.06]"
        onClick={() => {
          onRename()
          onClose()
        }}
      >
        <Pencil size={16} strokeWidth={1.75} className="shrink-0 text-neutral-500" />
        重新命名
      </button>
      <button
        type="button"
        role="menuitem"
        disabled={!hasRootFolder}
        title={hasRootFolder ? undefined : '請先在專案設定中選擇資料夾'}
        className="flex w-full items-center gap-3 px-3.5 py-2 text-left text-[13px] text-neutral-800 transition-colors hover:bg-black/[0.04] disabled:cursor-default disabled:opacity-40 dark:text-neutral-100 dark:hover:bg-white/[0.06] dark:disabled:hover:bg-transparent"
        onClick={() => {
          if (!hasRootFolder) return
          onOpenFolder()
          onClose()
        }}
      >
        <FolderOpen size={16} strokeWidth={1.75} className="shrink-0 text-neutral-500" />
        開啟專案資料夾
      </button>
      <div className="my-1 border-t border-neutral-200/80 dark:border-neutral-700" />
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center gap-3 px-3.5 py-2 text-left text-[13px] text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
        onClick={() => {
          onDelete()
          onClose()
        }}
      >
        <Trash2 size={16} strokeWidth={1.75} className="shrink-0" />
        刪除專案
      </button>
    </div>,
    document.body,
  )
}
