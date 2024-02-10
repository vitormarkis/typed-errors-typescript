import { bad } from "~/utils"
import { Fail } from "./Fail"

export class Prefixer<const TModuleName extends string = string> {
    constructor(readonly moduleName: TModuleName) {}

    bad<
        const TCode extends string = string,
        const TStatus extends number = number,
        const TPayload extends Record<string, any> = Record<string, any>,
    >({ code, ...props }: ConstructorParameters<typeof Fail<TCode, TStatus, TPayload>>[0]) {
        return bad(
            new Fail({
                code: `[${this.moduleName}]::${code}`,
                ...props,
            })
        )
    }
}
