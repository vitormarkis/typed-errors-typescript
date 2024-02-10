import { bad, nice } from "~/utils"
import { Fail } from "./Fail"
import { DataOrFail } from "./contracts"
import { DatabaseMemory, IDatabase } from "./database"
import { Account } from "./entities"

export abstract class IAccountRepository {
    protected abstract database: IDatabase

    abstract getAccountById(
        props: NSAccountRepository.GetAccountById.Props
    ): Promise<DataOrFail<Fail, Account>>

    abstract saveAccount(props: NSAccountRepository.SaveAccount.Props): Promise<DataOrFail>
}

export class AccountRepositoryMemory extends IAccountRepository {
    protected database: DatabaseMemory

    constructor(database: DatabaseMemory) {
        super()
        this.database = database
    }

    async getAccountById({ accountId }: NSAccountRepository.GetAccountById.Props) {
        const [error, account] = this.database.findAccountById(accountId)
        if (error) {
            return bad(error)
        }

        return nice(account)
    }

    async saveAccount(account: NSAccountRepository.SaveAccount.Props) {
        const [error] = this.database.saveAccount(account)
        if (error) {
            return bad(error)
        }
        return nice()
    }
}

namespace NSAccountRepository {
    export namespace GetAccountById {
        export type Props = { accountId: string }
    }
    export namespace SaveAccount {
        export type Props = Account
    }
}
