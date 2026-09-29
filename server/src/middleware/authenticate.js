//fetch the current user through middleware
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import * as authService from "../services/auth.service.js";

//expects: authorization: bearer <accessToken>
export const authenticate = asyncHandler(async (req, res, next) => {
  const [scheme, token] = (req.get("authorization") ?? "").split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    throw new ApiError(401, "Authentication required", "UNAUTHENTICATED");
  }

  req.user = await authService.authenticateAccessToken(token);
  next();
});