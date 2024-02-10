export class Account {
    id = Math.random().toString(36).substring(2, 14)
    credits = 0

    constructor(readonly ownerId: string) {}

    addCredits(amount: number) {
        this.credits += amount
    }

    getCredits() {
        return this.credits
    }
}
