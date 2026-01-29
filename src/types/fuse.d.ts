/**
 * Module declaration for fuse.js when used from app/api (Next.js server).
 * The package is installed; this helps TypeScript resolve it from non-src paths.
 * keys accepts string[] (Fuse.js supports path strings); we use Array<...> so
 * string[] is assignable and interface merge with the package does not narrow it out.
 */
declare module 'fuse.js' {
  export interface FuseResult<T> {
    item: T;
    refIndex: number;
    score?: number;
  }

  export interface IFuseOptions<T> {
    keys?: Array<string | { name: string; weight?: number }>;
    threshold?: number;
    includeScore?: boolean;
  }

  export default class Fuse<T> {
    constructor(list: ReadonlyArray<T>, options?: IFuseOptions<T>);
    search(pattern: string): FuseResult<T>[];
  }
}
