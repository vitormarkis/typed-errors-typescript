import { Fail } from "./Fail"

export type DataOrFail<TError = Fail, TData = any> =
    | [error: TError]
    | [error: undefined, data: TData]
