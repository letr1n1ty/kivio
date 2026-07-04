import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChatMarkdown } from './ChatMarkdown'

// 迴歸測試：ChatMarkdown 因 props 變化（如 artifacts/citations 換引用）重渲時，公式（LazyMath）
// 不能被解除安裝重掛——否則真機裡會閃一下「原始 LaTeX → 公式」。jsdom 無 IntersectionObserver，
// LazyMath 走同步渲染，故用 DOM 節點 identity 判定是否 remount。
// 若 kvmath 退回成 components useMemo 裡的行內函式，此測試會失敗（節點被替換）。
describe('ChatMarkdown 公式穩定性', () => {
  it('artifacts 換引用重渲時，公式節點不被 remount', () => {
    const { container, rerender } = render(
      <ChatMarkdown content={'目標函式 $Z_1$ 最小化'} artifacts={[]} />,
    )
    const before = container.querySelector('.katex-lazy')
    expect(before).not.toBeNull()

    // 模擬切模型/思考等級時上層重渲傳入的新 artifacts 引用（內容不變）。
    rerender(<ChatMarkdown content={'目標函式 $Z_1$ 最小化'} artifacts={[]} />)
    const after = container.querySelector('.katex-lazy')

    expect(after).toBe(before) // 同一個 DOM 節點 = 未 remount
  })

  it('把 KaTeX HTML 隔離在 Shadow DOM 中，普通 DOM 只保留輕量 host', () => {
    const { container } = render(
      <ChatMarkdown content={'目標函式 $Z_1$ 最小化'} artifacts={[]} />,
    )

    const host = container.querySelector<HTMLElement>('[data-katex-shadow-host="true"]')
    expect(host).not.toBeNull()
    expect(host).toHaveClass('katex-lazy')
    expect(container.querySelector('.chat-markdown .katex')).toBeNull()
    expect(host?.shadowRoot?.querySelector('.katex')).not.toBeNull()
    expect(host?.shadowRoot?.querySelector('[data-katex-shadow-content="true"]')).not.toBeNull()
    expect(
      host?.shadowRoot?.querySelector('style[data-katex-shadow-style="true"]'),
    ).not.toBeNull()
  })
})
