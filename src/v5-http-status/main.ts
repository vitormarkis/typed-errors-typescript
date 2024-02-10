import { bad, nice } from "~/utils"
import { Fail } from "./Fail"
import { DataOrFail } from "./contracts"
import { Prefixer } from "./prefix-class"

type Account = {
    credits: number
    ownerId: string
    addCredits(amount: number): void
}

const db = {
    async findAccountById(accountId: string): Promise<Account | null> {
        // return null
        return Promise.resolve({
            credits: 0,
            ownerId: "user_id_123",
            addCredits(amount: number) {
                this.credits += amount
            },
        })
    },
    async saveAccount(account: {}) {
        return []
    },
}

class Res {
    #status = 0
    status(num: number) {
        this.#status = num
        return this
    }

    json(obj: object) {
        console.log(this.#status, obj)
    }
}

/**
 *
 *
 *
 *
 */

namespace NSAccountRepository {
    export namespace GetAccountById {
        export type Props = { accountId: string }
    }
}

interface AccountRepository {
    getAccountById(
        props: NSAccountRepository.GetAccountById.Props
    ): Promise<DataOrFail<Fail, Account>>
}

class AccountRepositoryMemory implements AccountRepository {
    // Method can't have explicit type
    prefixer = new Prefixer("Account-Repository-Memory")

    async getAccountById({ accountId }: NSAccountRepository.GetAccountById.Props) {
        const account = await db.findAccountById(accountId)

        if (!account) {
            return this.prefixer.bad({
                code: "ACCOUNT_NOT_FOUND",
                status: 404,
                payload: {
                    foundAccount: account,
                    givenId: accountId,
                },
            })
        }

        return nice(account)
    }
}

namespace NSAccountService {
    export namespace AddCredit {
        export type Props = {
            accountId: string
            creditAmount: number
            userId: string
        }
    }
}

abstract class IAccountService {
    protected abstract readonly accountRepository: AccountRepository
    abstract addCredit(
        props: NSAccountService.AddCredit.Props
    ): Promise<DataOrFail<Fail, undefined>>
}

class AccountService extends IAccountService {
    protected accountRepository: AccountRepositoryMemory

    constructor(accountRepository: AccountRepositoryMemory) {
        super()
        this.accountRepository = accountRepository
    }

    async addCredit({ accountId, creditAmount, userId }: NSAccountService.AddCredit.Props) {
        const [errorGettingAccount, account] = await this.accountRepository.getAccountById({
            accountId,
        })

        if (errorGettingAccount) {
            return bad({
                status: errorGettingAccount.status,
                code: errorGettingAccount.code,
                payload: errorGettingAccount.payload,
            })
        }

        if (account.ownerId !== userId) {
            return bad({
                code: "USER_IS_NOT_ACCOUNT_OWNER",
                status: 403,
                payload: {
                    userId,
                    accountId,
                    accountOwnerId: account.ownerId,
                },
            })
        }

        account.addCredits(creditAmount)
        const [errorSavingAccount] = await db.saveAccount(account)

        if (errorSavingAccount) {
            return bad(errorSavingAccount)
        }

        return nice()
    }
}

const res = new Res()

async function main() {
    const accountRepository = new AccountRepositoryMemory()
    const accountService = new AccountService(accountRepository)

    const [errorAddingCreditsToAccount] = await accountService.addCredit({
        accountId: "account_id_123",
        creditAmount: 9000,
        userId: "user_id_123_9738457",
    })

    /**
     * apesar de status está tipado com número exato, essa não é uma boa prática
     * a unica camada que deve considerar status http
     * são modulos mais externos, como controllers e presenters
     * não modulos internos
     */
    if (errorAddingCreditsToAccount) {
        if (errorAddingCreditsToAccount.code === "[Account-Repository-Memory]::ACCOUNT_NOT_FOUND") {
            const { payload, status } = errorAddingCreditsToAccount
            const { givenId } = payload
            return res.status(status).json({
                message: `No account was found with ID [${givenId}]`,
            })
        }

        if (errorAddingCreditsToAccount.code === "USER_IS_NOT_ACCOUNT_OWNER") {
            const { payload, status } = errorAddingCreditsToAccount
            const { userId, accountOwnerId } = payload
            return res.status(status).json({
                message: `You can't credit an account that don't belongs to you. You user ID is [${userId}], and the owner user ID is [${accountOwnerId}]`,
            })
        }

        return res.status(400).json({
            message: "Unknown error.",
        })
    }

    return res.status(200).json({
        message: "You credited 9000 coins to your account.",
    })
}

main()
