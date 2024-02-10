import { createAndAddCreditsController } from "./main"
import { Request, Response } from "./req-res-mock"

// UNAUTHENTICATED - bad
const rawHeaders = new Headers()
export const runRaw = () =>
    createAndAddCreditsController(
        new Request({
            body: {},
            headers: rawHeaders,
        }),
        new Response()
    )

/**
 *
 *
 *
 *
 *
 */

const headers = new Headers()
headers.set("Authorization", `bearer userid_123`)

// SEM BODY - bad
export const runNoBody = () =>
    createAndAddCreditsController(
        new Request({
            body: {},
            headers,
        }),
        new Response()
    )

// BAD INPUT, CREDITOS NEGATIVOS - bad
export const runNegativeCredits = () =>
    createAndAddCreditsController(
        new Request({
            body: {
                creditAmount: -100,
            },
            headers,
        }),
        new Response()
    )

// TUDO OK
export const runEverythingOK = () =>
    createAndAddCreditsController(
        new Request({
            body: {
                creditAmount: 9000,
            },
            headers,
        }),
        new Response()
    )
