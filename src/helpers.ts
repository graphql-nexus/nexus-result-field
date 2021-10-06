export const upperFirst = (x: string): string => {
  const first = x[0] ?? ''
  const rest = x.slice(1)
  return `${first.toUpperCase()}${rest}`
}
