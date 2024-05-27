import { UserRepository } from "~/v9-transaction-(serializable)"

export type RollbackEntry = {
    "SAVE-IN-DATABASE": {
        userRepository: UserRepository
        props: { username: string }
    }
    "SAVE-IN-GATEWAY": {
        userRepository: UserRepository
        props: { username: string; planName: string }
    }
}

class UHsdfu<K extends keyof RollbackEntry> {
    constructor(rollback: { name: K; props: RollbackEntry[K] }) {}
}

new UHsdfu({
    name: "SAVE-IN-DATABASE",
    props: { props: { username } },
})

type TRollback<K extends keyof RollbackEntry> = {
    name: K
    props: RollbackEntry[K]
}

export class Fail<K extends keyof RollbackEntry> {
    readonly rollback: TRollback<K>

    constructor(rollback: TRollback) {
        this.rollback = rollback
    }
}

bad(
    new Fail({
        name: "SAVE-IN-DATABASE",
        props: {
            props: { username: "", planName: "" },
            userRepository: {} as any,
        },
    })
)

type FailProps<
    TCode = string,
    TPayload = Record<string, any>,
    TName extends keyof RollbackEntry = keyof RollbackEntry,
    TRollback = {
        name: TName
        props: RollbackEntry[TName]
    }
> = {
    code: TCode
    payload: TPayload
    rollback: TRollback
}

export function bad<const T>(error: T) {
    return [error, undefined] as [T, undefined]
}

export function nice<const T = undefined>(result: T) {
    return [undefined, result] as [undefined, T]
}
