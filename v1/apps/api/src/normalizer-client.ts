import type { NormalizeRequest, NormalizeResponse } from "@chefvision/shared";

export interface NormalizerClient {
  normalize(payload: NormalizeRequest): Promise<NormalizeResponse>;
}

export class HttpNormalizerClient implements NormalizerClient {
  constructor(private readonly baseUrl: string) {}

  async normalize(payload: NormalizeRequest): Promise<NormalizeResponse> {
    const response = await fetch(`${this.baseUrl}/normalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Normalizer failed with status ${response.status}`);
    }

    return (await response.json()) as NormalizeResponse;
  }
}
