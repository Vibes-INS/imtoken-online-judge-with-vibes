export const isPrimitiveEthAddress = (address: string) =>
  /^(0x){1}[0-9a-fA-F]{40}$/i.test(address)
