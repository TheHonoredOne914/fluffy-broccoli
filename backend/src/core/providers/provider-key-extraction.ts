import type { RequestKeys } from "../../lib/types.js";

export interface ProviderKeyRequest {
  headers: Record<string, string | string[] | undefined>;
}

export type ProviderKeyEnv = Partial<Record<
  | "GROQ_API_KEY"
  | "OLLAMA_API_KEY"
  | "OLLAMA_BASE_URL"
  | "NVIDIA_API_KEY"
  | "GEMINI_API_KEY"
  | "OPENROUTER_API_KEY"
  | "OPENROUTER_KEY"
  | "GITHUB_MODELS_API_KEY"
  | "GITHUB_TOKEN"
  | "TAVILY_API_KEY"
  | "SERPER_API_KEY"
  | "SERPER_KEY"
  | "EXA_API_KEY"
  | "BRAVE_API_KEY"
  | "BRAVE_KEY"
  | "FIRECRAWL_API_KEY"
  | "JINA_API_KEY"
  | "JINA_KEY"
  | "SCRAPERAPI_KEY"
  | "ZENROWS_API_KEY"
  | "SCRAPINGBEE_API_KEY"
  | "GEEKFLARE_API_KEY"
  | "HF_TOKEN"
  | "CEREBRAS_API_KEY"
  | "OPENAI_API_KEY",
  string | undefined
>>;

export function extractProviderKeys(req: ProviderKeyRequest, env: ProviderKeyEnv = process.env): RequestKeys {
  const normalizedHeaders = Object.fromEntries(
    Object.entries(req.headers ?? {}).map(([name, value]) => [name.toLowerCase(), value]),
  );
  const h = (name: string): string | null => {
    const value = normalizedHeaders[name.toLowerCase()];
    if (!value) return null;
    const first = Array.isArray(value) ? value[0] : value;
    return first?.trim() || null;
  };

  const getEnvKeys = (baseName: string): string | null => {
    const keys: string[] = [];
    // Try _1 to _5 keys
    for (let i = 1; i <= 5; i++) {
      const val = (env as Record<string, string | undefined>)[`${baseName}_${i}`];
      if (val?.trim()) keys.push(val.trim());
    }
    // Also add the base key
    const baseVal = (env as Record<string, string | undefined>)[baseName];
    if (baseVal?.trim()) keys.push(baseVal.trim());
    
    const uniqueKeys = [...new Set(keys)];
    return uniqueKeys.length > 0 ? uniqueKeys.join(",") : null;
  };

  return {
    groqKey: getEnvKeys("GROQ_API_KEY") ?? h("x-groq-api-key") ?? null,
    ollamaKey: getEnvKeys("OLLAMA_API_KEY") ?? h("x-ollama-api-key") ?? null,
    ollamaBase: getEnvKeys("OLLAMA_BASE_URL") ?? h("x-ollama-base-url") ?? null,
    nvidiaKey: getEnvKeys("NVIDIA_API_KEY") ?? h("x-nvidia-api-key") ?? null,
    geminiKey: getEnvKeys("GEMINI_API_KEY") ?? h("x-gemini-api-key") ?? null,
    openrouterKey: getEnvKeys("OPENROUTER_API_KEY") ?? getEnvKeys("OPENROUTER_KEY") ?? h("x-openrouter-api-key") ?? null,
    githubToken: getEnvKeys("GITHUB_MODELS_API_KEY") ?? getEnvKeys("GITHUB_TOKEN") ?? h("x-github-models-api-key") ?? h("x-github-token") ?? null,
    tavilyKey: getEnvKeys("TAVILY_API_KEY") ?? h("x-tavily-api-key") ?? null,
    serperKey: getEnvKeys("SERPER_API_KEY") ?? getEnvKeys("SERPER_KEY") ?? h("x-serper-api-key") ?? null,
    exaKey: getEnvKeys("EXA_API_KEY") ?? h("x-exa-api-key") ?? null,
    braveKey: getEnvKeys("BRAVE_API_KEY") ?? getEnvKeys("BRAVE_KEY") ?? h("x-brave-api-key") ?? null,
    firecrawlKey: getEnvKeys("FIRECRAWL_API_KEY") ?? h("x-firecrawl-api-key") ?? null,
    jinaKey: getEnvKeys("JINA_API_KEY") ?? getEnvKeys("JINA_KEY") ?? h("x-jina-api-key") ?? null,
    scraperapiKey: getEnvKeys("SCRAPERAPI_KEY") ?? h("x-scraperapi-api-key") ?? h("x-scraper-api-key") ?? null,
    zenrowsKey: getEnvKeys("ZENROWS_API_KEY") ?? h("x-zenrows-api-key") ?? null,
    scrapingbeeKey: getEnvKeys("SCRAPINGBEE_API_KEY") ?? h("x-scrapingbee-api-key") ?? null,
    geekflareKey: getEnvKeys("GEEKFLARE_API_KEY") ?? h("x-geekflare-api-key") ?? null,
    hfToken: getEnvKeys("HF_TOKEN") ?? h("x-hf-token") ?? null,
    cerebrasKey: getEnvKeys("CEREBRAS_API_KEY") ?? h("x-cerebras-api-key") ?? null,
    openaiKey: getEnvKeys("OPENAI_API_KEY") ?? h("x-openai-api-key") ?? null,
  };
}

