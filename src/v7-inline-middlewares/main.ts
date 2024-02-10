import { z } from "zod"
import { AccountRepositoryMemory } from "./account-repository"
import { AccountService } from "./account-service"
import { DatabaseMemory } from "./database"
import { handleErrorAddingCreditsToAccount, handleErrorCreatingAccount } from "./main.errors"
import { Request, Response } from "./req-res-mock"
import { mw } from "./mw"
import { runRaw, runNoBody, runNegativeCredits, runEverythingOK } from "./run"

const database = new DatabaseMemory()
const accountRepository = new AccountRepositoryMemory(database)
const accountService = new AccountService(accountRepository)

export async function createAndAddCreditsController(req: Request, res: Response) {
    // inline middlewares, composable
    const [notAuth, authData] = mw.isAuth(req)
    if (notAuth) return res.status(notAuth.status).json(notAuth.json)

    const [invalidBody, body] = mw.validateBody(req, createAndAddCreditsBodySchema)
    if (invalidBody) return res.status(invalidBody.status).json(invalidBody.json)

    const { userId } = authData
    const { creditAmount } = body

    const [errorCreatingAccount, account] = await accountService.create({
        ownerId: userId,
    })

    if (errorCreatingAccount) {
        const result = handleErrorCreatingAccount(errorCreatingAccount)
        switch (result.code) {
            case "DATABASE_UNAVAILABLE":
                return res.status(result.status).json(result.json)
            default:
                return res.status(result.status).json(result.json)
        }
    }

    const [errorAddingCreditsToAccount] = await accountService.addCredit({
        accountId: account.id,
        creditAmount,
        userId: userId,
    })

    if (errorAddingCreditsToAccount) {
        const result = handleErrorAddingCreditsToAccount(errorAddingCreditsToAccount)
        switch (result.code) {
            case "ACCOUNT_NOT_FOUND":
                return res.status(result.status).json(result.json)
            case "USER_IS_NOT_ACCOUNT_OWNER":
                return res.status(result.status).json(result.json)
            case "DATABASE_UNAVAILABLE":
                return res.status(result.status).json(result.json)
            default:
                return res.status(result.status).json(result.json)
        }
    }

    return res.status(200).json({
        message: `You credited ${creditAmount} coins to your account.`,
        code: "SUCCESS",
    })
}

/**
 *
 *
 *
 *
 *
 *
 */

const createAndAddCreditsBodySchema = z.object({
    creditAmount: z
        .number({
            required_error: "Property 'creditAmount' of type 'number' was not provided.",
        })
        .nonnegative("NEGATIVE_CREDITS"),
})

runRaw()
runNoBody()
runNegativeCredits()
runEverythingOK()

// Try on your own
const headers = new Headers()
headers.set("Authorization", `bearer userid_123`)

createAndAddCreditsController(
    new Request({
        body: {
            creditAmount: 200,
        },
        headers,
    }),
    new Response()
)
