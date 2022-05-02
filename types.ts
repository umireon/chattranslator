export interface TranslateTextGlossaryConfig {
  glossary?: string | null
  ignoreCase?: boolean | null
}

export interface TranslateTextOption {
  text: string
  glossaryConfig?: TranslateTextGlossaryConfig
  projectId: string
  targetLanguageCode: string
}

export interface TranslateTextResult {
  readonly detectedLanguageCode: string
  readonly glossaryConfig?: TranslateTextGlossaryConfig | null
  readonly model?: string | null
  readonly translatedText: string
}
