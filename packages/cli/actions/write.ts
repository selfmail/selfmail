import { writeFile } from "fs/promises";
import { handleError } from "./error";

export async function write(file: string, content: string) {
    await writeFile(file, content).catch((err) => { if (err) handleError(`We were unable to write the file ${file}.`) });
}