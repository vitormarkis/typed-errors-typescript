import { Fail } from "./core"
import { $transaction, DataOrFailRollback, badRB, niceRB } from "./local"

var dbUsers: User[] = []
var gatewayUsers: GatewayUser[] = []
var appUsers: Record<string, "using" | "iddle"> = {}

class User {
    constructor(readonly username: string) {}
}

class GatewayUser {
    constructor(readonly username: string, readonly plan: string) {}
}

async function saveInDatabase(user: User) {
    const rollback = async () => {
        // console.log("saveInDatabase >> Operation failed, triggering rollbacks.")
        console.log(`Rollingback: ${user.username} removed successfully.`)
        const idx = dbUsers.indexOf(user)
        dbUsers.splice(idx, 1)
    }
    if (Math.random() > 0.8) {
        return badRB(
            new Fail({
                code: "FAILED-TO-SAVE-USER",
                payload: {},
            }),
            rollback
        )
    }

    dbUsers.push(user)
    return niceRB({ message: "SUCCESS", user }, rollback)
}
saveInDatabase satisfies (user: User) => Promise<DataOrFailRollback<{ code: string }>>

async function saveInGateway(user: GatewayUser) {
    const rollback = async () => {
        // console.log("saveInGateway >> Operation failed, triggering rollbacks.")
        console.log(`Rollingback: ${user.username} removed successfully.`)
        const idx = dbUsers.indexOf(user)
        gatewayUsers.splice(idx, 1)
    }
    if (Math.random() > 0.9) {
        return badRB(
            new Fail({
                code: "FAILED-TO-SAVE-USER-IN-GATEWAY",
                payload: {},
            }),
            rollback
        )
    }

    gatewayUsers.push(user)
    return niceRB({ message: "SUCCESS", user }, rollback)
}

saveInGateway satisfies (user: GatewayUser) => Promise<DataOrFailRollback<{ code: string }>>

async function startUsing(user: User) {
    const rollback = async () => {
        // console.log("startUsing >> Operation failed, triggering rollbacks.")
        console.log(`Rollingback: ${user.username} stop farm.`)
        appUsers[user.username] = "iddle"
    }
    if (Math.random() > 0.9) {
        return badRB(
            new Fail({
                code: "STOP-USING",
                payload: {},
            }),
            rollback
        )
    }

    appUsers[user.username] = "using"
    return niceRB({ message: "SUCCESS", user }, rollback)
}

startUsing satisfies (user: User) => Promise<DataOrFailRollback<{ code: string }>>

async function RIGHT_WAY(name: string) {
    const user = new User(name)
    const [error] = await $transaction([
        saveInDatabase(user),
        startUsing(user),
        saveInGateway(new GatewayUser(name, "GUEST")),
    ])

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
