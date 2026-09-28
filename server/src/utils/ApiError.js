//exceptional cases 'throw' (fastapi direct HTTPEXception with status code, details)

export class ApiError extends Error {
    constructor(statusCode, message, code="ERROR", details=undefined){
        super(message);
        this.name="ApiError";
        this.statusCode=statusCode;
        this.code=code;
        this.details=details;
        Error.captureStackTrace?.(this, this.constructor);
    }
}