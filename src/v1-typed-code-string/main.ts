import { bad, nice } from "~/utils"
import { Fail } from "./Fail"

const db = {
    async findAccountById(accountId: string) {
        // return null
        return {
            credits: 0,
            ownerId: "user_id_123",
            addCredits(amount: number) {
                this.credits += amount
            },
        }
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

async function getAccount({ accountId }: any) {
    const account = await db.findAccountById(accountId)

    if (!account) {
        return bad(new Fail("ACCOUNT_NOT_FOUND"))
    }

    return nice(account)
}

async function addCreditToAccount({ accountId, creditAmount, userId }: any) {
    const [errorGettingAccount, account] = await getAccount({ accountId })

    if (errorGettingAccount) {
        return bad(errorGettingAccount)
    }

    if (account.ownerId !== userId) {
        return bad(new Fail("USER_IS_NOT_ACCOUNT_OWNER"))
    }

    account.addCredits(creditAmount)
    const [errorSavingAccount] = await db.saveAccount(account)

    if (errorSavingAccount) {
        return bad(errorSavingAccount)
    }

    return nice()
}

const res = new Res()

async function main() {
    const [errorAddingCreditsToAccount] = await addCreditToAccount({
        accountId: "account_id_123",
        creditAmount: 9000,
        userId: "user_id_123",
    })

    if (errorAddingCreditsToAccount) {
        switch (errorAddingCreditsToAccount.code) {
            case "ACCOUNT_NOT_FOUND":
                return res.status(404).json({
                    message: "Account was not found.",
                })
            case "USER_IS_NOT_ACCOUNT_OWNER":
                return res.status(403).json({
                    message: "You can't credit an account that don't belongs to you.",
                })
            default:
                return res.status(400).json({
                    message: "Unknown error.",
                })
        }
    }

    return res.status(200).json({
        message: "You credited 9000 coins to your account.",
    })
}

main()
