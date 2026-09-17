import { Pool } from "pg";

import { toCanonicalPlaceholderName } from "./preprocess.js";
import { parseVector, vectorToSql } from "./similarity.js";
import type { AliasHit, CanonicalIngredient, CanonicalQueryOptions, NormalizerStore } from "./store.js";

export class PostgresNormalizerStore implements NormalizerStore {
  constructor(private readonly pool: Pool) {}

  async findAlias(preprocessedText: string, vendorId: string | null): Promise<AliasHit | null> {
    const result = await this.pool.query<AliasHit>(
      `
        select
          c.id as "canonicalId",
          c.canonical_name as "canonicalName",
          c.default_unit as "defaultUnit"
        from ingredient_alias a
        join ingredient_canonical c on c.id = a.canonical_id
        where a.alias_text = $1
          and (a.vendor_id = $2 or a.vendor_id is null)
        order by case when a.vendor_id = $2 then 0 else 1 end
        limit 1
      `,
      [preprocessedText, vendorId]
    );

    return result.rows[0] ?? null;
  }

  async searchCandidates(queryVector: number[], limit: number): Promise<CanonicalIngredient[]> {
    const result = await this.pool.query<{
      id: string;
      canonicalName: string;
      defaultUnit: string;
      embedding: string;
    }>(
      `
        select
          id,
          canonical_name as "canonicalName",
          default_unit as "defaultUnit",
          embedding::text as embedding
        from ingredient_canonical
        where is_active = true
          and embedding is not null
        order by embedding <=> $1::vector
        limit $2
      `,
      [vectorToSql(queryVector), limit]
    );

    return result.rows.map((row) => ({
      id: row.id,
      canonicalName: row.canonicalName,
      defaultUnit: row.defaultUnit,
      embedding: parseVector(row.embedding)
    }));
  }

  async createPlaceholder(preprocessedText: string, queryVector: number[]): Promise<CanonicalIngredient> {
    const canonicalName = toCanonicalPlaceholderName(preprocessedText);
    const result = await this.pool.query<{
      id: string;
      canonicalName: string;
      defaultUnit: string;
      embedding: string;
    }>(
      `
        insert into ingredient_canonical (
          canonical_name,
          default_unit,
          embedding,
          is_active
        )
        values ($1, 'unit', $2::vector, false)
        on conflict (canonical_name) do update
          set embedding = coalesce(ingredient_canonical.embedding, excluded.embedding)
        returning
          id,
          canonical_name as "canonicalName",
          default_unit as "defaultUnit",
          embedding::text as embedding
      `,
      [canonicalName, vectorToSql(queryVector)]
    );

    return {
      id: result.rows[0].id,
      canonicalName: result.rows[0].canonicalName,
      defaultUnit: result.rows[0].defaultUnit,
      embedding: parseVector(result.rows[0].embedding)
    };
  }

  async listCanonicals(options: CanonicalQueryOptions = {}): Promise<CanonicalIngredient[]> {
    const filters: string[] = [];

    if (!options.includeInactive) {
      filters.push("is_active = true");
    }
    if (options.onlyMissingEmbeddings) {
      filters.push("embedding is null");
    }

    const whereClause = filters.length ? `where ${filters.join(" and ")}` : "";
    const result = await this.pool.query<{
      id: string;
      canonicalName: string;
      defaultUnit: string;
      embedding: string | null;
    }>(
      `
        select
          id,
          canonical_name as "canonicalName",
          default_unit as "defaultUnit",
          embedding::text as embedding
        from ingredient_canonical
        ${whereClause}
        order by canonical_name asc
      `
    );

    return result.rows.map((row) => ({
      id: row.id,
      canonicalName: row.canonicalName,
      defaultUnit: row.defaultUnit,
      embedding: row.embedding ? parseVector(row.embedding) : null
    }));
  }

  async updateCanonicalEmbedding(canonicalId: string, embedding: number[]): Promise<void> {
    await this.pool.query(
      `
        update ingredient_canonical
        set embedding = $2::vector
        where id = $1
      `,
      [canonicalId, vectorToSql(embedding)]
    );
  }
}
