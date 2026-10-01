//validates the inputs and HTTP Responses, depends on auth validator, auth service

import { registerSchema, loginSchema, refreshTokenSchema } from "../validators/auth.validator.js";
import * as authService from "../services/auth.service.js";
import { setRefreshCookie, clearRefreshCookie, REFRESH_COOKIE_NAME } from "../utils/cookies.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

function getRequestMeta(req) {
    return {
        userAgent: (req.get("user-agent")?? "").slice(0,255),
        ipAddress: req.ip ?? "",
    };
}

//register: input validation
export const register = asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await authService.registerUser(
    input,
    getRequestMeta(req)
  );

  setRefreshCookie(res, refreshToken);
  res.set("Cache-Control", "no-store");
  res.status(201).json({ success: true, data: { user, accessToken } });
});

export const login = asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const { user, accessToken, refreshToken } = await authService.loginUser(
    input,
    getRequestMeta(req)
  );

  setRefreshCookie(res, refreshToken);
  res.set("Cache-Control", "no-store");
  res.status(200).json({ success: true, data: { user, accessToken } });
});

export const refresh = asyncHandler(async (req, res) => {
  const parsed = refreshTokenSchema.safeParse(req.cookies?.[REFRESH_COOKIE_NAME]);
  if (!parsed.success) {
    clearRefreshCookie(res);
    throw new ApiError(401, "Refresh token missing or malformed", "INVALID_REFRESH_TOKEN");
  }

  let result;
  try {
    result = await authService.refreshSession(parsed.data, getRequestMeta(req));
  } catch (err) {
    //clears the dead cookie only for auth failures, not for transient 500s
    if (err instanceof ApiError && err.statusCode === 401) clearRefreshCookie(res);
    throw err;
  }
  setRefreshCookie(res, result.refreshToken);
  res.set("Cache-Control", "no-store");
  res.status(200).json({
    success: true,
    data: { user: result.user, accessToken: result.accessToken },
  });
});

export const logout = asyncHandler(async (req, res) => {
  const parsed = refreshTokenSchema.safeParse(req.cookies?.[REFRESH_COOKIE_NAME]);
  if (parsed.success) {
    await authService.logoutSession(parsed.data);
  }
  clearRefreshCookie(res);
  res.status(204).send();
});

export const me = (req, res) => {
  res.set("Cache-Control", "no-store");
  res.status(200).json({ success: true, data: { user: req.user } });
};