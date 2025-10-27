// Ethereum and MetaMask types for Linera integration

export interface MetaMaskInpageProvider {
  request(args: { method: string; params?: any[] }): Promise<any>;
  on(event: string, handler: (...args: any[]) => void): void;
  removeListener(event: string, handler: (...args: any[]) => void): void;
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

export {};