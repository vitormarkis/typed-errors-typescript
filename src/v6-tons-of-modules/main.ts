import { AccountRepositoryMemory } from "./account-repository"
import { AccountService } from "./account-service"
import { DatabaseMemory } from "./database"
import { handleErrorAddingCreditsToAccount, handleErrorCreatingAccount } from "./main.errors"
import { Response } from "./mock-res"

async function createAndAddCreditsController(response: Response) {
    const database = new DatabaseMemory()
    const accountRepository = new AccountRepositoryMemory(database)
    const accountService = new AccountService(accountRepository)

    const [errorCreatingAccount, account] = await accountService.create({
        ownerId: "owner_1234",
    })

    if (errorCreatingAccount) {
        const result = handleErrorCreatingAccount(errorCreatingAccount)
        switch (result.code) {
            case "DATABASE_UNAVAILABLE":
                return response.status(result.status).json(result.json)
            default:
                return response.status(result.status).json(result.json)
        }
    }

    const [errorAddingCreditsToAccount] = await accountService.addCredit({
        accountId: account.id,
        creditAmount: 9000,
        userId: "owner_1234",
    })

    if (errorAddingCreditsToAccount) {
        const result = handleErrorAddingCreditsToAccount(errorAddingCreditsToAccount)
        switch (result.code) {
            case "ACCOUNT_NOT_FOUND":
                return response.status(result.status).json(result.json)
            case "USER_IS_NOT_ACCOUNT_OWNER":
                return response.status(result.status).json(result.json)
            case "DATABASE_UNAVAILABLE":
                return response.status(result.status).json(result.json)
            default:
                return response.status(result.status).json(result.json)
        }
    }

    return response.status(200).json({
        message: "You credited 9000 coins to your account.",
    })
}

const res = new Response()
createAndAddCreditsController(res)
