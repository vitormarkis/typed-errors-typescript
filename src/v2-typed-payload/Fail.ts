export class Fail<const TCode = string, const TPayload = Record<string, any>> {
    readonly code: TCode
    readonly payload: TPayload

    constructor(props: FailProps<TCode, TPayload>) {
        this.code = props.code
        this.payload = props.payload
    }
}

type FailProps<TCode = string, TPayload = Record<string, any>> = {
    code: TCode
    payload: TPayload
}
