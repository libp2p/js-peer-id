import crypto, { PrivateKey, PublicKey, KeyType } from "libp2p-crypto";
import CID from 'cids'

declare namespace PeerId {
  /**
   * Options for PeerId creation.
   */
  type CreateOptions = {
    /**
     * The number of bits to use.
     */
    bits?: number;
    /**
     * The type of key to use.
     */
    keyType?: KeyType;
  };

  /**
   * PeerId JSON format.
   */
  type JSONPeerId = {
    /**
     * String representation of PeerId.
     */
    id: string;
    /**
     * Public key.
     */
    pubKey?: string;
    /**
     * Private key.
     */
    privKey: string;
  };

  /**
   * Checks if a value is an instance of PeerId.
   * @param id The value to check.
   */
  function isPeerId(id: any): id is PeerId

  /**
   * Create a new PeerId.
   * @param opts Options.
   */
  function create(opts?: PeerId.CreateOptions): Promise<PeerId>;

  /**
   * Create PeerId from hex string.
   * @param str The input hex string.
   */
  function createFromHexString(str: string): PeerId;
  
  /**
   * Create PeerId from raw bytes.
   * @param buf The raw bytes.
   */
  function createFromBytes(buf: Buffer): PeerId;

  /**
   * Create PeerId from base58-encoded string.
   * @param str The base58-encoded string.
   */
  function createFromB58String(str: string): PeerId;
  
  /**
   * Create PeerId from CID.
   * @param cid The CID.
   */
  function createFromCID(cid: CID | Buffer | string | object): PeerId;

  /**
   * Create PeerId from public key.
   * @param key Public key, as Buffer or base64-encoded string.
   */
  function createFromPubKey(key: Buffer | string): Promise<PeerId>;

  /**
   * Create PeerId from private key.
   * @param key Private key, as Buffer or base64-encoded string.
   */
  function createFromPrivKey(key: Buffer | string): Promise<PeerId>;

  /**
   * Create PeerId from PeerId JSON formatted object.
   * @see {@link PeerId#toJSON}
   * @param json PeerId in JSON format.
   */
  function createFromJSON(json: JSONPeerId): Promise<PeerId>;

  /**
   * Create PeerId from Protobuf bytes.
   * @param buf Protobuf bytes, as Buffer or hex-encoded string.
   */
  function createFromProtobuf(buf: Buffer | string): Promise<PeerId>;
}

/**
 * PeerId is an object representation of a peer identifier.
 */
declare class PeerId {
  constructor(id: Buffer | string, privKey?: PrivateKey, pubKey?: PublicKey);

  /**
   * Raw id.
   */
  readonly id: Buffer;

  /**
   * Private key.
   */
  privKey: PrivateKey;

  /**
   * Public key.
   */
  pubKey: PublicKey;

  /**
   * Return the protobuf version of the public key, matching go ipfs formatting.
   */
  marshalPubKey(): Buffer;

  /**
   * Return the protobuf version of the private key, matching go ipfs formatting.
   */
  marshalPrivKey(): Buffer;

  /**
   * Return the protobuf version of the peer-id.
   * @param excludePriv Whether to exclude the private key information from the output.
   */
  marshal(excludePriv?: boolean): Buffer;

  /**
   * String representation.
   */
  toPrint(): string;

  /**
   * Return the jsonified version of the key.
   * Matches the formatting of go-ipfs for its config file.
   * @see {@link PeerId.createFromJSON}
   */
  toJSON(): PeerId.JSONPeerId;

  /**
   * Encode to hex.
   */
  toHexString(): string;

  /**
   * Return raw id bytes.
   */
  toBytes(): Buffer;

  /**
   * Encode to base58 string.
   */
  toB58String(): string;

  /**
   * Return self-describing string representation.
   * Uses default format from RFC 0001: https://github.com/libp2p/specs/pull/209
   */
  toString(): string;

  /**
   * Checks the equality of `this` peer against a given PeerId.
   * @param id The other PeerId.
   */
  equals(id: PeerId | Buffer): boolean;

  /**
   * Checks the equality of `this` peer against a given PeerId.
   * @deprecated Use {.equals}
   * @param id The other PeerId.
   */
  isEqual(id: PeerId | Buffer): boolean;

  /**
   * Check if this PeerId instance is valid (privKey -> pubKey -> Id)
   */
  isValid(): boolean;
}

export = PeerId;
