/**
 * Wraps an asynchronous express route handler and forwards errors to the next middleware.
 * Prevents hanging requests and eliminates boilerplate try/catch blocks.
 * 
 * @param {Function} fn - Async controller function (req, res, next)
 * @returns {import('express').RequestHandler}
 * 
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await UserModels.findAll();
 *   return responseApi(res, users);
 * }));
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
