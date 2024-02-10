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
