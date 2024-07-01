import { HfInference } from "@huggingface/inference";
import { config } from "./config";

export const inference = new HfInference(config.HUGGING_FACE_API_KEY);