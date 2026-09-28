//promise handling: project rule in express (fastapi handle caches exceptions in 'async def')

export const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);