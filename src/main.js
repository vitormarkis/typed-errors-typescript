let variables = [] as any[]
let [res, accountId, db] = variables

async function getAccount({ accountId }) {
    const account = await db.findAccountById(accountId)

    if (!account) {
        return [new Error("ACCOUNT_NOT_FOUND")]
    }

    return [undefined, account]
}

async function addCreditsToAccount({ accountId, creditsAmount, userId }) {
    const [errorGettingAccount, account] = await getAccount({ accountId })

    if (errorGettingAccount) {
        return [errorGettingAccount]
    }

    if (account.ownerId !== userId) {
        return [new Error("USER_IS_NOT_ACCOUNT_OWNER")]
    }

    account.addCredits(creditsAmount)
    const [errorSavingAccount] = await db.saveAccount(account)

    if (errorSavingAccount) {
        return [errorSavingAccount]
    }

    return []
}

const [errorAddingCreditsToAccount] = await addCreditsToAccount({
    accountId: "account_id_123",
    creditsAmount: 9000,
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
                message: `Você não pode adicionar créditos em
                    contas que você não é dono.`,
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
