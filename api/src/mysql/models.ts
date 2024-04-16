import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface Connections {
  id: string;
  provider: string;
  sub: string;
  user_id: string;
}

export interface Users {
  created_at: Generated<Date>;
  deleted_at: Date | null;
  email: string;
  id: string;
  updated_at: Date | null;
}

export interface DB {
  connections: Connections;
  users: Users;
}
