// 會話級知識庫掛載選擇器：底部欄圖示 + 勾選彈層。選中的庫 id 寫回會話，
// knowledge_search 預設檢索這些庫（一個都不選時檢索全部庫）。
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { Library, Check } from 'lucide-react'
import { kbListLibraries, onKbIndex, type KnowledgeLibrary } from './knowledgeBase'

export function KnowledgeBaseChip({
  value,
  onChange,
  disabled,
  layout = 'footer',
  anchorRef,
}: {
  value: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
  layout?: 'footer' | 'inline'
  // 彈層 portal 掛載到輸入框容器，與專案彈窗共用同一錨點/方向/樣式。
  anchorRef?: RefObject<HTMLDivElement | null>
}) {
  const [open, setOpen] = useState(false)
  const [libraries, setLibraries] = useState<KnowledgeLibrary[]>([])
  const [hasAny, setHasAny] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const loadLibs = useCallback(async () => {
    try {
      const libs = await kbListLibraries()
      setLibraries(libs)
      setHasAny(libs.length > 0)
      // 清理已刪除庫留下的陳舊掛載 id（否則計數偏大且無法在彈層取消勾選）。
      const valid = value.filter((id) => libs.some((l) => l.id === id))
      if (valid.length !== value.length) onChange(valid)
    } catch {
      /* ignore */
    }
  }, [value, onChange])

  // 用 ref 讓 onKbIndex 訂閱保持穩定（只訂閱一次），同時總能調到最新 loadLibs。
  const loadLibsRef = useRef(loadLibs)
  loadLibsRef.current = loadLibs

  // 初次評估 + 庫變化(索引事件)時重評：保證建立/匯入首個庫後 chip 自動出現，無需重開聊天窗。
  useEffect(() => {
    void loadLibsRef.current()
    let cancelled = false
    let unlisten: (() => void) | undefined
    void onKbIndex(() => {
      void loadLibsRef.current()
    }).then((fn) => {
      if (cancelled) fn()
      else unlisten = fn
    })
    return () => {
      cancelled = true
      unlisten?.()
    }
  }, [])

  useEffect(() => {
    if (open) void loadLibsRef.current()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      // 彈層經 portal 渲染到容器外，需同時排除按鈕與彈層本身，否則點彈層會被判為外部點選而關閉。
      if (ref.current?.contains(t) || popoverRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const hasMounted = value.length > 0
  if (!hasAny && !hasMounted) return null

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id])
  }

  // 歡迎頁(inline)向下展開、對話頁(footer)向上展開——與專案彈窗規則一致。
  const placement = layout === 'inline' ? 'top-full mt-1.5' : 'bottom-full mb-1.5'
  const origin = layout === 'inline' ? 'top left' : 'bottom left'

  const panel =
    open && anchorRef?.current
      ? createPortal(
          <div
            ref={popoverRef}
            className={`chat-motion-popover chat-popover-scroll absolute inset-x-0 z-40 max-h-[40vh] overflow-y-auto rounded-xl border border-[var(--theme-surface-border)] bg-[var(--theme-surface)] p-1 shadow-[0_10px_24px_rgba(0,0,0,0.12)] dark:border-neutral-700 dark:bg-neutral-900 ${placement}`}
            style={{ ['--chat-popover-origin' as string]: origin }}
            data-tauri-drag-region="false"
            role="menu"
          >
            {libraries.length === 0 ? (
              <p className="px-2 py-2 text-[11px] text-neutral-500">在設定 · 知識庫裡先建立知識庫。</p>
            ) : (
              <>
                <p className="px-2 py-1 text-[10.5px] text-neutral-400">
                  {hasMounted ? '勾選的庫參與檢索' : '未勾選則不檢索任何庫'}
                </p>
                {libraries.map((lib) => {
                  const checked = value.includes(lib.id)
                  return (
                    <button
                      key={lib.id}
                      type="button"
                      onClick={() => toggle(lib.id)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    >
                      <span
                        className={`grid size-4 shrink-0 place-items-center rounded border ${
                          checked
                            ? 'border-indigo-500 bg-indigo-500 text-white'
                            : 'border-neutral-300 dark:border-neutral-600'
                        }`}
                      >
                        {checked && <Check size={11} strokeWidth={3} />}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{lib.name}</span>
                      <span className="shrink-0 text-[10.5px] text-neutral-400">{lib.docCount}</span>
                    </button>
                  )
                })}
              </>
            )}
          </div>,
          anchorRef.current,
        )
      : null

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`relative grid size-7 shrink-0 place-items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300/60 disabled:cursor-default disabled:opacity-50 dark:focus-visible:ring-neutral-600 ${
          open
            ? 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-100'
            : hasMounted
              ? 'text-indigo-500 hover:bg-neutral-100 dark:text-indigo-300 dark:hover:bg-neutral-800'
              : 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
        }`}
        aria-expanded={open}
        aria-haspopup="menu"
        title={hasMounted ? `知識庫 · 已掛載 ${value.length} 個` : '選擇本會話使用的知識庫'}
      >
        <Library size={18} strokeWidth={1.75} />
        {hasMounted && (
          <span className="absolute -right-0.5 -top-0.5 grid min-w-[14px] place-items-center rounded-full bg-indigo-500 px-1 text-[9px] font-bold leading-[14px] text-white">
            {value.length}
          </span>
        )}
      </button>
      {panel}
    </div>
  )
}
