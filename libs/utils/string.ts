export const isValidNonce = (value: string) => {
  return !isNaN(Number(value))
}
