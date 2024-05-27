import { RollbackEntry } from "./core"

export const RollbacksEntries: Record<
    keyof RollbackEntry,
    (props: RollbackEntry[keyof RollbackEntry]) => Promise<void>
> = {
    "SAVE-IN-DATABASE": async function ({ props, userRepository }) {
        return await userRepository.remove(props.username)
    },
}
