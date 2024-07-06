import { HfInference } from "@huggingface/inference";
import { config } from "./config";

/**
 * The hugging face instance
 */
export const inference = new HfInference(config.HUGGING_FACE_API_KEY);
