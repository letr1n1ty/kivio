import type { ReactElement } from 'react'

// 內建專家的內聯 SVG 圖示（line 風格，stroke=currentColor 繼承呼叫處的文字色）。
// 刻意不用名字首字 / emoji 這類「字型字形」：按內建專家 id 對映到手繪 SVG；
// 非內建專家返回 null，由呼叫處自行回退到首字頭像。
//
// 實現註記：圖示以「record 內的箭頭函式」而非頂層元件宣告的形式存在，避免
// react-refresh/only-export-components 警告（本模組只對外匯出一個 helper，不是元件模組）。

const baseProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

const BUILTIN_ASSISTANT_GLYPHS: Record<string, (size: number) => ReactElement> = {
  // 寫作助手：鉛筆在基線上書寫
  asst_builtin_writer: (size) => (
    <svg width={size} height={size} {...baseProps}>
      <path d="M4 20h6" />
      <path d="m15 4 5 5L9.5 19.5 4 21l1.5-5.5L15 4Z" />
      <path d="m12.5 6.5 5 5" />
    </svg>
  ),
  // 程式設計助手：程式碼尖括號 + 斜槓
  asst_builtin_coder: (size) => (
    <svg width={size} height={size} {...baseProps}>
      <polyline points="15 7 20 12 15 17" />
      <polyline points="9 7 4 12 9 17" />
      <line x1="13" y1="5" x2="11" y2="19" />
    </svg>
  ),
  // 研究助手：放大鏡（帶內部十字，區別於通用搜尋）
  asst_builtin_researcher: (size) => (
    <svg width={size} height={size} {...baseProps}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.6-4.6" />
      <path d="M10.5 8v5" />
      <path d="M8 10.5h5" />
    </svg>
  ),
  // 資料分析：座標軸 + 柱狀圖
  asst_builtin_data: (size) => (
    <svg width={size} height={size} {...baseProps}>
      <path d="M4 4v16h16" />
      <rect x="7" y="12" width="2.6" height="5" rx="0.6" />
      <rect x="11.7" y="8" width="2.6" height="9" rx="0.6" />
      <rect x="16.4" y="14" width="2.6" height="3" rx="0.6" />
    </svg>
  ),
}

/** 返回內建專家的 SVG 圖示；非內建（無對映）返回 null，呼叫處回退到首字頭像。 */
export function builtinAssistantGlyph(id: string, size = 20): ReactElement | null {
  return BUILTIN_ASSISTANT_GLYPHS[id]?.(size) ?? null
}
