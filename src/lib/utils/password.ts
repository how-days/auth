import { compare, hash as bhash } from "bcryptjs";
import crypto from "crypto-js";

import { env } from "@/lib/env";

export const saltOrRounds = 10;

export const saltAndHashPassword = async (value: string) => {
  if (value.length > 100) throw new Error("Password too long");
  const preHashed = crypto
    .HmacSHA256(value, env.PASSWORD_HASHER_SECRET)
    .toString();
  return await bhash(preHashed, saltOrRounds);
};

export const comparePassword = async (value: string, hash: string) => {
  if (value.length > 100) throw new Error("Value for password is too long");
  const preHashed = crypto
    .HmacSHA256(value, env.PASSWORD_HASHER_SECRET)
    .toString();
  return compare(preHashed, hash);
};
