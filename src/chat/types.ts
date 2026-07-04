// Chat 前端型別定義

export type ToolCallStatus =
  | 'pending'
  | 'running'
  | 'success'
  | 'completed'
  | 'error'
  | 'skipped'
  | 'cancelled'

export interface SkillMeta {
  id: string
  name: string
  description: string
  source?: 'builtin' | 'user' | 'external' | string
  path?: string
  recommended_tools?: string[]
  recommendedTools?: string[]
  disable_model_invocation?: boolean
  disableModelInvocation?: boolean
  files?: SkillFileEntry[]
  enabled?: boolean
  triggers?: string[]
  argument_hint?: string | null
  argumentHint?: string | null
  arguments?: string[]
}

export interface SkillFileEntry {
  relative_path?: string
  relativePath?: string
  kind?: string
  size_bytes?: number
  sizeBytes?: number
}

export interface SkillDetail extends SkillMeta {
  content?: string
  body?: string
  frontmatter?: Record<string, unknown>
  updated_at?: number
  updatedAt?: number
}

export interface ToolCallRecord {
  id: string
  conversationId?: string
  runId?: string
  messageId?: string
  toolCallId?: string
  call_id?: string
  callId?: string
  tool_name?: string
  toolName?: string
  name?: string
  server_id?: string
  serverId?: string
  server_name?: string
  serverName?: string
  source?: string
  status?: ToolCallStatus
  started_at?: number
  startedAt?: number
  completed_at?: number
  completedAt?: number
  duration_ms?: number
  durationMs?: number
  arguments?: unknown
  args?: unknown
  input?: unknown
  argument_preview?: string
  argumentPreview?: string
  argumentsPreview?: string
  result?: unknown
  output?: unknown
  result_preview?: string
  resultPreview?: string
  error?: string
  round?: number
  sensitive?: boolean
  requires_confirmation?: boolean
  requiresConfirmation?: boolean
  artifacts?: ChatToolArtifact[]
  trace_id?: string | null
  traceId?: string | null
  span_id?: string | null
  spanId?: string | null
  structured_content?: unknown
  structuredContent?: unknown
}

export type AskUserPhase = 'awaiting' | 'answered' | 'skipped' | 'timeout' | 'cancelled'

export interface AskUserOption {
  id: string
  label: string
  description?: string | null
}

export interface AskUserQuestion {
  id: string
  prompt: string
  options: AskUserOption[]
  allow_multiple?: boolean
  allowMultiple?: boolean
  allow_custom?: boolean
  allowCustom?: boolean
}

export interface AskUserPromptPayload {
  title?: string | null
  questions: AskUserQuestion[]
}

export interface AskUserAnswer {
  selected_option_ids?: string[]
  selectedOptionIds?: string[]
  custom_text?: string | null
  customText?: string | null
}

export interface AskUserStructuredContent {
  askUser?: {
    phase?: AskUserPhase | string
    title?: string | null
    questions?: AskUserQuestion[]
    answers?: Record<string, AskUserAnswer>
  }
}

export interface ChatToolArtifact {
  name: string
  mime_type?: string
  mimeType?: string
  data_url?: string
  dataUrl?: string
  size_bytes?: number | null
  sizeBytes?: number | null
  path?: string | null
  filePath?: string | null
  localPath?: string | null
}

export type ChatMessageSegmentKind = 'text' | 'reasoning' | 'tool'

export type ChatMessageSegmentPhase = 'auxiliary' | 'plain' | 'tool_loop' | 'synthesis'

export interface ChatMessageSegment {
  id: string
  kind: ChatMessageSegmentKind
  phase: ChatMessageSegmentPhase
  order: number
  step_number?: number | null
  stepNumber?: number | null
  round?: number | null
  text?: string | null
  tool_call_id?: string | null
  toolCallId?: string | null
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  attachments?: Attachment[]
  reasoning?: string
  artifacts?: ChatToolArtifact[]
  tool_calls?: ToolCallRecord[]
  toolCalls?: ToolCallRecord[]
  segments?: ChatMessageSegment[]
  agent_plan?: AgentPlanState | null
  agentPlan?: AgentPlanState | null
  api_messages?: unknown[]
  apiMessages?: unknown[]
  model_messages?: unknown[]
  modelMessages?: unknown[]
  active_skill_id?: string | null
  activeSkillId?: string | null
  run_entry?: 'send' | 'regenerate' | string | null
  runEntry?: 'send' | 'regenerate' | string | null
  stream_outcome?: 'completed' | 'cancelled' | 'error' | 'interrupted' | string | null
  streamOutcome?: 'completed' | 'cancelled' | 'error' | 'interrupted' | string | null
  /** Provider 報告的本條回覆真實 token 用量（規劃/合成/壓縮累計）；不報告時預設。 */
  usage?: MessageUsage | null
  /** 多模型一問多答：同一條 user 訊息 fan-out 出的 N 條 assistant 共享同一個 group id；單模型為空。 */
  group_id?: string | null
  groupId?: string | null
  /** 該 assistant 實際所用 provider id（多模型時每條各記自己的；單模型預設回退會話級）。 */
  provider_id?: string | null
  providerId?: string | null
  /** 該 assistant 實際所用 model（多模型時每條各記自己的；單模型預設回退會話級）。 */
  model?: string | null
  timestamp: number
}

export interface MessageUsage {
  input_tokens?: number | null
  inputTokens?: number | null
  output_tokens?: number | null
  outputTokens?: number | null
  total_tokens?: number | null
  totalTokens?: number | null
  cached_input_tokens?: number | null
  cachedInputTokens?: number | null
  cache_creation_input_tokens?: number | null
  cacheCreationInputTokens?: number | null
  reasoning_tokens?: number | null
  reasoningTokens?: number | null
}

export interface Attachment {
  id: string
  type: 'image' | 'file'
  name: string
  path: string
}

export interface PendingAttachment {
  id: string
  type: 'image' | 'file'
  name: string
  path: string
}

export interface ChatProject {
  id: string
  name: string
  description?: string | null
  color?: string | null
  root_path?: string | null
  rootPath?: string | null
  created_at: number
  updated_at: number
  createdAt?: number
  updatedAt?: number
}

/** Chat 集(Set)：助手之上的人設分組。不帶工作目錄，持有系統提示詞 + 預設助手。 */
export interface ChatSet {
  id: string
  name: string
  system_prompt?: string
  systemPrompt?: string
  default_assistant_id?: string | null
  defaultAssistantId?: string | null
  color?: string | null
  created_at: number
  updated_at: number
  createdAt?: number
  updatedAt?: number
}

export interface ChatAssistant {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  source?: 'builtin' | 'user' | 'imported' | string
  system_prompt?: string
  systemPrompt?: string
  provider_id?: string
  providerId?: string
  model?: string
  /** 允許使用的 MCP 伺服器 id 白名單。空 = 不可用任何 MCP。 */
  mcp_server_ids?: string[]
  mcpServerIds?: string[]
  /** 允許啟用的技能 id 白名單。空 = 不可用任何技能。 */
  skill_ids?: string[]
  skillIds?: string[]
  enabled?: boolean
  installed?: boolean
  archived?: boolean
  built_in?: boolean
  builtIn?: boolean
  created_at: number
  updated_at: number
  createdAt?: number
  updatedAt?: number
}

export interface ChatAssistantSnapshot {
  id: string
  name: string
  description?: string
  source?: 'builtin' | 'user' | 'imported' | string
  system_prompt?: string
  systemPrompt?: string
  provider_id?: string
  providerId?: string
  model?: string
  mcp_server_ids?: string[]
  mcpServerIds?: string[]
  skill_ids?: string[]
  skillIds?: string[]
}

export type ContextUsageStatus =
  | 'normal'
  | 'warning'
  | 'critical'
  | 'compressed'
  | 'stale'
  | 'unknown'
  | string

export interface ContextUsageSegment {
  id: string
  label: string
  estimated_tokens?: number
  estimatedTokens?: number
  color?: string | null
}

export interface CompactionBoundaryRecord {
  id: string
  source_until_message_id?: string
  sourceUntilMessageId?: string
  display_after_message_id?: string | null
  displayAfterMessageId?: string | null
  token_estimate_before?: number
  tokenEstimateBefore?: number
  token_estimate_after?: number
  tokenEstimateAfter?: number
  summary_content?: string
  summaryContent?: string
  trigger?: 'manual' | 'auto' | 'agent_loop' | string
  created_at?: number
  createdAt?: number
}

export interface ConversationContextSummary {
  id: string
  content: string
  source_message_ids?: string[]
  sourceMessageIds?: string[]
  source_until_message_id?: string
  sourceUntilMessageId?: string
  token_estimate_before?: number
  tokenEstimateBefore?: number
  token_estimate_after?: number
  tokenEstimateAfter?: number
  created_at?: number
  createdAt?: number
  provider_id?: string
  providerId?: string
  model?: string
  stale?: boolean
}

export interface ConversationContextState {
  estimated_input_tokens?: number
  estimatedInputTokens?: number
  context_window_tokens?: number | null
  contextWindowTokens?: number | null
  context_window_estimated?: boolean
  contextWindowEstimated?: boolean
  usage_ratio?: number | null
  usageRatio?: number | null
  status?: ContextUsageStatus
  segments?: ContextUsageSegment[]
  last_measured_at?: number
  lastMeasuredAt?: number
  last_compressed_at?: number | null
  lastCompressedAt?: number | null
  compressed_message_count?: number
  compressedMessageCount?: number
  compression_count?: number
  compressionCount?: number
  summary?: ConversationContextSummary | null
  compaction_boundaries?: CompactionBoundaryRecord[]
  compactionBoundaries?: CompactionBoundaryRecord[]
  warning?: string | null
  warningMessage?: string | null
  context_source?: 'kivio_builtin' | 'external_cli' | string
  contextSource?: 'kivio_builtin' | 'external_cli' | string
  token_count_source?: 'cli_reported' | 'estimated' | string
  tokenCountSource?: 'cli_reported' | 'estimated' | string
  session_input_tokens?: number
  sessionInputTokens?: number
  session_output_tokens?: number
  sessionOutputTokens?: number
  external_agent_id?: string
  externalAgentId?: string
  external_model?: string
  externalModel?: string
}

export type AgentTodoStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface AgentTodoItem {
  id: string
  content: string
  description?: string | null
  status: AgentTodoStatus
  blocks?: string[]
  blocked_by?: string[]
  owner?: string | null
}

export interface AgentTodoState {
  items?: AgentTodoItem[]
  updated_at?: number
  updatedAt?: number
}

export type AgentPlanMode = 'act' | 'plan' | 'orchestrate'
export type AgentPlanStatus = 'empty' | 'draft' | 'approved'

export interface AgentPlanState {
  mode?: AgentPlanMode
  status?: AgentPlanStatus
  plan?: string | null
  updated_at?: number
  updatedAt?: number
}

export interface AgentRuntimeConfig {
  kind: 'builtin' | 'external'
  externalAgentId?: string | null
  external_agent_id?: string | null
  externalModel?: string | null
  external_model?: string | null
  externalReasoning?: string | null
  external_reasoning?: string | null
  externalSandbox?: string | null
  external_sandbox?: string | null
}

export interface DetectedExternalAgent {
  id: string
  name: string
  available: boolean
  path?: string | null
  version?: string | null
  models: Array<{ id: string; label: string; contextWindowTokens?: number | null; context_window_tokens?: number | null }>
  reasoningOptions?: Array<{ id: string; label: string }>
  reasoning_options?: Array<{ id: string; label: string }>
  sandboxOptions?: Array<{ id: string; label: string }>
  sandbox_options?: Array<{ id: string; label: string }>
  authStatus?: string | null
  auth_status?: string | null
}

export interface Conversation {
  id: string
  title: string
  provider_id: string
  model: string
  messages: ChatMessage[]
  active_skill_id?: string | null
  activeSkillId?: string | null
  assistant_id?: string | null
  assistantId?: string | null
  assistant_snapshot?: ChatAssistantSnapshot | null
  assistantSnapshot?: ChatAssistantSnapshot | null
  created_at: number
  updated_at: number
  pinned?: boolean
  folder?: string
  project_id?: string | null
  projectId?: string | null
  set_id?: string | null
  setId?: string | null
  context_state?: ConversationContextState
  contextState?: ConversationContextState
  agent_todo_state?: AgentTodoState
  agentTodoState?: AgentTodoState
  agent_plan_state?: AgentPlanState
  agentPlanState?: AgentPlanState
  agent_runtime?: AgentRuntimeConfig
  agentRuntime?: AgentRuntimeConfig
  knowledge_base_ids?: string[]
  knowledgeBaseIds?: string[]
  thinking_level?: ThinkingLevel | null
  thinkingLevel?: ThinkingLevel | null
  /** 多模型一問多答（D2）：會話級持久化的多答模型集合（上限 4）。空或單元素 = 單模型現狀。 */
  reply_models?: ModelRef[]
  replyModels?: ModelRef[]
  /** 多答組「選中條」（D5）：group_id → 被採納進下一輪歷史的 assistant message id。無記錄取該組第一條。 */
  group_selections?: Record<string, string>
  groupSelections?: Record<string, string>
}

/** 一次回答所用的 (provider, model) 引用。多模型一問多答的會話級模型集元素。 */
export interface ModelRef {
  provider_id: string
  model: string
}

export type ThinkingLevel = 'off' | 'low' | 'medium' | 'high' | 'xhigh' | 'max'

export interface ConversationListItem {
  id: string
  title: string
  preview: string
  provider_id: string
  model: string
  message_count: number
  created_at: number
  updated_at: number
  pinned?: boolean
  folder?: string
  project_id?: string | null
  projectId?: string | null
  set_id?: string | null
  setId?: string | null
  assistant_id?: string | null
  assistantId?: string | null
  assistant_name?: string | null
  assistantName?: string | null
}

export interface ConversationGroup {
  title: string
  conversations: ConversationListItem[]
}
