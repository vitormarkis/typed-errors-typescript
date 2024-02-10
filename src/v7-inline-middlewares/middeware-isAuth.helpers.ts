export type AuthData = {
    userId: string
}

export const decodeToken = (token: string) => {
    // ...
    return {
        userId: token,
    }
}
