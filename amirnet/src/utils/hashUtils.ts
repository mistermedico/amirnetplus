// djb2 hash for local password storage (not for server use)
export function hashPassword(input: string): string {
  let hash = BigInt(5381);
  for (const char of input) {
    const code = BigInt(char.charCodeAt(0));
    hash = (BigInt.asUintN(64, hash << BigInt(5)) + hash + code) & BigInt('0xFFFFFFFFFFFFFFFF');
  }
  return hash.toString(16);
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
