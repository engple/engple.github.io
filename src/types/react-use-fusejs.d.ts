declare module "react-use-fusejs" {
  export interface FuseSearchResult<T> {
    item: T
    refIndex: number
    score?: number
  }

  export function useGatsbyPluginFusejs<T>(
    query: string,
    fusejs:
      | {
          index: string
          data: T[]
        }
      | null
      | undefined,
    fuseOpts?: Record<string, unknown>,
    parseOpts?: Record<string, unknown>,
    searchOpts?: Record<string, unknown>,
  ): FuseSearchResult<T>[]
}
