import { bad, nice } from "~/utils"
import { Fail } from "./Fail"
import { DataOrFail } from "./contracts"
import { Account } from "./entities"

export interface IDatabase {
    findAccountById(accountId: string): DataOrFail<Fail, Account>
    saveAccount(account: Account): DataOrFail
}

export class DatabaseMemory implements IDatabase {
    accounts: Map<string, Account> = new Map()

    findAccountById(accountId: string) {
        const foundAccount = this.accounts.get(accountId)
        if (!foundAccount) {
            return bad(
                Fail.create("ACCOUNT_NOT_FOUND", {
                    givenId: accountId,
                    existingAccounts: Array.from(this.accounts.keys()),
                })
            )
        }

        return nice(foundAccount)
    }

    saveAccount(account: Account) {
        this.accounts.set(account.id, account)
        if (Math.random() < 0.01) {
            return bad(Fail.create("DATABASE_UNAVAILABLE", {}))
        }
        return nice()
    }
}
