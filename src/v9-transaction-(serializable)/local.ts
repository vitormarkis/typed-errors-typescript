import { RollbacksEntries } from "~/v9-transaction-(serializable)/out"
import { Fail, bad, nice } from "./core"

export type Rollbackable<TError extends Fail = Fail> = [error: TError, ...args: any[]]

// AsyncLocalStorage coloca id na transação, e serializa com esse ID
export async function $transaction(promises: Promise<Rollbackable>[]) {
    const results = await Promise.all(promises)
    const failed = results.some(([error]) => !!error)
    if (failed) {
        console.log("Some operation failed.")
        const rollbacks = results.map(([error]) =>
            RollbacksEntries[error.rollback.name](error.rollback.props)
        )
        await Promise.all(rollbacks)
        return bad({ code: "TRANSACTION-FAILED", results })
    }

    return nice({ code: "SUCCESS", results })
}
