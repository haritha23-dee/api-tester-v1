//validates the inputs and HTTP Responses, depends on auth validator, auth service

import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import * as authService from "../services/auth.service.js";
import { setRefreshCookie } from "../utils/tokens";
import { asyncHandler } from "../utils/asyncHandler.js";

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