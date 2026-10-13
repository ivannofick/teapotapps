import { responseApi } from "../libs/RestApiHandler.js";

/**
 * Functional request validator middleware.
 * Validates target request property ('body', 'query', or 'params') against a schema of rule functions.
 * 
 * @param {Record<string, (value: any, req: any) => boolean | string>} schema - Validation schema
 * @param {'body' | 'query' | 'params'} source - Target request property to validate (default: 'body')
 * @returns {import('express').RequestHandler}
 * 
 * @example
 * router.post('/products', validate({
 *   name: (val) => Boolean(val && val.trim()) || "Nama produk wajib diisi",
 *   price: (val) => (Number(val) > 0) || "Harga harus lebih besar dari 0"
 * }), ProductController.create);
 */
export const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const data = req[source] || {};

        for (const [field, validatorFn] of Object.entries(schema)) {
            if (typeof validatorFn !== 'function') continue;

            const value = data[field];
            const result = validatorFn(value, req);

            if (typeof result === 'string') {
                return responseApi(res, null, null, result, 422);
            }

            if (result === false) {
                return responseApi(res, null, null, `Validation failed for field "${field}"`, 422);
            }
        }

        next();
    };
};

/**
 * Common reusable rule helpers (optional convenience predicates).
 */
export const rules = {
    required: (msg = "Field is required") => (val) => Boolean(val !== undefined && val !== null && String(val).trim() !== "") || msg,
    string: (msg = "Field must be a string") => (val) => typeof val === "string" || msg,
    number: (msg = "Field must be a valid number") => (val) => (!isNaN(Number(val)) && val !== null && val !== "") || msg,
    min: (minVal, msg) => (val) => (val && val.length >= minVal) || (msg || `Minimum length is ${minVal}`),
    max: (maxVal, msg) => (val) => (!val || val.length <= maxVal) || (msg || `Maximum length is ${maxVal}`),
    email: (msg = "Invalid email address") => (val) => Boolean(val && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) || msg,
    in: (allowedValues, msg) => (val) => allowedValues.includes(val) || (msg || `Value must be one of: ${allowedValues.join(', ')}`),
};
