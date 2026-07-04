<!-- TRELLIS:START -->
# Trellis Instructions

These instructions are for AI assistants working in this project.

This project is managed by Trellis. The working knowledge you need lives under `.trellis/`:

- `.trellis/workflow.md` — development phases, when to create tasks, skill routing
- `.trellis/spec/` — package- and layer-scoped coding guidelines (read before writing code in a given layer)
- `.trellis/workspace/` — per-developer journals and session traces
- `.trellis/tasks/` — active and archived tasks (PRDs, research, jsonl context)

If a Trellis command is available on your platform (e.g. `/trellis:finish-work`, `/trellis:continue`), prefer it over manual steps. Not every platform exposes every command.

If you're using Codex or another agent-capable tool, additional project-scoped helpers may live in:
- `.agents/skills/` — reusable Trellis skills
- `.codex/agents/` — optional custom subagents

Managed by Trellis. Edits outside this block are preserved; edits inside may be overwritten by a future `trellis update`.

<!-- TRELLIS:END -->

# AGENTS.md

## Overview
- Kivio 是桌面 AI client / screen-level agent，提供 Chat、工具調用、翻譯、OCR、Lens 視覺問答、MCP、Skills、離線 Pyodide 文件工作流等能力。
- 已確認技術棧：Tauri v2、Rust 2021、React 18、TypeScript、Vite、TailwindCSS v4、Vitest、ESLint。
- 已確認平台定位：macOS 14+ 與 Windows 10/11；macOS Apple Silicon DMG 由本機建置，Windows NSIS `.exe` 由 GitHub Actions 發布。
- 後端 Rust package 與前端 npm package 版本目前皆為 `2.7.4`。

## Structure
- `src/`：React/Vite 前端原始碼。
  - `src/main.tsx`：React root entry，掛載 `App`。
  - `src/App.tsx`：依 URL hash / query mode 切換 `translator`、`#chat`、`#lens` 等視圖，並處理主題、Chat 視窗幾何、Tauri event。
  - `src/chat/`：Chat UI、訊息格式、串流狀態、工具卡、附件、設定入口、conversation persistence、Vitest 測試。
  - `src/lens/` 與 `src/Lens.tsx`：Lens 截圖問答、OCR/翻譯展示、標註與 layout 邏輯。
  - `src/settings/`：Settings UI、provider/model 設定、connectors、knowledge base、Kivio Code 設定。
  - `src/api/tauri.ts`：前端呼叫 Tauri commands 的主要 API boundary。
  - `src/data/`：模型資料庫與匹配邏輯。
- `src-tauri/`：Tauri/Rust 後端。
  - `src-tauri/src/main.rs`：GUI binary entry；`kivio code ...` 會先分流到 CLI/TUI，不啟動 GUI。
  - `src-tauri/src/lib.rs`：Tauri app builder、plugins、global state、hotkeys/tray、background sweepers、invoke handlers。
  - `src-tauri/src/chat/`：Chat orchestration、model provider layer、agent loop、knowledge base、memory、attachments、native tool integration。
  - `src-tauri/src/chat/model/`：OpenAI-compatible / Anthropic Messages provider adapters；runtime 應走 provider contract，不直接解析 provider wire format。
  - `src-tauri/src/mcp/`、`src-tauri/src/native_tools/`、`src-tauri/src/skills/`：MCP 管理、內建工具、Skills discovery/runtime。
  - `src-tauri/src/external_agents/` 與 `src-tauri/src/kivio_code/`：外部 CLI agents 與 Kivio Code CLI/TUI runtime。
  - `src-tauri/src/connectors/`：Obsidian、OAuth、Email/Himalaya connector backend。
  - `src-tauri/capabilities/`、`src-tauri/gen/schemas/`：Tauri capability 與 schema 檔；這些檔案目前在 working tree 中已有未提交修改，動手前需先檢查差異。
  - `src-tauri/resources/skills/`：打包進 app 的內建 skills。
  - `src-tauri/swift/kivio-ocr-helper/`：Swift OCR helper source；`src-tauri/binaries/` 為建置產物，不應手改或提交。
- `docs/`：架構、PRD、release packaging、screenshots 與歷史設計文件。
- `scripts/`：Pyodide asset preparation、Swift sidecar build、繁簡轉換、chat skill e2e / KaTeX smoke scripts。
- `resources/python-sandbox/pyodide/`：離線 Pyodide bundle；此路徑在 `.gitignore` 中列為本地/產物，但目前工作區可見，變更前需確認是否刻意納入發版流程。
- `public/`：app icon、logo、agent icons。
- `output/`：Playwright 等本地輸出；通常視為產物。
- `.trellis/`：Trellis 指令所述的工作知識目錄，但目前 checkout 未找到；且 `.gitignore` 會忽略 `.trellis/`。

## Build, Run, and Test
- 安裝依賴：`npm install`
- 開發執行完整 Tauri app：`npm run dev`
  - 會先嘗試 `npm run build:swift || true`，再啟動 `tauri dev`。
  - `src-tauri/tauri.conf.json` 的 `beforeDevCommand` 會執行 `npm run prepare:pyodide && npm run dev:ui`。
- 只跑前端 Vite UI：`npm run dev:ui`
  - 預設 port：`5713`。
- 建置 release：`npm run build`
  - 會先執行 `npm run build:swift`，再執行 `tauri build`。
- 建置前端 bundle：`npm run build:ui`
  - 會先執行 `npm run prepare:pyodide`，再執行 `vite build`。
- 準備離線 Pyodide assets：`npm run prepare:pyodide`
- 建置 Swift sidecar：`npm run build:swift`
- Lint：`npm run lint`
- TypeScript 檢查：`npm run typecheck`
- 前端測試：`npm run test`
- 前端 watch 測試：`npm run test:watch`
- Rust 測試：`cargo test --manifest-path src-tauri/Cargo.toml`
- 預覽前端 bundle：`npm run preview`
- Release 流程細節見 `docs/RELEASE_PACKAGING.md`；已確認文件標示 macOS Apple Silicon DMG 本機建置、GitHub Actions 只發布 Windows NSIS `.exe`。

## Development Conventions
- 修改前先確認 working tree：`git status --short`。不得覆蓋他人未提交變更；本檔更新時已看到 `src-tauri/capabilities/default.json`、`src-tauri/gen/schemas/capabilities.json`、`src-tauri/src/windows.rs` 有既有修改。
- 優先使用既有 API boundary：
  - 前端呼叫後端走 `src/api/tauri.ts`。
  - 後端新增 UI 可呼叫能力時，於 Rust command 實作後加入 `src-tauri/src/lib.rs` 的 `invoke_handler`，並同步檢查 Tauri capabilities。
  - Chat model 相關邏輯走 `src-tauri/src/chat/model/` 的 provider contract，runtime/tool loop 不應直接解析 OpenAI/Anthropic wire format。
- TypeScript：
  - `tsconfig.json` 啟用 `strict`、`noUnusedLocals`、`noUnusedParameters`、`noFallthroughCasesInSwitch`。
  - React component 使用 PascalCase；一般函式使用 camelCase；常數使用 UPPER_CASE。
  - `.tsx` 測試使用 jsdom，其他 `.ts` 測試預設 node environment。
- Rust：
  - Edition 為 2021；模組與 command function 使用 snake_case，型別使用 PascalCase。
  - 新增 async / process / IO 行為時，沿用 `tokio`、Tauri plugin、現有 `AppState` 管理模式。
  - 注意 platform cfg：macOS 與 Windows 依賴/行為分支很多，改動截圖、OCR、window、hotkey、process 時需跨平台審查。
- UI / frontend：
  - 優先延續現有 React + TailwindCSS v4 + lucide-react pattern。
  - `App.tsx` 使用 `React.lazy()` 惰性載入 `Lens` 與 `Chat`；新增主要視圖時需考慮初始 bundle 與 hash routing。
  - 避免破壞 Chat 長列表虛擬化、工具 timeline lazy rendering、Pyodide worker idle unload 等既有效能策略。
- Testing：
  - 前端共享邏輯與 UI 行為優先補 Vitest；檔名慣例為 `*.test.ts` / `*.test.tsx`。
  - Rust provider、agent loop、knowledge base、native tools 等 shared behavior 應補 `cargo test` 覆蓋。
  - 涉及 Tauri command/capability、視窗、OCR、hotkey、packaging 的改動，單元測試外還需人工或 E2E smoke 驗證。
- Assets / generated files：
  - 不手改 `node_modules/`、`dist/`、`src-tauri/target/`、`src-tauri/binaries/`、`.cache/`、`.codegraph/` 等忽略產物。
  - `src-tauri/gen/schemas/` 可能由 Tauri 生成；若 schema 因設定改動更新，需在 final report 明確說明來源與驗證。

## Notes and Risks
- Confirmed facts：
  - 專案目前有 `package-lock.json`，npm 是已確認的 package manager。
  - `vite.config.ts` 會優先使用 `resources/python-sandbox/pyodide/` 作為 Pyodide asset source；缺核心檔時才 fallback 到 `node_modules/pyodide`。
  - `src-tauri/Cargo.toml` 定義兩個 binary：`kivio` 與 `kivio-code`，並將 `default-run` 固定為 `kivio`。
  - Tauri bundle resources 會把 `src-tauri/resources/skills` 打包到 app 內的 `skills`。
  - `.gitignore` 忽略 `.trellis/`、`.agents/`、`.codex/` 等 agent 工具本地資料。
- Reasonable inferences：
  - `src-tauri/gen/schemas/`、`src-tauri/capabilities/` 的變更可能來自 Tauri capability 或 command surface 調整；修改前應 diff 檢查，避免覆蓋既有工作。
  - `resources/python-sandbox/pyodide/` 雖在 `.gitignore` 中，但 release packaging 可能依賴其本地存在；清理或重建前應先看 `docs/RELEASE_PACKAGING.md`。
  - `.trellis/` 未出現在目前 checkout，可能是本地工具資料、未初始化，或被忽略未提交。
- Unknowns / TODO：
  - TODO: Confirm `.trellis/` 是否應由 Trellis CLI 初始化，以及目前環境是否有可用的 Trellis commands。
  - TODO: Confirm Windows packaging 只由 GitHub Actions 發布的最新實際流程是否仍與 README / release docs 一致。
  - TODO: Confirm `resources/python-sandbox/pyodide/` 是否應在此工作區保留完整離線 bundle，或由 `npm run prepare:pyodide` 重建。
  - TODO: 若修改 native window / hotkey / OCR / ScreenCaptureKit，需取得 macOS 與 Windows 的實機驗證結果；目前僅靠靜態盤點無法確認 runtime 行為。
