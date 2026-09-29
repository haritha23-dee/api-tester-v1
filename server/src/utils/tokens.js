//verify the access token via slow hasing (fastapi-jwt encode)

import {env} from "../config/env.js";

export const REFRESH_COOKIE_NAME = "refreshToken";

//set the refresh token cookie
export function setRefreshCookie(res, token){
    res.cookie(REFRESH_COOKIE_NAME, token, {
        httpOnly: true,     //frontend js can't read the cookie, strict http only
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/v1/auth",   //exact path for auth endpoints
        maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000, 
    });
}