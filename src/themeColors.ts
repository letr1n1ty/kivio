import { type Lang } from './settings/i18n'

export type ThemeColorId =
  | 'neutral'
  | 'warm'
  | 'cool'
  | 'tokyonight'
  | 'everforest'
  | 'ayu'
  | 'catppuccin'
  | 'catppuccin-macchiato'
  | 'gruvbox'
  | 'kanagawa'
  | 'nord'
  | 'one-dark'

export type ThemeColorPreset = {
  id: ThemeColorId
  labels: Record<Lang, string>
}

export const DEFAULT_THEME_COLOR: ThemeColorId = 'neutral'

export const THEME_COLOR_PRESETS: ThemeColorPreset[] = [
  { id: 'neutral', labels: { zh: '中性', 'zh-TW': '中性', en: 'Neutral' } },
  { id: 'warm', labels: { zh: '暖白', 'zh-TW': '暖白', en: 'Warm' } },
  { id: 'cool', labels: { zh: '冷白', 'zh-TW': '冷白', en: 'Cool' } },
  { id: 'tokyonight', labels: { zh: 'Tokyo Night', 'zh-TW': 'Tokyo Night', en: 'Tokyo Night' } },
  { id: 'everforest', labels: { zh: 'Everforest', 'zh-TW': 'Everforest', en: 'Everforest' } },
  { id: 'ayu', labels: { zh: 'Ayu', 'zh-TW': 'Ayu', en: 'Ayu' } },
  { id: 'catppuccin', labels: { zh: 'Catppuccin', 'zh-TW': 'Catppuccin', en: 'Catppuccin' } },
  { id: 'catppuccin-macchiato', labels: { zh: 'Catppuccin Macchiato', 'zh-TW': 'Catppuccin Macchiato', en: 'Catppuccin Macchiato' } },
  { id: 'gruvbox', labels: { zh: 'Gruvbox', 'zh-TW': 'Gruvbox', en: 'Gruvbox' } },
  { id: 'kanagawa', labels: { zh: 'Kanagawa', 'zh-TW': 'Kanagawa', en: 'Kanagawa' } },
  { id: 'nord', labels: { zh: 'Nord', 'zh-TW': 'Nord', en: 'Nord' } },
  { id: 'one-dark', labels: { zh: 'One', 'zh-TW': 'One', en: 'One' } },
]

export function normalizeThemeColorId(value: string | null | undefined): ThemeColorId {
  return THEME_COLOR_PRESETS.some((preset) => preset.id === value)
    ? value as ThemeColorId
    : DEFAULT_THEME_COLOR
}

export function getThemeColorPreset(value: string | null | undefined): ThemeColorPreset {
  const id = normalizeThemeColorId(value)
  return THEME_COLOR_PRESETS.find((preset) => preset.id === id) ?? THEME_COLOR_PRESETS[0]
}
