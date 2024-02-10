import { only } from "~/utils"
import { ExtractError } from "./Fail"
import { AccountService } from "./account-service"

export function handleErrorAddingCreditsToAccount(
    errorAddingCreditsToAccount: ExtractError<typeof AccountService.prototype.addCredit>
) {
    switch (errorAddingCreditsToAccount.code) {
        case "ACCOUNT_NOT_FOUND":
            const { givenId, existingAccounts } = errorAddingCreditsToAccount.payload
            return only({
                code: errorAddingCreditsToAccount.code,
                status: 404,
                json: {
                    message: `No account was found with ID [${givenId}]`,
                    existingAccounts,
                    code: errorAddingCreditsToAccount.code,
                },
            })
        case "USER_IS_NOT_ACCOUNT_OWNER":
            const { accountOwnerId, userId } = errorAddingCreditsToAccount.payload
            return only({
                code: errorAddingCreditsToAccount.code,
                status: 403,
                json: {
                    message: `You can't credit an account that don't belongs to you. You user ID is [${userId}], and the owner user ID is [${accountOwnerId}]`,
                    code: errorAddingCreditsToAccount.code,
                },
            })
        case "DATABASE_UNAVAILABLE":
            return only({
                code: errorAddingCreditsToAccount.code,
                json: {
                    message: `Database is unavailable. Try again later.`,
                    code: errorAddingCreditsToAccount.code,
                },
                status: 500,
            })
        default:
            return only({
                code: "UNKNOWN",
                status: 400,
                json: {
                    message: "Unknown error.",
                    code: "UNKNOWN",
                },
            })
    }
}

export function handleErrorCreatingAccount(
    errorCreatingAccount: ExtractError<typeof AccountService.prototype.create>
) {
    switch (errorCreatingAccount.code) {
        case "DATABASE_UNAVAILABLE":
            return only({
                code: errorCreatingAccount.code,
                json: {
                    message: `Database is unavailable. Try again later.`,
                    code: errorCreatingAccount.code,
                },
                status: 500,
            })
        default:
            return only({
                code: "UNKNOWN",
                status: 400,
                json: {
                    message: "Unknown error.",
                    code: "UNKNOWN",
                },
            })
    }
}

type ControllerResponse = {
    code?: string
    json: Record<string, any>
    status: number
}

handleErrorAddingCreditsToAccount satisfies (...args: any[]) => ControllerResponse
handleErrorCreatingAccount satisfies (...args: any[]) => ControllerResponse
