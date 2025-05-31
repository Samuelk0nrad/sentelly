export interface DictionaryResponse {
  word: string;
  phonetic?: string;
  definition: string;
  examples?: string[];
  synonyms?: string[];
  usage?: string;
}