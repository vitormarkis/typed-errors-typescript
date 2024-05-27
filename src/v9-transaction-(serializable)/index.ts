import { Fail, bad, nice } from "./core"
import { $transaction, DataOrFailRollback, badRB, niceRB } from "./local"

export class User {
    constructor(readonly username: string) {}
}

export interface UserRepository {
    remove(username: string): Promise<void>
    save(user: User): Promise<void>
}

export class UserRepositoryMemory implements UserRepository {
    users: User[] = []

    async save(user: User): Promise<void> {
        this.users.push(user)
    }

    async remove(username: string): Promise<void> {
        this.users = this.users.filter(u => u.username !== username)
    }
}

type AsyncFunction = (...args: any[]) => Promise<any>
type RegularFunction = (...args: any[]) => any

export function getAsyncFunction(functions: Function[]) {
    const asyncHandlers: AsyncFunction[] = []
    const handlers: RegularFunction[] = []
    for (const fn of functions) {
        if (fn.constructor.name === "AsyncFunction") asyncHandlers.push(fn as AsyncFunction)
        else handlers.push(fn as RegularFunction)
    }
    return {
        asyncHandlers,
        handlers,
    }
}

// class

const userRepository: UserRepository = new UserRepositoryMemory()

async function saveInDatabase(user: User) {
    if (Math.random() > 0.9) {
        return bad(
            new Fail({
                code: "FAILED-TO-SAVE-USER-IN-DATABASE",
                payload: {},
                rollback: {
                    name: "SAVE-IN-DATABASE",
                    data: {
                        props: { username: "" },
                        userRepository,
                    },
                },
            })
        )
    }

    await userRepository.save(user)
    return nice({ message: "SUCCESS", user })
}

async function RIGHT_WAY(name: string) {
    const user = new User(name)
    const [error] = await $transaction([saveInDatabase(user)])

    console.log({ dbUsers, gatewayUsers, appUsers })
}

RIGHT_WAY("vitor")
// RIGHT_WAY("markis")

async function WRONG_WAY() {
    // single rollbacks, not batch rollbacks
    const [error$1, , rollback] = await saveInDatabase(new User("vitor"))
    if (error$1) await rollback()
    const [error$2, , rollbackGateway] = await saveInGateway(new GatewayUser("vitor", "GUEST"))
    if (error$2) await rollbackGateway()

    console.log({ dbUsers, gatewayUsers })
}
