
export interface CluttaConfig {
  apiKey: string;
}

export interface Pulse {
  signatureId: string;
  flowId: string;
  correlationId: string;
  sourceId: string;
  userId: string;
  status: number;
  statusDescription: string;
}

