//communicate with the session's models (similar to CRUD Operations)
import { Session } from "../models/session.model.js";

export function create({ user, tokenHash, family, expiresAt, userAgent, ipAddress }){
    return Session.create({ user, tokenHash, family, expiresAt, userAgent, ipAddress });
}

export function findByTokenHash(tokenHash){
    return Session.findOne({ tokenHash });
}

export function claimActiveByTokenHash(tokenHash, now=new Date()) {
    return Session.findOneAndUpdate(
        { tokenHash, revokedAt: null, expiresAt: {$gt: now} },
        { $set: { revokedAt: now } }
    );
}

export function revokeFamily(family){
    return Session.updateMany(
        { family, revokedAt: null },
        { $set: { revokedAt: new Date() } }
    )
}