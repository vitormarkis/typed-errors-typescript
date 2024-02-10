export class Fail<const TCode = string, const TPayload = Record<string, any>> {
    readonly code: TCode
    readonly payload: TPayload

    constructor(props: FailProps<TCode, TPayload>) {
        this.code = props.code
        this.payload = props.payload
    }

    static create<const TCode = string, const TPayload = Record<string, any>>(
        code: TCode,
        payload: TPayload
    ) {
        return new Fail({
            code,
            payload,
        })
    }
}

type FailProps<TCode = string, TPayload = Record<string, any>> = {
    code: TCode
    payload: TPayload
}

export type ExtractError<T extends (...args: any[]) => any> = T extends (
    ...args: any[]
) => Promise<infer PR>
    ? PR extends [infer E]
        ? E
        : T extends (...args: any[]) => infer R
          ? R extends [infer E]
              ? E
              : never
          : never
    : never
