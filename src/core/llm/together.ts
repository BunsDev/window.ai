import { messagesToPrompt } from "~core/utils/utils"

import { Model, ModelConfig, RequestOptions } from "./model"

export enum TogetherModelId {
  GPT_JT_6B_v1 = "Together-gpt-JT-6B-v1",
  GPT_NEOXT_20B_v1 = "gpt-neoxt-chat-20b-v0.15-hf",
  GPT_NEOXT_20B_v2 = "GPT-NeoXT-Chat-Base-20B-v0.16"
}

// export const TogetherModels = {
//   [TogetherModelId.GPT_JT_6B_v1]: {
//     contextLimit: 2048
//   },
//   [TogetherModelId.GPT_NEOXT_20B_v1]: {
//     contextLimit: 1024 // TODO check this
//   }
// }

export function init(
  appName: string,
  config: Pick<ModelConfig, "quality" | "debug"> &
    Partial<Pick<ModelConfig, "cacheGet" | "cacheSet">>,
  options: RequestOptions
) {
  const modelId =
    config.quality === "max"
      ? TogetherModelId.GPT_NEOXT_20B_v2
      : TogetherModelId.GPT_JT_6B_v1
  return new Model(
    {
      modelProvider: "together",
      baseUrl: "https://api.together.xyz",
      getPath: () => "/inference",
      getModelId: () => modelId,
      debug: config.debug,
      cacheGet: config.cacheGet,
      cacheSet: config.cacheSet,
      customHeaders: {
        "User-Agent": appName
      },
      transformForRequest: (req) => {
        const {
          modelId,
          prompt,
          messages,
          stop_sequences,
          num_generations,
          modelProvider,
          frequency_penalty,
          presence_penalty,
          max_tokens,
          temperature,
          top_p,
          stream,
          ...optsToSend
        } = req
        const fullPrompt =
          prompt !== undefined
            ? `<human>: ${prompt}`
            : messages
            ? messagesToPrompt(messages)
            : undefined
        return {
          ...optsToSend,
          max_tokens,
          top_p,
          temperature,
          model: modelId,
          stop: ["\n<human>", ...stop_sequences],
          prompt: fullPrompt
        }
      },
      transformResponse: (res) => {
        const anyRes = res as any
        return anyRes["output"]
          ? anyRes["output"]["choices"].map((c: any) => c["text"])
          : []
      }
    },
    options
  )
}
