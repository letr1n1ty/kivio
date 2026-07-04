// 連接器逐工具「允許/停用」開關的純函式：把 ChatMcpServer.enabled_tools 白名單
// 的語義集中在一處，方便單測。
//
// 語義：
//   - enabledTools 為空陣列 = 全部工具允許（不過濾）。
//   - 非空 = 僅白名單內的工具允許，其餘停用。
//
// 操作：
//   - disable：把某工具從「允許」變「停用」。若當前為空（全允許），先展開成全部
//     工具名再移除該工具；否則直接移除。
//   - allow：把某工具從「停用」變「允許」。加入白名單；若加完恰好等於全部工具，
//     重置為空陣列（回到「全部允許」的規範態）。

/** 某工具在當前白名單下是否處於「允許」態。空白名單 = 全部允許。 */
export function isToolAllowed(enabledTools: string[], tool: string): boolean {
  return enabledTools.length === 0 || enabledTools.includes(tool)
}

/** 停用某工具，返回新的 enabledTools。 */
export function disableTool(allTools: string[], enabledTools: string[], tool: string): string[] {
  // 當前為空 = 全部允許：先展開成全部工具名，再移除目標。
  const base = enabledTools.length === 0 ? [...allTools] : [...enabledTools]
  return base.filter((name) => name !== tool)
}

/** 允許某工具，返回新的 enabledTools。 */
export function allowTool(allTools: string[], enabledTools: string[], tool: string): string[] {
  // 當前為空 = 已是全部允許：無需變更。
  if (enabledTools.length === 0) return enabledTools
  const next = enabledTools.includes(tool) ? [...enabledTools] : [...enabledTools, tool]
  // 加完恰好覆蓋全部工具 ⇒ 回到規範的「全部允許」空陣列態。
  const allSet = new Set(allTools)
  if (next.length >= allTools.length && allTools.every((name) => next.includes(name)) && next.every((name) => allSet.has(name))) {
    return []
  }
  return next
}

/** 切換某工具的允許/停用態，返回新的 enabledTools。 */
export function toggleTool(
  allTools: string[],
  enabledTools: string[],
  tool: string,
  allow: boolean,
): string[] {
  return allow
    ? allowTool(allTools, enabledTools, tool)
    : disableTool(allTools, enabledTools, tool)
}
