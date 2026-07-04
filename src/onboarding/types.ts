export type OnboardingStepId =
  | 'welcome'
  | 'language'
  | 'provider'
  | 'webSearch'
  | 'hotkey'
  | 'done'

// 不做語言選擇步：首次執行按系統語言自動設定（見 OnboardingShell 的 detectSystemLang），
// 之後可在「設定 → 基礎」裡隨時改。
export const ONBOARDING_STEPS: OnboardingStepId[] = [
  'welcome',
  'provider',
  'webSearch',
  'hotkey',
  'done',
]
