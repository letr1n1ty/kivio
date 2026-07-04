// Presets only prefill provider metadata. Models are fetched from the provider API
// and explicitly enabled by the user.

export type ProviderPreset = {
  name: string
  /** OpenAI-compatible base URL, usually including /v1. */
  baseUrl: string
  /** 申請 API Key 的頁面（在 API 金鑰區顯示「取得 API Key」引導連結）。本機/無需 key 的可省略。 */
  apiKeyUrl?: string
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    apiKeyUrl: 'https://platform.deepseek.com/api_keys',
  },
  {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKeyUrl: 'https://openrouter.ai/keys',
  },
  {
    name: 'SiliconFlow',
    baseUrl: 'https://api.siliconflow.cn/v1',
    apiKeyUrl: 'https://cloud.siliconflow.cn/account/ak',
  },
  {
    name: 'GLM',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    apiKeyUrl: 'https://open.bigmodel.cn/usercenter/apikeys',
  },
  {
    name: 'Ollama',
    baseUrl: 'https://ollama.com/v1',
    apiKeyUrl: 'https://ollama.com/settings/keys',
  },
]
