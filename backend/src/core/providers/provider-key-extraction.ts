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
    groqKey: h("x-groq-api-key") ?? getEnvKeys("GROQ_API_KEY") ?? null,
    ollamaKey: h("x-ollama-api-key") ?? getEnvKeys("OLLAMA_API_KEY") ?? null,
    ollamaBase: h("x-ollama-base-url") ?? getEnvKeys("OLLAMA_BASE_URL") ?? null,
    nvidiaKey: h("x-nvidia-api-key") ?? getEnvKeys("NVIDIA_API_KEY") ?? null,
    geminiKey: h("x-gemini-api-key") ?? getEnvKeys("GEMINI_API_KEY") ?? null,
    openrouterKey: h("x-openrouter-api-key") ?? getEnvKeys("OPENROUTER_API_KEY") ?? getEnvKeys("OPENROUTER_KEY") ?? null,
    githubToken: h("x-github-models-api-key") ?? h("x-github-token") ?? getEnvKeys("GITHUB_MODELS_API_KEY") ?? getEnvKeys("GITHUB_TOKEN") ?? null,
    tavilyKey: h("x-tavily-api-key") ?? getEnvKeys("TAVILY_API_KEY") ?? null,
    serperKey: h("x-serper-api-key") ?? getEnvKeys("SERPER_API_KEY") ?? getEnvKeys("SERPER_KEY") ?? null,
    exaKey: h("x-exa-api-key") ?? getEnvKeys("EXA_API_KEY") ?? null,
    braveKey: h("x-brave-api-key") ?? getEnvKeys("BRAVE_API_KEY") ?? getEnvKeys("BRAVE_KEY") ?? null,
    firecrawlKey: h("x-firecrawl-api-key") ?? getEnvKeys("FIRECRAWL_API_KEY") ?? null,
    jinaKey: h("x-jina-api-key") ?? getEnvKeys("JINA_API_KEY") ?? getEnvKeys("JINA_KEY") ?? null,
    scraperapiKey: h("x-scraperapi-api-key") ?? h("x-scraper-api-key") ?? getEnvKeys("SCRAPERAPI_KEY") ?? null,
    zenrowsKey: h("x-zenrows-api-key") ?? getEnvKeys("ZENROWS_API_KEY") ?? null,
    scrapingbeeKey: h("x-scrapingbee-api-key") ?? getEnvKeys("SCRAPINGBEE_API_KEY") ?? null,
    geekflareKey: h("x-geekflare-api-key") ?? getEnvKeys("GEEKFLARE_API_KEY") ?? null,
    hfToken: h("x-hf-token") ?? getEnvKeys("HF_TOKEN") ?? null,
    cerebrasKey: h("x-cerebras-api-key") ?? getEnvKeys("CEREBRAS_API_KEY") ?? null,
    openaiKey: h("x-openai-api-key") ?? getEnvKeys("OPENAI_API_KEY") ?? null,
  };
}
