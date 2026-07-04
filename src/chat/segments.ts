import type { ChatMessageSegment, ToolCallRecord } from './types'
import { normalizeToolCallStatus } from './toolStatus'

export function segmentToolCallId(segment: ChatMessageSegment): string {
  return segment.tool_call_id ?? segment.toolCallId ?? ''
}

export function toolRecordRawName(toolCall: ToolCallRecord): string {
  return toolCall.tool_name || toolCall.toolName || toolCall.name || ''
}

/** tool record 的唯一 id（相容多種欄位命名）。 */
export function toolRecordId(toolCall: ToolCallRecord): string {
  return toolCall.id || toolCall.toolCallId || toolCall.call_id || toolCall.callId || ''
}

export function segmentStepNumber(segment: ChatMessageSegment): number | null | undefined {
  return segment.step_number ?? segment.stepNumber
}

function segmentDisplayRank(segment: ChatMessageSegment): number {
  if (segment.kind === 'reasoning') return 0
  if (segment.kind === 'text') return 1
  return 2
}

export function compareTimelineSegments(
  a: ChatMessageSegment,
  b: ChatMessageSegment,
): number {
  const aStepNumber = segmentStepNumber(a)
  const bStepNumber = segmentStepNumber(b)
  const sameModelStep =
    aStepNumber != null &&
    aStepNumber === bStepNumber &&
    (a.round ?? null) === (b.round ?? null) &&
    a.phase === b.phase
  if (sameModelStep) {
    const rankDelta = segmentDisplayRank(a) - segmentDisplayRank(b)
    if (rankDelta !== 0) return rankDelta
  }
  return a.order - b.order
}

/** 渲染前的「有內容」判定：reasoning/text 段空白則不渲染，也不應單獨成組/打斷分組。
 *  tool 段始終保留（其記錄可能缺失，交由 UI 兜底）。 */
function segmentHasContent(segment: ChatMessageSegment): boolean {
  if (segment.kind === 'tool') return true
  return Boolean((segment.text ?? '').trim())
}

export type TimelineGroupItem =
  | { type: 'text'; segment: ChatMessageSegment }
  | { type: 'group'; segments: ChatMessageSegment[] }

/**
 * 以正文(text)段為分隔，把兩條正文之間連續的非 text 段（reasoning + tool）聚成一個組。
 * - 純函式：輸入有序 segments → 輸出渲染項陣列，便於單測。
 * - text 段單獨成項（原樣渲染正文），永遠打斷分組。
 * - `tool → text → tool` ⇒ 兩個組。
 * - 空白 reasoning/text 段先過濾，避免產生空組或多餘分隔。
 */
export function groupTimelineSegments(orderedSegments: ChatMessageSegment[]): TimelineGroupItem[] {
  const items: TimelineGroupItem[] = []
  let current: ChatMessageSegment[] | null = null
  for (const segment of orderedSegments) {
    if (!segmentHasContent(segment)) continue
    if (segment.kind === 'text') {
      current = null
      items.push({ type: 'text', segment })
      continue
    }
    if (!current) {
      current = []
      items.push({ type: 'group', segments: current })
    }
    current.push(segment)
  }
  return items
}

export type ToolGroupCategory =
  | 'read'
  | 'codeSearch'
  | 'globFiles'
  | 'fileWrite'
  | 'runCommand'
  | 'webFetch'
  | 'webSearch'
  | 'runPython'
  | 'listDir'
  | 'fileOps'
  | 'todo'
  | 'memory'
  | 'subAgent'
  | 'skill'
  | 'image'
  | 'notion'
  | 'mcp'
  | 'other'

/** 分組頭圖示用的代表類別：工具類別全集 + 純思考組的 `'reasoning'`。 */
export type ToolGroupIcon = ToolGroupCategory | 'reasoning'

function categorizeTool(toolCall: ToolCallRecord): ToolGroupCategory {
  const raw = toolRecordRawName(toolCall)
  switch (raw) {
    case 'read':
    case 'read_file':
      return 'read'
    case 'grep':
    case 'search_files':
      return 'codeSearch'
    case 'find':
    case 'glob':
    case 'glob_files':
      return 'globFiles'
    case 'write':
    case 'write_file':
    case 'edit':
    case 'edit_file':
      return 'fileWrite'
    case 'bash':
    case 'run_command':
      return 'runCommand'
    case 'web_fetch':
      return 'webFetch'
    case 'web_search':
      return 'webSearch'
    case 'run_python':
      return 'runPython'
    case 'ls':
    case 'list_dir':
      return 'listDir'
    case 'move':
    case 'copy':
    case 'delete':
    case 'create_dir':
    case 'stat':
    case 'stat_path':
      return 'fileOps'
    case 'todo_write':
    case 'todo_update':
      return 'todo'
    case 'memory_read':
    case 'memory_search':
    case 'memory_modify':
      return 'memory'
    case 'agent':
      return 'subAgent'
    case 'skill_activate':
    case 'skill_read_file':
    case 'skill_run_script':
      return 'skill'
    case 'mixer_vision':
    case 'mixer_generate_image':
      return 'image'
    default:
      break
  }
  const server = (toolCall.server_name || toolCall.serverName || toolCall.server_id || toolCall.serverId || '')
    .toLowerCase()
  if (server.includes('notion') || raw.toLowerCase().startsWith('notion')) {
    return 'notion'
  }
  const isMcp =
    toolCall.source === 'mcp' ||
    (Boolean(toolCall.server_name || toolCall.serverName) &&
      toolCall.source !== 'native' &&
      toolCall.source !== 'skill' &&
      toolCall.source !== 'mixer')
  if (isMcp) return 'mcp'
  return 'other'
}

/** 去重（保持首次出現順序）並剔除 `'other'` 後的「有意義類別」集合，文案與圖示共用同一判定。 */
function meaningfulCategories(categories: ToolGroupCategory[]): ToolGroupCategory[] {
  const seen = new Set<ToolGroupCategory>()
  const result: ToolGroupCategory[] = []
  for (const category of categories) {
    if (category === 'other' || seen.has(category)) continue
    seen.add(category)
    result.push(category)
  }
  return result
}

/**
 * 每個類別的「動作片段」（不帶時態字首、不帶狀態字尾）。
 * n = 該類別下的工具數；部分類別不帶數量。
 * Codex 風格：動詞 + 數量 + 賓語，由呼叫方加「已/正在」字首。
 */
function categoryFragment(category: ToolGroupCategory, count: number): string {
  switch (category) {
    case 'read':
      return `讀取 ${count} 個檔案`
    case 'fileWrite':
      return `編輯 ${count} 個檔案`
    case 'runCommand':
      return `執行 ${count} 條命令`
    case 'webFetch':
      return `讀取 ${count} 個網頁`
    case 'listDir':
      return `瀏覽 ${count} 個目錄`
    case 'fileOps':
      return `處理 ${count} 個檔案`
    case 'codeSearch':
      return '搜尋程式碼'
    case 'webSearch':
      return '搜尋網路'
    case 'globFiles':
      return '查詢檔案'
    case 'runPython':
      return '執行程式碼'
    case 'todo':
      return '更新任務清單'
    case 'memory':
      return '檢索記憶'
    case 'subAgent':
      return '排程 Subagent'
    case 'skill':
      return '執行技能'
    case 'image':
      return '處理影像'
    case 'notion':
      return '檢索 Notion'
    case 'mcp':
      return '呼叫外部工具'
    case 'other':
    default:
      return '工具呼叫'
  }
}

/** 代表類別：單一有意義類別時取該類別，混合/未知時回退 `'other'`（與文案選擇保持一致）。 */
function representativeCategory(categories: ToolGroupCategory[]): ToolGroupCategory {
  const meaningful = meaningfulCategories(categories)
  return meaningful.length === 1 ? meaningful[0] : 'other'
}

export interface ToolGroupSummary {
  text: string
  status: 'running' | 'error' | 'done'
  /** 摺疊頭圖示用的代表類別。 */
  icon: ToolGroupIcon
  /** 組內涉及的「有意義類別」列表（去重、保持首次出現順序、剔除 `'other'`）。
   *  混合類別時用於在摘要後排一行各類工具圖示；純 reasoning 組為 `[]`。 */
  categories: ToolGroupIcon[]
}

/**
 * 為一個分組生成 Codex 風格的自然語言摘要：動詞 + 數量 + 賓語。
 * - 純 reasoning 組：done → `思考`；running → `正在思考…`。
 * - 有意義類別 1 個：單個動作片段；2 個：用「和」連線；0 個或 ≥3 個：`呼叫 N 次工具`。
 * - done 時片段直接用原形（不加「已」）；running 時字首「正在」且整體以「…」結尾。
 * - 失敗（僅 done 態）：整體末尾追加 `，N 項失敗`。
 * `status` 欄位保留供 MessageBubble 做流光/失敗判定。
 */
export function summarizeToolGroup(
  segments: ChatMessageSegment[],
  toolCalls: ToolCallRecord[],
): ToolGroupSummary {
  const toolSegments = segments.filter((segment) => segment.kind === 'tool')
  // 「步數」按工具步計；純 reasoning 組（無工具）回退到總段數。
  const stepCount = toolSegments.length || segments.length
  const matchedTools: ToolCallRecord[] = []
  for (const segment of toolSegments) {
    const id = segmentToolCallId(segment)
    const record = toolCalls.find((tool) => toolRecordId(tool) === id)
    if (record) matchedTools.push(record)
  }

  const categories = matchedTools.map((tool) => categorizeTool(tool))
  const meaningful = meaningfulCategories(categories)

  // 圖示代表類別：無工具段（純 reasoning 組）→ 'reasoning'；否則取代表類別。
  const icon: ToolGroupIcon = toolSegments.length
    ? representativeCategory(categories)
    : 'reasoning'

  const running = matchedTools.some((tool) => normalizeToolCallStatus(tool.status) === 'running')
  const failed = matchedTools.filter((tool) => normalizeToolCallStatus(tool.status) === 'error').length

  const status: ToolGroupSummary['status'] = running ? 'running' : failed > 0 ? 'error' : 'done'

  // 選出本組的「動作片段」陣列（不帶時態字首）。
  const fragments = buildGroupFragments(categories, meaningful, toolSegments.length, stepCount)

  // running 時每個片段字首「正在」且整體以「…」結尾；done 時片段直接用原形（不加「已」）。
  let text: string
  if (running) {
    text = `${fragments.map((fragment) => `正在${fragment}`).join('和')}…`
  } else {
    text = fragments.join('和')
    if (failed > 0) {
      text = `${text}，${failed} 項失敗`
    }
  }

  return {
    text,
    status,
    icon,
    categories: meaningful,
  }
}

/**
 * 選出一個分組的「動作片段」陣列（不帶時態字首/狀態字尾）。
 * - 純 reasoning 組（無 tool 段）：`['思考']`。
 * - 有意義類別 m===0（全 other/未知）：`['呼叫 N 次工具']`。
 * - m===1：該類別片段（帶其自身工具數）。
 * - m===2：兩個片段（各帶自身工具數）。
 * - m>=3：`['呼叫 N 次工具']`（類別太多不逐一列，圖示排已展示種類）。
 */
function buildGroupFragments(
  categories: ToolGroupCategory[],
  meaningful: ToolGroupCategory[],
  toolSegmentCount: number,
  stepCount: number,
): string[] {
  if (toolSegmentCount === 0) return ['思考']
  if (meaningful.length === 0 || meaningful.length >= 3) {
    return [`呼叫 ${stepCount} 次工具`]
  }
  // 按類別統計工具數。
  const counts = new Map<ToolGroupCategory, number>()
  for (const category of categories) {
    counts.set(category, (counts.get(category) ?? 0) + 1)
  }
  return meaningful.map((category) => categoryFragment(category, counts.get(category) ?? 0))
}
