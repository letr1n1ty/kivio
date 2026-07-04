import type { ChatMessage } from './types'

// 多模型一問多答（任務 06-30）：把訊息線性陣列摺疊成「單條訊息 / 多答組」兩類項。
// 同一 group_id 的連續 assistant 訊息聚成一組（橫向並排多列渲染）；其餘保持線性。
// 純函式，便於單測（grouping 邊界 / 單模型零迴歸）。

export type MessageListItem =
  | { type: 'message'; message: ChatMessage }
  | { type: 'group'; groupId: string; messages: ChatMessage[] }

function messageGroupId(message: ChatMessage): string | null {
  return message.group_id ?? message.groupId ?? null
}

export function foldMessageGroups(messages: ChatMessage[]): MessageListItem[] {
  const items: MessageListItem[] = []
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i]
    const groupId = messageGroupId(message)
    if (message.role === 'assistant' && groupId) {
      const groupMessages: ChatMessage[] = [message]
      let j = i + 1
      while (j < messages.length) {
        const next = messages[j]
        if (next.role === 'assistant' && messageGroupId(next) === groupId) {
          groupMessages.push(next)
          j++
        } else {
          break
        }
      }
      items.push({ type: 'group', groupId, messages: groupMessages })
      i = j - 1
      continue
    }
    items.push({ type: 'message', message })
  }
  return items
}
