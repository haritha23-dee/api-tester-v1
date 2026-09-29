//business logic for registerUser (check mail -> hash password -> create user -> create session -> return fields)

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { signAccessToken, verifyAccessToken, generateRefreshToken, hashToken } from "../utils/tokens.js";
import * as userRepository from "../repos/user.repo.js";
import * as sessionRepository from "../repos/session.repo.js";

//compare against when mail doesn't exist, wrong password take same time 
let dummyHashPromise;
const getDummyHash = () =>
  (dummyHashPromise ??= bcrypt.hash("timing-equalizer-password", env.BCRYPT_SALT_ROUNDS));

function toPublicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

//async issues the session token, refresh token to manage
async function issueSession(user, meta, family = crypto.randomUUID()) {
  const accessToken = signAccessToken(user._id);
  const refreshToken = generateRefreshToken();

  await sessionRepository.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    family,
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress,
  });

  return { accessToken, refreshToken };
}

export async function registerUser({ name, email, password }, meta) {
  if (await userRepository.existsByEmail(email)) {
    throw new ApiError(409, "Email is already registered", "EMAIL_TAKEN");
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  const user = await userRepository.create({ name, email, passwordHash });
  const { accessToken, refreshToken } = await issueSession(user, meta);

  return { user: toPublicUser(user), accessToken, refreshToken };
}

export async function loginUser({ email, password }, meta) {
  const user = await userRepository.findByEmailWithPassword(email);
  const hashToCompare = user ? user.passwordHash : await getDummyHash();
  const passwordMatches = await bcrypt.compare(password, hashToCompare);

  if (!user || !passwordMatches) {
    throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const { accessToken, refreshToken } = await issueSession(user, meta);

  return { user: toPublicUser(user), accessToken, refreshToken };
}

//used by authenticate middleware
export async function authenticateAccessToken(token){
    let payload;
    try {
        payload = verifyAccessToken(token);
    } catch (err) {
        if(err instanceof jwt.TokenExpiredError){
            throw new ApiError(401, "Access token expired", "TOKEN_EXPIRED");
        }
        throw new ApiError(401, "Invalid access token", "INVALID_TOKEN");
    }

    const user = await userRepository.findById(payload.sub);
    if(!user) {
        throw new ApiError(401, "Invalid access token", "INVALID_TOKEN");
    }
    return toPublicUser(user);
}

export async function refreshSession(rawToken, meta){
    const tokenHash = hashToken(rawToken);
    const previous = await sessionRepository.claimActiveByTokenHash(tokenHash);

    if(!previous) {
        const existing = await sessionRepository.findByTokenHash(tokenHash);
        if(existing?.revokedAt) {
            await sessionRepository.revokeFamily(existing.family);
            throw new ApiError(401, "Refresh token reuse detected. Please log in again.", "REFRESH_TOKEN_REUSED");
        }
        throw new ApiError(401, "Invalid or expired refresh token", "INVALID_REFRESH_TOKEN");
    }
    const user = await userRepository.findById(previous.user);
    if (!user) {
        await sessionRepository.revokeFamily(previous.family);
        throw new ApiError(401, "Invalid or expired refresh token", "INVALID_REFRESH_TOKEN");
    }

    const { accessToken, refreshToken } = await issueSession(user, meta, previous.family);
    return { user: toPublicUser(user), accessToken, refreshToken };

}

//idempotent: unknown/absent token 
export async function logoutSession(rawToken){
    if(!rawToken) return;
    const session = await sessionRepository.findByTokenHash(hashToken(rawToken));
    if(session) {
        await sessionRepository.revokeFamily(session.family);
    }
}