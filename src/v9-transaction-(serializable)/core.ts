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

type Rollback<K extends keyof RollbackEntry = keyof RollbackEntry> = {
    name: K
    data: RollbackEntry[K]
}

export class FailV2<K extends keyof RollbackEntry> {
    constructor(readonly rollback: Rollback<K>) {}
}

const v2 = new FailV2({
    name: "SAVE-IN-GATEWAY",
    data: { props: {} },
})

export class Fail<
    K extends keyof RollbackEntry,
    const TCode extends string = string,
    const TPayload extends Record<string, any> = Record<string, any>
> {
    readonly code: TCode
    readonly payload: TPayload
    readonly rollback: Rollback<K>

    constructor(props: FailProps<K, TCode, TPayload>) {
        this.code = props.code
        this.payload = props.payload
        this.rollback = props.rollback
    }
}

type FailProps<
    K extends keyof RollbackEntry,
    TCode extends string,
    TPayload extends Record<string, any>
> = {
    code: TCode
    payload: TPayload
    rollback: {
        name: K
        data: RollbackEntry[K]
    }
}

export function bad<const T>(error: T) {
    return [error, undefined] as [T, undefined]
}

export function nice<const T = undefined>(result: T) {
    return [undefined, result] as [undefined, T]
}
