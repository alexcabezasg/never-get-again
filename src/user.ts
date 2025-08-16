export default class User {
    private _id: string;
    private _name: string;
    private _surname: string;

    constructor() {
        this._id = '';
        this._name = '';
        this._surname = '';
    }

    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get surname(): string {
        return this._surname;
    }

    get fullName(): string {
        return `${this._name} ${this._surname}`;
    }

    static get properties(): string[] {
        return ['id', 'name', 'surname'];
    }
}