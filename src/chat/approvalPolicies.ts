/** Built-in agent tool-approval policies. Shared by InputBar + PermissionPicker (kept in its
 *  own module so component files only export components — react-refresh lint). */
export const APPROVAL_POLICY_OPTIONS = [
  {
    value: 'always_confirm',
    label: '每次確認',
    title: '請求批准',
    description: '所有工具呼叫都先問你',
  },
  {
    value: 'readonly_auto_sensitive_confirm',
    label: '敏感確認',
    title: '替我審批',
    description: '只對寫檔案、終端等風險操作確認',
  },
  {
    value: 'auto',
    label: '完全訪問',
    title: '完全訪問許可權',
    description: '工具呼叫自動放行',
  },
]

export function approvalPolicyOption(policy?: string) {
  return (
    APPROVAL_POLICY_OPTIONS.find((option) => option.value === policy)
    ?? APPROVAL_POLICY_OPTIONS[1]
  )
}
