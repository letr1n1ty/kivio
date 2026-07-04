import { describe, expect, it } from 'vitest'
import {
  getThemeColorPreset,
  normalizeThemeColorId,
  THEME_COLOR_PRESETS,
} from './themeColors'

describe('theme color presets', () => {
  it('keeps legacy and editor theme ids valid', () => {
    const ids = THEME_COLOR_PRESETS.map((preset) => preset.id)
    expect(ids).toEqual([
      'neutral',
      'warm',
      'cool',
      'tokyonight',
      'everforest',
      'ayu',
      'catppuccin',
      'catppuccin-macchiato',
      'gruvbox',
      'kanagawa',
      'nord',
      'one-dark',
    ])
    expect(normalizeThemeColorId('tokyonight')).toBe('tokyonight')
    expect(normalizeThemeColorId('unknown')).toBe('neutral')
  })

  it('keeps labels for every supported language', () => {
    expect(THEME_COLOR_PRESETS.every((preset) => preset.labels.zh.length > 0)).toBe(true)
    expect(THEME_COLOR_PRESETS.every((preset) => preset.labels['zh-TW'].length > 0)).toBe(true)
    expect(THEME_COLOR_PRESETS.every((preset) => preset.labels.en.length > 0)).toBe(true)
    expect(getThemeColorPreset('neutral').labels['zh-TW']).toBe('中性')
    expect(getThemeColorPreset('tokyonight').labels.en).toBe('Tokyo Night')
  })
})
