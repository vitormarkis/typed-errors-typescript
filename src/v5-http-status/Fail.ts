export class Fail<
    const TCode extends string = string,
    const TStatus extends number = number,
    const TPayload extends Record<string, any> = Record<string, any>,
> {
    readonly code: TCode
    readonly status: TStatus
    readonly payload: TPayload

    constructor(props: FailProps<TCode, TStatus, TPayload>) {
        this.code = props.code
        this.status = props.status
        this.payload = props.payload
    }
}

type FailProps<TCode = string, TStatus extends number = number, TPayload = Record<string, any>> = {
    code: TCode
    payload: TPayload
    status: TStatus
}
