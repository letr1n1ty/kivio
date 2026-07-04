import { describe, expect, it } from 'vitest'
import { foldMessageGroups } from './messageGroups'
import type { ChatMessage } from './types'

function msg(id: string, role: 'user' | 'assistant', groupId?: string): ChatMessage {
  return {
    id,
    role,
    content: id,
    timestamp: 1,
    ...(groupId ? { group_id: groupId } : {}),
  }
}

describe('foldMessageGroups', () => {
  it('單模型（無 group_id）保持線性，不折疊（零迴歸）', () => {
    const items = foldMessageGroups([
      msg('u1', 'user'),
      msg('a1', 'assistant'),
      msg('u2', 'user'),
      msg('a2', 'assistant'),
    ])
    expect(items.map((i) => i.type)).toEqual(['message', 'message', 'message', 'message'])
  })

  it('同 group_id 的連續 assistant 折成一個組', () => {
    const items = foldMessageGroups([
      msg('u1', 'user', 'g1'),
      msg('a1', 'assistant', 'g1'),
      msg('a2', 'assistant', 'g1'),
      msg('a3', 'assistant', 'g1'),
    ])
    // user 即使帶 group_id 也不併入組（只折 assistant）。
    expect(items[0].type).toBe('message')
    expect(items[1].type).toBe('group')
    const group = items[1]
    if (group.type !== 'group') throw new Error('expected group')
    expect(group.groupId).toBe('g1')
    expect(group.messages.map((m) => m.id)).toEqual(['a1', 'a2', 'a3'])
  })

  it('不同 group_id 的 assistant 分成兩組', () => {
    const items = foldMessageGroups([
      msg('a1', 'assistant', 'g1'),
      msg('a2', 'assistant', 'g1'),
      msg('a3', 'assistant', 'g2'),
    ])
    expect(items).toHaveLength(2)
    expect(items[0].type).toBe('group')
    expect(items[1].type).toBe('group')
    if (items[0].type === 'group') expect(items[0].messages).toHaveLength(2)
    if (items[1].type === 'group') expect(items[1].messages).toHaveLength(1)
  })

  it('組之間被普通訊息打斷', () => {
    const items = foldMessageGroups([
      msg('a1', 'assistant', 'g1'),
      msg('u1', 'user'),
      msg('a2', 'assistant', 'g1'),
    ])
    // 同 group_id 但被 user 打斷 → 兩個獨立組（連續性被破壞）。
    expect(items.map((i) => i.type)).toEqual(['group', 'message', 'group'])
  })

  it('多答輪 + 單模型續聊輪混合', () => {
    const items = foldMessageGroups([
      msg('u1', 'user', 'g1'),
      msg('a1', 'assistant', 'g1'),
      msg('a2', 'assistant', 'g1'),
      msg('u2', 'user'),
      msg('a3', 'assistant'),
    ])
    expect(items.map((i) => i.type)).toEqual(['message', 'group', 'message', 'message'])
  })
})
