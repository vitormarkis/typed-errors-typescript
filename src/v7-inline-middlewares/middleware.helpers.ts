export type MiddlewareFail<TJSON extends object = object> = {
    status: number
    json: Record<string, any> & TJSON
}
