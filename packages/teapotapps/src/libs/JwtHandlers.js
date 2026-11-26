import jwt from "jsonwebtoken";


/**
 * this object token and in bracket is a field on database
 * tod = tanda id users jika 0 berarti visitor token jika tidak 0 maka user (mark_user_id)
 * uip = IP user (user_ip)
 * uag = user agen(user_agent)
 * 
 * @param {*} data 
 * @returns 
 */
export const signVisitorToken = (data) => {
    const secret = globalThis.APP_ACCESS_TOKEN_SECRET ?? process.env.APP_ACCESS_TOKEN_SECRET;
    return jwt.sign(data, secret, {
        expiresIn: "7d",
    });
};
