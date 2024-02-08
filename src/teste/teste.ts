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

type E = readonly [Error] | readonly [undefined, any]

/**
 *
 *
 *
 *
 */

async function getAccount({ accountId }: any): Promise<E> {
    const account = await db.findAccountById(accountId)

    if (!account) {
        return [new Error("ACCOUNT_NOT_FOUND")] as const
    }

    return [undefined, account] as const
}

async function addCreditToAccount({ accountId, creditAmount, userId }: any): Promise<E> {
    const [errorGettingAccount, account] = await getAccount({ accountId })

    if (errorGettingAccount) {
        return [errorGettingAccount] as const
    }

    if (account.ownerId !== userId) {
        return [new Error("USER_IS_NOT_ACCOUNT_OWNER")]
    }

    account.addCredits(creditAmount)
    const [errorSavingAccount] = await db.saveAccount(account)

    if (errorSavingAccount) {
        return [errorSavingAccount]
    }

    return [undefined, undefined] as const
}

const res = new Res()

async function main() {
    const [errorAddingCreditsToAccount] = await addCreditToAccount({
        accountId: "account_id_123",
        creditAmount: 9000,
        userId: "user_id_123",
    })

    if (errorAddingCreditsToAccount) {
        switch (errorAddingCreditsToAccount.message) {
            case "ACCOUNT_NOT_FOUND":
                return res.status(404).json({
                    message: "Conta não encontrada.",
                })
            case "USER_IS_NOT_ACCOUNT_OWNER":
                return res.status(403).json({
                    message: "Você não pode adicionar créditos em contas que você não é dono.",
                })
            default:
                return res.status(400).json({
                    message: "Erro desconhecido.",
                })
        }
    }

    return res.status(200).json({
        message: "Você adicionou 9000 créditos à sua conta.",
    })
}

main()
