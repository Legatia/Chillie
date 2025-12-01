declare module 'tweetnacl' {
    export namespace box {
        export const nonceLength: number;
        export const publicKeyLength: number;
        export const secretKeyLength: number;
        export const sharedKeyLength: number;
        export const overheadLength: number;

        export interface KeyPair {
            publicKey: Uint8Array;
            secretKey: Uint8Array;
        }

        export function keyPair(): KeyPair;
        export function keyPair_fromSecretKey(secretKey: Uint8Array): KeyPair;
        export function open(message: Uint8Array, nonce: Uint8Array, publicKey: Uint8Array, secretKey: Uint8Array): Uint8Array | null;
        export function before(publicKey: Uint8Array, secretKey: Uint8Array): Uint8Array;
        export function open_after(message: Uint8Array, nonce: Uint8Array, sharedKey: Uint8Array): Uint8Array | null;
        export function after(message: Uint8Array, nonce: Uint8Array, sharedKey: Uint8Array): Uint8Array;
    }

    export function box(message: Uint8Array, nonce: Uint8Array, publicKey: Uint8Array, secretKey: Uint8Array): Uint8Array;
    export function randomBytes(length: number): Uint8Array;
}

declare module 'tweetnacl-util' {
    export function decodeUTF8(s: string): Uint8Array;
    export function encodeUTF8(arr: Uint8Array): string;
    export function encodeBase64(arr: Uint8Array): string;
    export function decodeBase64(s: string): Uint8Array;
}
