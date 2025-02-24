export default abstract class NGAEntity {
    protected id: string | number;

    constructor(id) {
        this.id = id;
    }

    getId() : string | number {
        return this.id;
    }
}