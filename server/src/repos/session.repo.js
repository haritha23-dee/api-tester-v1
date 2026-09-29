//communicate with the session's models (similar to CRUD Operations)
import { Session } from "../models/session.model.js";

export function create({ user, tokenHash, family, expiresAt, userAgent, ipAddress }){
    return Session.create({ user, tokenHash, family, expiresAt, userAgent, ipAddress });
}