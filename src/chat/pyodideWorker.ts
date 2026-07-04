/// <reference lib="webworker" />
// Pyodide 執行 Worker：把整個 Python 沙盒執行時關在這裡。主執行緒用完後 terminate() 本 worker，
// 即可把 Pyodide 的 WASM 線性記憶體（matplotlib/numpy 跑後可達數百 MB、且只增不減）整個還給 OS——
// 這是在不關閉 chat 視窗的前提下唯一能真正回收 Pyodide 記憶體的辦法。
import { runPythonInSandbox, type PythonInputFile } from './pyodideRunner'

interface RunRequest {
  id: number
  code: string
  timeoutMs: number
  files: PythonInputFile[]
}

self.onmessage = async (event: MessageEvent<RunRequest>) => {
  const { id, code, timeoutMs, files } = event.data
  try {
    const outcome = await runPythonInSandbox(code, timeoutMs, files ?? [])
    self.postMessage({ id, outcome })
  } catch (err) {
    // runPythonInSandbox 內部已兜底返回 isError 結果；這裡只防御它自身拋出的意外。
    const message = err instanceof Error ? err.message : String(err)
    self.postMessage({ id, error: message })
  }
}
