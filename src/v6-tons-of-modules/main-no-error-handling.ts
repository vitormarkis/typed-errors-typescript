import { AccountRepositoryMemory } from "./account-repository"
import { AccountService } from "./account-service"
import { DatabaseMemory } from "./database"
import { Response } from "./mock-res"

const res = new Response()

async function main() {
    try {
        const database = new DatabaseMemory()
        const accountRepository = new AccountRepositoryMemory(database)
        const accountService = new AccountService(accountRepository)

        const [errorCreatingAccount, account] = await accountService.create({
            ownerId: "owner_12342",
        })

        if (errorCreatingAccount) throw errorCreatingAccount

        const [errorAddingCreditsToAccount] = await accountService.addCredit({
            accountId: account!.id,
            creditAmount: 9000,
            userId: "owner_1234",
        })

        if (errorAddingCreditsToAccount) throw errorAddingCreditsToAccount

        return res.status(200).json({
            message: "You credited 9000 coins to your account.",
        })
    } catch (error) {
        error // type unknown
        console.log(error)
        return res.status(400).json({
            message: "Unknown error.",
        })
    }
}

main()
