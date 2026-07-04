import { useState } from 'react'
import { Check, Copy, Gauge, Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { copyToClipboard } from '../utils/clipboard'
import { estimateTokens } from '../utils/tokens'
import { formatAssistantMessageTime } from './messageFormat'
import type { MessageUsage } from './types'

interface AssistantMessageMetaProps {
  content: string
  reasoning?: string
  timestamp: number
  tokensPerSec?: number
  runEntry?: string | null
  streamOutcome?: string | null
  usage?: MessageUsage | null
  onEdit?: () => void
  onRegenerate?: () => void
  onDelete?: () => void
}

/** Provider 報告的真實 token 數（輸入+輸出聚合的 total，或輸出 token）；沒有則 null。 */
function realUsageTokens(usage?: MessageUsage | null): { total: number; label: string } | null {
  if (!usage) return null
  const output = usage.output_tokens ?? usage.outputTokens
  const input = usage.input_tokens ?? usage.inputTokens
  const total = usage.total_tokens ?? usage.totalTokens
  if (output != null && input != null) {
    return { total: input + output, label: `${input} in + ${output} out tokens` }
  }
  if (total != null) return { total, label: `${total} tokens` }
  if (output != null) return { total: output, label: `${output} out tokens` }
  return null
}

export function AssistantMessageMeta({
  content,
  reasoning,
  timestamp,
  tokensPerSec,
  runEntry,
  streamOutcome,
  usage,
  onEdit,
  onRegenerate,
  onDelete,
}: AssistantMessageMetaProps) {
  const [copied, setCopied] = useState(false)
  // 優先顯示 provider 報告的真實用量；provider 不報時回落到 chars 估算（帶 ~ 字首）。
  const realUsage = realUsageTokens(usage)
  const tokenLabel = realUsage
    ? realUsage.label
    : `~${estimateTokens(`${content}${reasoning ? `\n${reasoning}` : ''}`)} tokens`
  const speed =
    tokensPerSec != null && Number.isFinite(tokensPerSec)
      ? Math.max(1, Math.round(tokensPerSec))
      : null

  const handleCopy = async () => {
    const ok = await copyToClipboard(content)
    if (!ok) return
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const iconBtn =
    'rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-neutral-800 dark:hover:text-neutral-300'

  const runEntryLabel = runEntry === 'regenerate' ? '已重新生成' : null
  const streamOutcomeLabel =
    streamOutcome === 'cancelled'
      ? '已停止後繼續'
      : streamOutcome === 'error'
        ? '生成異常結束'
        : streamOutcome === 'interrupted'
          ? '執行中斷，未完成'
          : null

  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400 dark:text-neutral-500">
      <span className="shrink-0">{formatAssistantMessageTime(timestamp)}</span>
      {runEntryLabel && <span className="shrink-0">{runEntryLabel}</span>}
      {streamOutcomeLabel && <span className="shrink-0">{streamOutcomeLabel}</span>}

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => void handleCopy()}
          className={iconBtn}
          title={copied ? '已複製' : '複製'}
          aria-label={copied ? '已複製' : '複製'}
        >
          {copied ? <Check size={14} strokeWidth={2} className="chat-motion-pop" /> : <Copy size={14} strokeWidth={2} />}
        </button>
        <button
          type="button"
          onClick={onEdit}
          disabled={!onEdit}
          className={iconBtn}
          title="編輯"
          aria-label="編輯"
        >
          <Pencil size={14} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={!onRegenerate}
          className={iconBtn}
          title="重新生成"
          aria-label="重新生成"
        >
          <RotateCcw size={14} strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={!onDelete}
          className={iconBtn}
          title="刪除"
          aria-label="刪除"
        >
          <Trash2 size={14} strokeWidth={2} />
        </button>
      </div>

      {speed != null && (
        <span className="inline-flex items-center gap-1">
          <Gauge size={13} strokeWidth={2} />
          <span>{speed} tokens/sec</span>
        </span>
      )}

      <span className="text-neutral-400 dark:text-neutral-500">({tokenLabel})</span>
    </div>
  )
}
