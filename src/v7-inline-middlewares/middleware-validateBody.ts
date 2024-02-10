import { z } from "zod"
import { Request } from "./req-res-mock"
import { DataOrFail } from "./contracts"
import { bad, nice } from "~/utils"
import { MiddlewareFail } from "./middleware.helpers"

export function validateBody<TSchema extends z.ZodObject<any>>(request: Request, schema: TSchema) {
    const validationResult = schema.safeParse(request.body)
    if (validationResult.success) {
        return nice(validationResult.data as z.infer<TSchema>)
    }
    return bad({
        status: 400,
        json: {
            // infelizmente zod declara message como string
            // e não como genérico, então não tem como inferir
            validations: validationResult.error.issues.map(i => ({
                message: i.message,
                paths: i.path.map(p => String(p)),
            })),
            code: "BAD_INPUT",
        },
    })
}

type ValidationFailed = {
    validations: Array<{
        message: string
        paths: Array<string>
    }>
}

validateBody satisfies (...args: any) => DataOrFail<MiddlewareFail<ValidationFailed>, object>
