import { bad, nice } from "~/utils"
import { Fail } from "./Fail"
import { AccountRepositoryMemory, IAccountRepository } from "./account-repository"
import { DataOrFail } from "./contracts"
import { Account } from "./entities"

abstract class IAccountService {
    protected abstract readonly accountRepository: IAccountRepository
    abstract addCredit(
        props: NSAccountService.AddCredit.Props
    ): Promise<DataOrFail<Fail, undefined>>
    abstract create(props: NSAccountService.Create.Props): Promise<DataOrFail<Fail, Account>>
}

export class AccountService extends IAccountService {
    protected accountRepository: AccountRepositoryMemory

    constructor(accountRepository: AccountRepositoryMemory) {
        super()
        this.accountRepository = accountRepository
    }

    async create({ ownerId }: NSAccountService.Create.Props) {
        const account = new Account(ownerId)
        const [error] = await this.accountRepository.saveAccount(account)
        if (error) {
            return bad(error)
        }
        return nice(account)
    }

    async addCredit({ accountId, creditAmount, userId }: NSAccountService.AddCredit.Props) {
        const [errorGettingAccount, account] = await this.accountRepository.getAccountById({
            accountId,
        })

        if (errorGettingAccount) {
            return bad(errorGettingAccount)
        }

        if (account.ownerId !== userId) {
            return bad(
                Fail.create("USER_IS_NOT_ACCOUNT_OWNER", {
                    userId,
                    accountId,
                    accountOwnerId: account.ownerId,
                })
            )
        }

        account.addCredits(creditAmount)
        const [errorSavingAccount] = await this.accountRepository.saveAccount(account)

        if (errorSavingAccount) {
            return bad(errorSavingAccount)
        }

        return nice()
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
    export namespace Create {
        export type Props = {
            ownerId: string
        }
    }
}
