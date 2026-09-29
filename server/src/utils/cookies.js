//cookies configuration of refresh token
import { env } from "../config/env.js";

export const REFRESH_COOKIE_NAME = "refreshToken";

//shared by set with clear to maintain the http match 
const baseOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/v1/auth",
};

export function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...baseOptions,      //calling that base options for the refresh cookie
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}

export function clearRefreshCookie(res){
    res.clearCookie(REFRESH_COOKIE_NAME, baseOptions);
}