
export interface CluttaConfig {
  apiKey: string;
  version: string;
}

export interface Pulse {
  signatureId: string;
  chainId: string;
  correlationId: string;
  sourceId: string;
  userId: string;
  status: number;
  statusDescription: string;
}


export interface InstallerConfig {
  version: string;
}
