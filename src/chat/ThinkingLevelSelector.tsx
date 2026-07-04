import { memo, useEffect, useMemo, useState } from 'react'
import { Brain, Check, ChevronDown } from 'lucide-react'
import { api } from '../api/tauri'
import { isProviderEnabled } from '../settings/utils'
import { chatTitlebarPillButtonClass } from './platform'
import type { ThinkingLevel } from './types'

interface ThinkingLevelSelectorProps {
  /** 當前等級；null = 未顯式設定，按預設檔 DEFAULT_LEVEL 處理。 */
  value: ThinkingLevel | null
  currentProviderId: string
  currentModel: string
  onChange: (level: ThinkingLevel) => void
}

// 固定項 + 各等級標籤（英文，跨語言更通用）。具體顯示哪些等級由後端按模型庫決定。
const LABELS: Record<string, string> = {
  off: 'Off',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  xhigh: 'XHigh',
  max: 'Max',
}
// 未顯式選等級時的預設檔（與後端 resolve_thinking 保持一致）。
const DEFAULT_LEVEL: ThinkingLevel = 'high'
// 未取到模型能力時的安全兜底（全模型通用子集）。
const FALLBACK_LEVELS = ['low', 'medium', 'high']

function labelFor(value: ThinkingLevel): string {
  return LABELS[value] ?? value
}

function ThinkingLevelSelectorBase({
  value,
  currentProviderId,
  currentModel,
  onChange,
}: ThinkingLevelSelectorProps) {
  const [open, setOpen] = useState(false)
  const [levels, setLevels] = useState<string[]>(FALLBACK_LEVELS)

  // 思考等級清單來自後端模型庫（reasoningEfforts），按 (model, apiFormat) 解析。
  useEffect(() => {
    let alive = true
    void (async () => {
      if (!currentModel) {
        if (alive) setLevels(FALLBACK_LEVELS)
        return
      }
      try {
        const settings = await api.getSettings()
        const apiFormat = (settings.providers || [])
          .filter(isProviderEnabled)
          .find((p) => p.id === currentProviderId)?.apiFormat
        const got = await api.reasoningEffortsForModel(currentModel, apiFormat)
        if (alive) setLevels(got.length > 0 ? got : FALLBACK_LEVELS)
      } catch {
        if (alive) setLevels(FALLBACK_LEVELS)
      }
    })()
    return () => {
      alive = false
    }
  }, [currentProviderId, currentModel])

  // null（未顯式設定）按預設檔處理，UI 永遠高亮一個具體等級。
  const effective: ThinkingLevel = value ?? DEFAULT_LEVEL

  const options = useMemo<Array<{ value: ThinkingLevel; label: string }>>(
    () => [
      { value: 'off', label: LABELS.off },
      ...levels.map((l) => ({ value: l as ThinkingLevel, label: LABELS[l] ?? l })),
    ],
    [levels],
  )

  return (
    <div className="relative max-w-full min-w-0" data-tauri-drag-region="false">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`${chatTitlebarPillButtonClass} max-w-full min-w-0`}
        title={`思考等級：${labelFor(effective)}`}
        aria-label={`思考等級：${labelFor(effective)}`}
      >
        <Brain size={15} className="shrink-0 text-neutral-500 dark:text-neutral-400" />
        <span className="max-w-[64px] truncate font-medium text-neutral-800 dark:text-neutral-200">
          {labelFor(effective)}
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden />
          <div className="chat-model-selector-menu chat-motion-popover absolute left-0 top-full z-20 mt-2 min-w-[160px] overflow-y-auto rounded-2xl border border-neutral-200/90 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
            {options.map((opt) => {
              const active = opt.value === effective
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] transition-colors ${
                    active
                      ? 'bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                      : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/80'
                  }`}
                >
                  <span className="min-w-0 truncate">{opt.label}</span>
                  {active && <Check size={15} className="shrink-0 text-neutral-500" />}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// memo：頂欄選擇器，僅在 props 變化時重渲。
export const ThinkingLevelSelector = memo(ThinkingLevelSelectorBase)
