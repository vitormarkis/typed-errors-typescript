import { bad, nice, only } from "~/utils"
import { DataOrFail } from "./contracts"
import { Request } from "./req-res-mock"
import { decodeToken, AuthData } from "./middeware-isAuth.helpers"
import { MiddlewareFail } from "./middleware.helpers"

export function isAuth(request: Request) {
    const authorizationHeader = request.headers.get("Authorization")
    const badAuthResult = only({
        status: 401,
        json: {
            message: "You're not authenticated.",
            code: "UNAUTHENTICATED",
        },
    })

    if (!authorizationHeader) {
        return bad(badAuthResult)
    }
    const [bearer, token] = authorizationHeader.split(" ")

    if (bearer.toLowerCase() !== "bearer") {
        return bad(badAuthResult)
    }

    const authData = decodeToken(token)

    return nice(authData)
}

isAuth satisfies (request: Request) => DataOrFail<MiddlewareFail, AuthData>
