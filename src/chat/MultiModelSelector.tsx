import { memo, useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { Layers, X } from 'lucide-react'
import { api, type ModelProvider } from '../api/tauri'
import { isProviderEnabled } from '../settings/utils'
import { ModelIcon } from './ModelIcon'
import type { ModelRef } from './types'

const MAX_REPLY_MODELS = 4

interface MultiModelSelectorProps {
  // 當前會話級多答模型集（含單模型時的會話主模型 0/1 個）。
  value: ModelRef[]
  onChange: (models: ModelRef[]) => void
  // 彈層方向：與輸入框其他按鈕（知識庫/專案/MCP/專家）一致——footer 朝上、inline 朝下。
  placement?: 'up' | 'down'
  // 彈層 portal 掛載到輸入框容器，與專案/知識庫彈窗共用同一錨點/整寬/方向/樣式。
  anchorRef?: RefObject<HTMLDivElement | null>
}

function sameRef(a: ModelRef, b: ModelRef): boolean {
  return a.provider_id === b.provider_id && a.model === b.model
}

function MultiModelSelectorBase({ value, onChange, placement = 'up', anchorRef }: MultiModelSelectorProps) {
  const [open, setOpen] = useState(false)
  const [providers, setProviders] = useState<ModelProvider[]>([])
  const triggerRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const loadProviders = useCallback(async () => {
    try {
      const settings = await api.getSettings()
      setProviders(settings.providers || [])
    } catch (err) {
      console.error('Failed to load providers:', err)
      setProviders([])
    }
  }, [])

  useEffect(() => {
    if (open) void loadProviders()
  }, [open, loadProviders])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      // 彈層經 portal 渲染到容器外，需同時排除觸發區與彈層本身，否則點彈層會被判為外部點選而關閉。
      if (triggerRef.current?.contains(t) || popoverRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const activeProviders = useMemo(() => providers.filter(isProviderEnabled), [providers])
  // 只顯示有可選模型的供應商，避免沒配置模型的供應商變成空的分組標題。
  const visibleProviders = useMemo(
    () =>
      activeProviders
        .map((provider) => ({
          provider,
          models: provider.enabledModels.length > 0 ? provider.enabledModels : provider.availableModels,
        }))
        .filter((entry) => entry.models.length > 0),
    [activeProviders],
  )
  const atLimit = value.length >= MAX_REPLY_MODELS

  const providerName = useCallback(
    (providerId: string) =>
      activeProviders.find((p) => p.id === providerId)?.name
      ?? providers.find((p) => p.id === providerId)?.name
      ?? providerId,
    [activeProviders, providers],
  )

  const toggle = useCallback(
    (providerId: string, model: string) => {
      const ref: ModelRef = { provider_id: providerId, model }
      const exists = value.some((item) => sameRef(item, ref))
      if (exists) {
        onChange(value.filter((item) => !sameRef(item, ref)))
        return
      }
      if (value.length >= MAX_REPLY_MODELS) return
      onChange([...value, ref])
    },
    [onChange, value],
  )

  const removeChip = useCallback(
    (ref: ModelRef) => onChange(value.filter((item) => !sameRef(item, ref))),
    [onChange, value],
  )

  const enabled = value.length >= 2

  // 與輸入框其他彈層一致：朝上(footer)用 bottom-full，朝下(inline)用 top-full。
  const placementClass = placement === 'down' ? 'top-full mt-1.5' : 'bottom-full mb-1.5'
  const popoverOrigin = placement === 'down' ? 'top left' : 'bottom left'

  // 面板內容：與專案/知識庫彈窗共用——portal 到輸入框容器、inset-x-0 整寬、按 placement 上下翻轉。
  const panel =
    open && anchorRef?.current
      ? createPortal(
          <div
            ref={popoverRef}
            className={`chat-motion-popover chat-popover-scroll absolute inset-x-0 z-40 max-h-[min(420px,60vh)] overflow-y-auto rounded-xl border border-[var(--theme-surface-border)] bg-[var(--theme-surface)] p-1 shadow-[0_10px_24px_rgba(0,0,0,0.12)] dark:border-neutral-700 dark:bg-neutral-900 ${placementClass}`}
            style={{ ['--chat-popover-origin' as string]: popoverOrigin }}
            data-tauri-drag-region="false"
            role="menu"
          >
            <div className="px-2.5 py-1 text-[11px] font-medium text-neutral-400">
              選擇並行回答的模型（{value.length}/{MAX_REPLY_MODELS}）。選 0 或 1 個 = 單模型。
            </div>
            {visibleProviders.map(({ provider, models }) => (
              <div key={provider.id} className="px-1 py-0.5">
                <div className="px-2.5 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                  {provider.name}
                </div>
                {models.map((model) => {
                  const checked = value.some((item) => sameRef(item, { provider_id: provider.id, model }))
                  const disabled = !checked && atLimit
                  return (
                    <button
                      key={model}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggle(provider.id, model)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1 text-left text-[13px] transition-colors ${
                        checked
                          ? 'bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                          : disabled
                            ? 'cursor-default text-neutral-300 dark:text-neutral-600'
                            : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/80'
                      }`}
                    >
                      <span
                        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                          checked
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-neutral-300 dark:border-neutral-600'
                        }`}
                      >
                        {checked && <span className="text-[10px] leading-none">✓</span>}
                      </span>
                      <ModelIcon model={model} size={16} />
                      <span className="min-w-0 truncate">{model}</span>
                    </button>
                  )
                })}
              </div>
            ))}
            {visibleProviders.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-neutral-500">暫無可用模型</div>
            )}
          </div>,
          anchorRef.current,
        )
      : null

  return (
    <div ref={triggerRef} className="relative flex min-w-0 items-center gap-1" data-tauri-drag-region="false">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`grid size-7 shrink-0 place-items-center rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
          enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-500 dark:text-neutral-400'
        }`}
        aria-expanded={open}
        aria-haspopup="menu"
        title="多模型一問多答 · 選擇並行回答的模型（上限 4）"
      >
        <Layers size={18} strokeWidth={1.75} className="shrink-0" />
      </button>

      {value.length > 0 && (
        <div className="custom-scrollbar flex min-w-0 items-center gap-1 overflow-x-auto">
          {value.map((ref) => (
            <span
              key={`${ref.provider_id}:${ref.model}`}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-neutral-100 px-1.5 py-0.5 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              title={`${ref.model} | ${providerName(ref.provider_id)}`}
            >
              <ModelIcon model={ref.model} size={14} />
              <button
                type="button"
                onClick={() => removeChip(ref)}
                aria-label={`移除 ${ref.model}`}
                className="shrink-0 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-100"
              >
                <X size={11} strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
      )}

      {panel}
    </div>
  )
}

export const MultiModelSelector = memo(MultiModelSelectorBase)
