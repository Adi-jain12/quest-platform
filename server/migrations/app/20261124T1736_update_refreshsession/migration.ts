#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/34433b1ae465ff56faced0f5a6a078eb55a749083d2703c9e6316b1ce2d4b199/contract';
import startContract from '../../snapshots/34433b1ae465ff56faced0f5a6a078eb55a749083d2703c9e6316b1ce2d4b199/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/9b563c8fd10c9bc04c0f8f99b05894d998c4f4ffc80822107776f18558507b66/contract';
import endContract from '../../snapshots/9b563c8fd10c9bc04c0f8f99b05894d998c4f4ffc80822107776f18558507b66/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'RefreshSession',
        column: col('familyId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'RefreshSession',
        column: col('replacedByTokenHash', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'RefreshSession',
        constraint: 'RefreshSession_replacedByTokenHash_key',
        columns: ['replacedByTokenHash'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'RefreshSession',
        index: 'RefreshSession_familyId_idx_3d03045e',
        columns: ['familyId'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
