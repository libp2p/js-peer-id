declare class PeerId {

    constructor(id: Buffer, privKey?: string, pubKey?: string);

    get id(): Buffer;

    get privKey(): string;

    set privKey(privKey: string): void;

    get pubKey(): string;

    set pubKey(pubKey: string): void;

    toHexString(): string;

    toBytes(): Buffer;

    toB58String(): string;

    toJSON(): PeerId.PeerIdJSON;

    toPrint(): PeerId.PeerIdJSON;

    isEqual(id: PeerId | Buffer): boolean;

    isValid(callback: (err: Error) => void): void;

}

declare namespace PeerId {

    interface PeerIdOptions {
        bits: number;
    }

    function create(options: PeerIdOptions, callback: (err: Error, id: PeerId) => void): void;

    function create(callback: (err: Error, id: PeerId) => void): void;

    function createFromHexString(str: string): PeerId;

    function createFromBytes(buf: Buffer): PeerId;

    function createFromB58String(str: string): PeerId;

    function createFromPubKey(pubKey: string, callback: (err: Error, id: PeerId) => void): void;

    function createFromPrivKey(privKey: string, callback: (err: Error, id: PeerId) => void): void;

    interface PeerIdJSON {
        id: string;
        pubKey: string;
        privKey: string;
    }

    function createFromJSON(obj: PeerIdJSON, callback: (err: Error, id: PeerId) => void): void;

    function isPeerId(id: any): boolean;

}

export = PeerId;