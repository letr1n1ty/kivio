/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest'
import {
  CHAT_WEBVIEW_ZOOM_DEFAULT,
  CHAT_WEBVIEW_ZOOM_MAX,
  CHAT_WEBVIEW_ZOOM_MIN,
  getRememberedChatWebviewZoom,
  hashPath,
  isChatPath,
  nextChatWebviewZoom,
  normalizeChatWebviewZoom,
  rememberChatWebviewZoom,
} from './persistence'

beforeEach(() => {
  window.localStorage.clear()
})

describe('hashPath', () => {
  it('strips hash prefix and query string', () => {
    window.location.hash = '#chat/settings?tab=general'
    expect(hashPath()).toBe('chat/settings')
  })
})

describe('isChatPath', () => {
  it('matches chat routes', () => {
    expect(isChatPath('chat')).toBe(true)
    expect(isChatPath('chat/conv-1')).toBe(true)
    expect(isChatPath('settings')).toBe(false)
  })
})

describe('chat webview zoom persistence', () => {
  it('normalizes invalid and out-of-range zoom values', () => {
    expect(normalizeChatWebviewZoom('bad')).toBe(CHAT_WEBVIEW_ZOOM_DEFAULT)
    expect(normalizeChatWebviewZoom(0.1)).toBe(CHAT_WEBVIEW_ZOOM_MIN)
    expect(normalizeChatWebviewZoom(10)).toBe(CHAT_WEBVIEW_ZOOM_MAX)
    expect(normalizeChatWebviewZoom(1.234)).toBe(1.23)
  })

  it('remembers normalized zoom values', () => {
    rememberChatWebviewZoom(1.456)

    expect(getRememberedChatWebviewZoom()).toBe(1.46)
  })

  it('falls back to default for invalid stored values', () => {
    window.localStorage.setItem('kivio-chat-webview-zoom', 'bad')

    expect(getRememberedChatWebviewZoom()).toBe(CHAT_WEBVIEW_ZOOM_DEFAULT)
  })

  it('steps and resets remembered zoom', () => {
    expect(nextChatWebviewZoom(1, 'in')).toBe(1.2)
    expect(nextChatWebviewZoom(1.2, 'out')).toBe(1)
    expect(nextChatWebviewZoom(1.8, 'in')).toBe(2)
    expect(nextChatWebviewZoom(1.4, 'reset')).toBe(CHAT_WEBVIEW_ZOOM_DEFAULT)
  })
})
