export const getHiddenVersion = (acc: string) => `${acc.slice(0, 8)}....${acc.slice(acc.length - 8, acc.length)}`
export default getHiddenVersion
