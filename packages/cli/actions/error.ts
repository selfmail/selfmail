import consola from "consola"

export const handleError = (error: unknown) => {
  consola.error(error)
  process.exit(1)
}