import { Fail, bad, nice } from "./core"

type Rollback = () => Promise<void>
export type DataOrFailRollback<TError = Fail, TData = any> =
    | [error: TError, data: undefined, rollback: Rollback]
    | [error: undefined, data: TData, rollback: Rollback]

export function badRB<const T>(error: T, rollback: Rollback) {
    return [error, undefined, rollback] as [T, undefined, Rollback]
}

export function niceRB<const T = undefined>(result: T, rollback: Rollback) {
    return [undefined, result, rollback] as [undefined, T, Rollback]
}

export async function $transaction(promises: Promise<DataOrFailRollback>[]) {
    const results = await Promise.all(promises)
    const failed = results.some(([error]) => !!error)
    if (failed) {
        console.log("Some operation failed.")
        const rollbacks = results.map(([, , rollback]) => rollback())
        await Promise.all(rollbacks)
        return bad({ code: "TRANSACTION-FAILED", results })
    }

    return nice({ code: "SUCCESS", results })
}
