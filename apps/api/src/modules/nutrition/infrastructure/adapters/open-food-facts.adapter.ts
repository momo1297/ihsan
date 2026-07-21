import { Injectable, Logger } from "@nestjs/common";
import { FoodDatabasePort, FoodSearchResult } from "../../application/ports/food-database.port";

interface OpenFoodFactsProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
  };
}

interface OpenFoodFactsSearchResponse {
  products?: OpenFoodFactsProduct[];
}

const SEARCH_URL = "https://world.openfoodfacts.org/api/v2/search";
const REQUEST_TIMEOUT_MS = 5000;
const RETRY_COUNT = 2;
const RETRY_DELAY_MS = 400;

@Injectable()
export class OpenFoodFactsAdapter implements FoodDatabasePort {
  private readonly logger = new Logger(OpenFoodFactsAdapter.name);

  async search(query: string): Promise<FoodSearchResult[]> {
    for (let attempt = 1; attempt <= RETRY_COUNT; attempt++) {
      const result = await this.searchOnce(query);
      if (result !== null) {
        return result;
      }
      if (attempt < RETRY_COUNT) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
    return [];
  }

  private async searchOnce(query: string): Promise<FoodSearchResult[] | null> {
    const url = new URL(SEARCH_URL);
    url.searchParams.set("search_terms", query);
    url.searchParams.set("fields", "code,product_name,brands,nutriments");
    url.searchParams.set("page_size", "15");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "Ihsan-Personal-OS/1.0 (personal use, single user)" },
      });
      if (!response.ok) {
        this.logger.warn(`OpenFoodFacts search failed with status ${response.status}`);
        return null;
      }
      const body = (await response.json()) as OpenFoodFactsSearchResponse;
      return (body.products ?? [])
        .map(toFoodSearchResult)
        .filter((result): result is FoodSearchResult => result !== null);
    } catch (error) {
      this.logger.warn(`OpenFoodFacts search errored: ${(error as Error).message}`);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function toFoodSearchResult(product: OpenFoodFactsProduct): FoodSearchResult | null {
  const name = product.product_name?.trim();
  const calories = product.nutriments?.["energy-kcal_100g"];
  if (!name || !product.code || calories === undefined) {
    return null;
  }
  return {
    externalId: product.code,
    name,
    brand: product.brands?.trim() || null,
    caloriesPer100g: round1(calories),
    proteinPer100g: round1(product.nutriments?.proteins_100g ?? 0),
    carbsPer100g: round1(product.nutriments?.carbohydrates_100g ?? 0),
    fatPer100g: round1(product.nutriments?.fat_100g ?? 0),
  };
}
