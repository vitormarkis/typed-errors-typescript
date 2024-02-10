export class Response {
    #status = 0
    status(num: number) {
        this.#status = num
        return this
    }

    json(obj: object) {
        console.log(this.#status, obj)
    }
}

type RequestProps<TBody extends object = object> = {
    body: TBody
    headers: Headers
}

export class Request<const TBody extends object = object> {
    body: TBody
    headers: Headers

    constructor(props: RequestProps<TBody>) {
        this.body = props.body
        this.headers = props.headers
    }
}
