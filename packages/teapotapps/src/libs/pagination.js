/**
 * Pagination engine for TeapotApps.
 * Supports both Sequelize Models and Manual Raw SQL queries with safe parameter escaping.
 */

/**
 * Paginates a Sequelize Model using findAndCountAll.
 * 
 * @param {object} model - Sequelize model instance (e.g. ProductModels)
 * @param {object} queryParams - Express request query object (req.query)
 * @param {object} options - Standard Sequelize query options (where, order, include, etc.)
 * @returns {Promise<{ data: any[], meta: object }>}
 * 
 * @example
 * const result = await paginate(ProductModels, req.query, {
 *   where: { status: 1 },
 *   order: [['id', 'DESC']]
 * });
 * return responseApi(res, result.data, result.meta, "Products retrieved");
 */
export async function paginate(model, queryParams = {}, options = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(queryParams.limit, 10) || 10));
    const offset = (page - 1) * limit;

    const { count, rows } = await model.findAndCountAll({
        ...options,
        limit,
        offset,
    });

    const totalData = typeof count === 'number' ? count : (Array.isArray(count) ? count.length : 0);
    const totalPages = Math.ceil(totalData / limit);

    return {
        data: rows,
        meta: {
            page,
            limit,
            total_data: totalData,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1,
        },
    };
}

/**
 * Paginates a Manual / Raw SQL query using Sequelize db.query.
 * Automatically wraps count calculation and escapes bound parameters safely.
 * 
 * @param {string} rawSql - Base raw SQL string
 * @param {object} queryParams - Express request query object (req.query)
 * @param {object} options - Options including replacements, bind, and optional db instance
 * @returns {Promise<{ data: any[], meta: object }>}
 * 
 * @example
 * const sql = "SELECT p.*, c.name as category FROM products p JOIN categories c ON p.cat_id = c.id WHERE p.status = :status";
 * const result = await paginateQuery(sql, req.query, {
 *   replacements: { status: 1 }
 * });
 * return responseApi(res, result.data, result.meta);
 */
export async function paginateQuery(rawSql, queryParams = {}, options = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(queryParams.limit, 10) || 10));
    const offset = (page - 1) * limit;

    let db = options.db;
    if (!db) {
        try {
            const dbModule = await import('../configs/database.js');
            db = dbModule.default || dbModule.db;
        } catch {
            throw new Error("Database configuration not found. Pass { db } in options or install database module.");
        }
    }

    const { QueryTypes } = await import('sequelize');

    // 1. Calculate total records safely
    const cleanSql = rawSql.trim().replace(/;+$/, '');
    const countSql = `SELECT COUNT(*) as total_count FROM (${cleanSql}) as pagination_wrapper`;
    
    const countResult = await db.query(countSql, {
        replacements: options.replacements || {},
        type: QueryTypes.SELECT,
    });

    const totalData = countResult && countResult[0] ? Number(countResult[0].total_count || 0) : 0;
    const totalPages = Math.ceil(totalData / limit);

    // 2. Fetch paginated data
    const paginatedSql = `${cleanSql} LIMIT :paginationLimit OFFSET :paginationOffset`;
    const rows = await db.query(paginatedSql, {
        replacements: {
            ...(options.replacements || {}),
            paginationLimit: limit,
            paginationOffset: offset,
        },
        type: options.type || QueryTypes.SELECT,
    });

    return {
        data: rows,
        meta: {
            page,
            limit,
            total_data: totalData,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1,
        },
    };
}
