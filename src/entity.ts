export default abstract class NGAEntity {
    protected id: string;

    constructor(id) {
        this.id = id;
    }

    getId() : string {
        return this.id;
    }
}