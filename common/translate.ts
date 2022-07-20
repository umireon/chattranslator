export interface TranslateTextGlossaryConfig {
  readonly glossary?: string | null;
  readonly ignoreCase?: boolean | null;
}

export interface TranslateTextResult {
  readonly detectedLanguageCode: string;
  readonly glossaryConfig?: TranslateTextGlossaryConfig | null;
  readonly model?: string | null;
  readonly translatedText: string;
}
