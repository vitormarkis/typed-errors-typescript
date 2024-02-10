export class Fail<const TCode = string> {
    constructor(readonly code: TCode) {}
}
