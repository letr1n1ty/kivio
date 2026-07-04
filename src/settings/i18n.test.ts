import { describe, expect, it } from 'vitest'
import { i18n, normalizeLang, promptLangKey } from './i18n'

describe('i18n language normalization', () => {
  it('normalizes traditional Chinese aliases to zh-TW', () => {
    expect(normalizeLang('zh-TW')).toBe('zh-TW')
    expect(normalizeLang('zh-Hant')).toBe('zh-TW')
    expect(promptLangKey('zh-Hant')).toBe('zh-TW')
  })

  it('defaults missing and unknown language codes to Traditional Chinese', () => {
    expect(normalizeLang()).toBe('zh-TW')
    expect(normalizeLang('bogus')).toBe('zh-TW')
    expect(normalizeLang('zh')).toBe('zh')
    expect(normalizeLang('zh-CN')).toBe('zh')
  })

  it('keeps a complete Traditional Chinese locale table', () => {
    expect(i18n['zh-TW'].settings).toBe('設定')
    expect(i18n['zh-TW'].systemPrompt).toBe('系統提示詞')
  })
})
