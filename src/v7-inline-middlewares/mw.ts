import { isAuth } from "./middeware-isAuth"
import { validateBody } from "./middleware-validateBody"

export const mw = {
    isAuth,
    validateBody,
}
