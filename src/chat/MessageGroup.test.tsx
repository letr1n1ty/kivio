import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MessageGroup } from './MessageGroup'
import { beginGroup, ensureGroupColumn, flushGroups, resetGroups } from './groupStreamingStore'
import {
  _resetMultiAnswerViewModeForTest,
  _setMultiAnswerViewModeForTest,
} from './multiAnswerViewMode'
import type { ChatMessage } from './types'

afterEach(() => {
  resetGroups()
  _resetMultiAnswerViewModeForTest()
})

function assistant(id: string, content: string, providerId: string, model: string): ChatMessage {
  return {
    id,
    role: 'assistant',
    content,
    provider_id: providerId,
    model,
    group_id: 'g1',
    timestamp: 1,
  }
}

describe('MessageGroup — columns 模式', () => {
  beforeEach(() => {
    _setMultiAnswerViewModeForTest('columns')
  })

  it('落庫態：渲染每列的「model | provider」標籤', () => {
    render(
      <MessageGroup
        conversationId="c1"
        groupId="g1"
        messages={[
          assistant('a1', 'answer one', 'openai', 'gpt-4o'),
          assistant('a2', 'answer two', 'anthropic', 'claude-3'),
        ]}
      />,
    )
    // 列頭 + footer chip 都含標籤 → getAllByText。
    expect(screen.getAllByText('gpt-4o | openai').length).toBeGreaterThan(0)
    expect(screen.getAllByText('claude-3 | anthropic').length).toBeGreaterThan(0)
  })

  it('選中條：預設第一列高亮；點選其它列觸發回撥', async () => {
    const onSelect = vi.fn()
    render(
      <MessageGroup
        conversationId="c1"
        groupId="g1"
        messages={[
          assistant('a1', 'answer one', 'openai', 'gpt-4o'),
          assistant('a2', 'answer two', 'anthropic', 'claude-3'),
        ]}
        onSelectColumn={onSelect}
      />,
    )
    // 預設第一列已選（列頭顯示「已選」）。
    expect(screen.getByText('已選')).toBeInTheDocument()
    const continueButtons = screen.getAllByText('用這條繼續')
    expect(continueButtons).toHaveLength(1)
    await act(async () => {
      continueButtons[0].click()
    })
    expect(onSelect).toHaveBeenCalledWith('g1', 'a2')
  })

  it('顯式選中條：高亮所記列', () => {
    render(
      <MessageGroup
        conversationId="c1"
        groupId="g1"
        messages={[
          assistant('a1', 'answer one', 'openai', 'gpt-4o'),
          assistant('a2', 'answer two', 'anthropic', 'claude-3'),
        ]}
        selectedMessageId="a2"
        onSelectColumn={() => {}}
      />,
    )
    // a2 被選 → a1 顯示「用這條繼續」，a2 顯示「已選」。
    expect(screen.getByText('已選')).toBeInTheDocument()
    expect(screen.getAllByText('用這條繼續')).toHaveLength(1)
  })

  it('流式態：從 group store 讀即時列，無選中標記', async () => {
    act(() => {
      beginGroup('c1', 'g1', [
        { providerId: 'openai', model: 'gpt-4o' },
        { providerId: 'anthropic', model: 'claude-3' },
      ])
      const a = ensureGroupColumn('c1', 'msg_a', 'openai', 'gpt-4o')!
      a.content = 'streaming A'
      // touchGroup 現在 rAF 合幀；測試用 flushGroups 立即同步通知訂閱者。
      flushGroups()
    })
    render(<MessageGroup conversationId="c1" groupId="g1" messages={[]} />)
    expect(screen.getByText(/streaming A/)).toBeInTheDocument()
    // 流式態不顯示選中標記（還沒落庫）。
    expect(screen.queryByText('已選')).not.toBeInTheDocument()
    expect(screen.queryByText('用這條繼續')).not.toBeInTheDocument()
  })

  it('效能降級（R10）：非聚焦列摺疊 reasoning（正文 hideBody），聚焦列展開流式思考', async () => {
    act(() => {
      beginGroup('c1', 'g1', [
        { providerId: 'openai', model: 'gpt-4o' },
        { providerId: 'anthropic', model: 'claude-3' },
      ])
      const a = ensureGroupColumn('c1', 'msg_a', 'openai', 'gpt-4o')!
      a.streaming = true
      a.reasoning = 'focused thinking'
      const b = ensureGroupColumn('c1', 'msg_b', 'anthropic', 'claude-3')!
      b.streaming = true
      b.reasoning = 'unfocused thinking'
      flushGroups()
    })
    const { container } = render(<MessageGroup conversationId="c1" groupId="g1" messages={[]} />)
    // 預設聚焦第一列（msg_a）：其 ReasoningBlock 流式展開（aria-hidden=false）。
    // 非聚焦第二列（msg_b）：reasoningStreaming=false → 摺疊 hideBody（aria-hidden=true）。
    const reasoningSections = container.querySelectorAll('section[aria-label="Thinking"] > [aria-hidden]')
    expect(reasoningSections.length).toBe(2)
    expect(reasoningSections[0].getAttribute('aria-hidden')).toBe('false')
    expect(reasoningSections[1].getAttribute('aria-hidden')).toBe('true')
  })
})

describe('MessageGroup — tabs 模式（預設）', () => {
  it('預設只整寬渲染選中條（第一條），不顯示其它條正文', () => {
    render(
      <MessageGroup
        conversationId="c1"
        groupId="g1"
        messages={[
          assistant('a1', 'answer one', 'openai', 'gpt-4o'),
          assistant('a2', 'answer two', 'anthropic', 'claude-3'),
        ]}
        onSelectColumn={() => {}}
      />,
    )
    // tabs 模式：只渲染第一條正文。
    expect(screen.getByText('answer one')).toBeInTheDocument()
    expect(screen.queryByText('answer two')).not.toBeInTheDocument()
    // 列頭「用這條繼續」按鈕在 tabs 模式不渲染（交給 footer chip）。
    expect(screen.queryByText('用這條繼續')).not.toBeInTheDocument()
    expect(screen.queryByText('已選')).not.toBeInTheDocument()
  })

  it('顯式選中條：預設整寬顯示所記列', () => {
    render(
      <MessageGroup
        conversationId="c1"
        groupId="g1"
        messages={[
          assistant('a1', 'answer one', 'openai', 'gpt-4o'),
          assistant('a2', 'answer two', 'anthropic', 'claude-3'),
        ]}
        selectedMessageId="a2"
        onSelectColumn={() => {}}
      />,
    )
    expect(screen.getByText('answer two')).toBeInTheDocument()
    expect(screen.queryByText('answer one')).not.toBeInTheDocument()
  })

  it('點 footer 模型 chip：切換顯示條並觸發 onSelectColumn（一舉兩用）', async () => {
    const onSelect = vi.fn()
    render(
      <MessageGroup
        conversationId="c1"
        groupId="g1"
        messages={[
          assistant('a1', 'answer one', 'openai', 'gpt-4o'),
          assistant('a2', 'answer two', 'anthropic', 'claude-3'),
        ]}
        onSelectColumn={onSelect}
      />,
    )
    // 初始顯示第一條。
    expect(screen.getByText('answer one')).toBeInTheDocument()
    // footer 第二個模型 chip（claude-3）。
    const chip = screen.getByTitle('claude-3 | anthropic')
    await act(async () => {
      chip.click()
    })
    // 切換到第二條 + 觸發續聊選中回撥。
    expect(screen.getByText('answer two')).toBeInTheDocument()
    expect(screen.queryByText('answer one')).not.toBeInTheDocument()
    expect(onSelect).toHaveBeenCalledWith('g1', 'a2')
  })

  it('切到 columns 模式：N 列橫向並排出現', async () => {
    render(
      <MessageGroup
        conversationId="c1"
        groupId="g1"
        messages={[
          assistant('a1', 'answer one', 'openai', 'gpt-4o'),
          assistant('a2', 'answer two', 'anthropic', 'claude-3'),
        ]}
        onSelectColumn={() => {}}
      />,
    )
    expect(screen.queryByText('answer two')).not.toBeInTheDocument()
    // 點 footer「並排」按鈕。
    const columnsBtn = screen.getByTitle('並排顯示（多列）')
    await act(async () => {
      columnsBtn.click()
    })
    // 兩條都整列渲染出來。
    expect(screen.getByText('answer one')).toBeInTheDocument()
    expect(screen.getByText('answer two')).toBeInTheDocument()
  })
})
