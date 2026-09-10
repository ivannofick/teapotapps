/**
 * Time and Date utilities for TeapotApps.
 * Uses native Intl.DateTimeFormat (zero-dependency).
 */

// Default timezone is defined here as an in-file constant (not in .env)
export const DEFAULT_TIMEZONE = 'Asia/Jakarta';

export class TimeHandler {
    /**
     * Returns the current Unix epoch timestamp in seconds.
     * @returns {number}
     */
    static now() {
        return Math.floor(Date.now() / 1000);
    }

    /**
     * Returns the current Unix epoch timestamp in milliseconds.
     * @returns {number}
     */
    static nowMs() {
        return Date.now();
    }

    /**
     * Converts a Date object, ISO string, or timestamp into Unix epoch seconds.
     * @param {Date | string | number} date 
     * @returns {number}
     */
    static toEpoch(date = new Date()) {
        const d = date instanceof Date ? date : new Date(date);
        return Math.floor(d.getTime() / 1000);
    }

    /**
     * Formats a date into a standard 'YYYY-MM-DD HH:mm:ss' string in the target timezone.
     * 
     * @param {Date | string | number} [date=new Date()]
     * @param {string} [timeZone=DEFAULT_TIMEZONE] - IANA Timezone string (e.g. 'Asia/Jakarta', 'UTC')
     * @returns {string}
     * 
     * @example
     * TimeHandler.format(new Date()); // '2026-09-10 17:15:00' in Asia/Jakarta
     * TimeHandler.format(new Date(), 'UTC'); // formatted in UTC
     */
    static format(date = new Date(), timeZone = DEFAULT_TIMEZONE) {
        const d = date instanceof Date ? date : new Date(date);

        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });

        // en-CA produces 'YYYY-MM-DD, HH:mm:ss'
        return formatter.format(d).replace(', ', ' ');
    }

    /**
     * Formats a date into 'YYYY-MM-DD' date string.
     * @param {Date | string | number} [date=new Date()]
     * @param {string} [timeZone=DEFAULT_TIMEZONE]
     * @returns {string}
     */
    static toDateString(date = new Date(), timeZone = DEFAULT_TIMEZONE) {
        const d = date instanceof Date ? date : new Date(date);

        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });

        return formatter.format(d);
    }

    /**
     * Returns the start of day string 'YYYY-MM-DD 00:00:00'.
     * @param {Date | string | number} [date=new Date()]
     * @param {string} [timeZone=DEFAULT_TIMEZONE]
     * @returns {string}
     */
    static startOfDay(date = new Date(), timeZone = DEFAULT_TIMEZONE) {
        return `${this.toDateString(date, timeZone)} 00:00:00`;
    }

    /**
     * Returns the end of day string 'YYYY-MM-DD 23:59:59'.
     * @param {Date | string | number} [date=new Date()]
     * @param {string} [timeZone=DEFAULT_TIMEZONE]
     * @returns {string}
     */
    static endOfDay(date = new Date(), timeZone = DEFAULT_TIMEZONE) {
        return `${this.toDateString(date, timeZone)} 23:59:59`;
    }
}

export default TimeHandler;
