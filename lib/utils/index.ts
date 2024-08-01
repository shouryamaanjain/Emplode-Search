import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { createOllama } from 'ollama-ai-provider'
import { createOpenAI } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { anthropic } from '@ai-sdk/anthropic'
import { CoreMessage } from 'ai'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getModel(useSubModel = false) {
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL + '/api'
  const ollamaModel = process.env.OLLAMA_MODEL
  const ollamaSubModel = process.env.OLLAMA_SUB_MODEL
  const openaiApiBase = process.env.OPENAI_API_BASE
  const openaiApiKey = process.env.OPENAI_API_KEY
  let openaiApiModel = process.env.OPENAI_API_MODEL || 'gpt-4o'
  const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY

  if (
    !(ollamaBaseUrl && ollamaModel) &&
    !openaiApiKey &&
    !googleApiKey &&
    !anthropicApiKey
  ) {
    throw new Error(
      'Missing environment variables for Ollama, OpenAI, Google or Anthropic'
    )
  }
  
  if (ollamaBaseUrl && ollamaModel) {
    const ollama = createOllama({ baseURL: ollamaBaseUrl })

    if (useSubModel && ollamaSubModel) {
      return ollama(ollamaSubModel)
    }

    return ollama(ollamaModel)
  }

  if (googleApiKey) {
    return google('models/gemini-1.5-pro-latest')
  }

  if (anthropicApiKey) {
    return anthropic('claude-3-5-sonnet-20240620')
  }

  const openai = createOpenAI({
    baseURL: openaiApiBase, 
    apiKey: openaiApiKey, 
    organization: '' 
  })

  return openai.chat(openaiApiModel)
}

/**
 * @param aiMessages - Array of AIMessage
 * @returns modifiedMessages - Array of modified messages
 */
export function transformToolMessages(messages: CoreMessage[]): CoreMessage[] {
  return messages.map(message =>
    message.role === 'tool'
      ? {
          ...message,
          role: 'assistant',
          content: JSON.stringify(message.content),
          type: 'tool'
        }
      : message
  ) as CoreMessage[]
}
