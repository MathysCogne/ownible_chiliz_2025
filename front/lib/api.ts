const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface RwaToken {
  tokenId: number;
  balance: string;
  rwaType: string;
  percent: string;
  metadataURI: string;
  price: string;
  legalDocURI: string;
  lockupEndDate: string;
  complianceRequired: boolean;
  // Soon, we will add the metadata itself
  // metadata?: Record<string, any>; 
}

export interface UserTokensResponse {
  address: string;
  tokens: RwaToken[];
}

/**
 * Fetches RWA tokens for a given user address.
 * @param address The user's wallet address.
 * @returns A promise that resolves with the user's tokens.
 */
export async function getUserTokens(address: string): Promise<UserTokensResponse> {
  if (!address) {
    console.error("User address is required to fetch tokens.");
    return { address: '', tokens: [] };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/user/${address}/tokens`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching tokens:', errorData.error || response.statusText);
      throw new Error(`API Error: ${errorData.error || response.statusText}`);
    }

    const data: UserTokensResponse = await response.json();
    
    // In the future, we might want to fetch metadata for each token here.
    // For example, by looping over data.tokens and calling fetch(token.metadataURI)

    return data;

  } catch (error) {
    console.error("Could not connect to the RWA API:", error);
    // Return an empty state in case of a network error or other issue
    return { address: address, tokens: [] };
  }
}

export interface MintRwaTokenPayload {
  to: string;
  amount: number;
  percent: number;
  rwaType: string;
  metadataURI: string;
  price: string;
  legalDocURI: string;
  lockupEndDate: number;
  complianceRequired: boolean;
}

export interface MintRwaTokenResponse {
  success: boolean;
  transactionHash: string;
  blockNumber: number;
  gasUsed: string;
  tokenId: number | null;
}

/**
 * Mints a new RWA token.
 * @param payload The data required for token creation.
 * @returns A promise that resolves with the transaction information.
 */
export async function mintRwaToken(payload: MintRwaTokenPayload): Promise<MintRwaTokenResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error minting token:', data.error || response.statusText);
      throw new Error(`API Error: ${data.error || 'An unknown error occurred'}`);
    }

    return data;
  } catch (error) {
    console.error("Could not connect to the RWA API for minting:", error);
    throw error;
  }
}

/**
 * Fetches data for a specific RWA by its ID.
 * @param tokenId The token ID.
 * @returns A promise that resolves with the token data.
 */
export async function getRwaById(tokenId: string): Promise<RwaToken> {
    try {
        const response = await fetch(`${API_BASE_URL}/rwa/${tokenId}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch RWA ${tokenId}`);
        }
        return response.json();
    } catch (error) {
        console.error(`Error fetching RWA with ID ${tokenId}:`, error);
        throw error;
    }
}

/**
 * Adds users to a token's whitelist.
 * @param tokenId The token ID.
 * @param users An array of addresses to add.
 */
export async function addToWhitelist(tokenId: string, users: string[]): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/whitelist/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tokenId, users }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add to whitelist');
        }
    } catch (error) {
        console.error('Error adding to whitelist:', error);
        throw error;
    }
}

/**
 * Deposits revenue for a specific token.
 * @param tokenId The token ID.
 * @param amount The amount in CHZ to deposit.
 */
export async function depositRevenue(tokenId: string, amount: string): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/revenue/deposit/${tokenId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to deposit revenue');
        }
    } catch (error) {
        console.error('Error depositing revenue:', error);
        throw error;
    }
}

export interface ContractInfo {
    address: string;
    owner: string;
    network: string;
    chainId: number;
}

/**
 * Fetches basic information about the contract.
 * @returns A promise that resolves with the contract information.
 */
export async function getContractInfo(): Promise<ContractInfo> {
    try {
        const response = await fetch(`${API_BASE_URL}/contract/info`);
        if (!response.ok) {
            throw new Error('Failed to fetch contract info');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching contract info:', error);
        throw error;
    }
} 