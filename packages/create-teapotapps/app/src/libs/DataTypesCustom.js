import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const { DataTypes } = Sequelize;

const DB_TYPE = (process.env.APP_DB_CONNECTION || "").toLowerCase();
const isPostgres = DB_TYPE === "postgres";
const isMySQL = DB_TYPE === "mysql";
const isMariaDB = DB_TYPE === "mariadb";

class DataTypesCustom {
    static TYPES = {
        INTEGER: DataTypes.INTEGER,

        TINYINT:
            isPostgres ? DataTypes.SMALLINT : DataTypes.TINYINT,

        BIGINT: DataTypes.BIGINT,

        STRING: (length = 255) => DataTypes.STRING(length),

        TEXT: (length = "medium") => {
            if (isPostgres) return DataTypes.TEXT;

            switch (length) {
                case "tiny":
                    return DataTypes.TEXT("tiny");
                case "medium":
                    return DataTypes.TEXT("medium");
                case "long":
                    return DataTypes.TEXT("long");
                default:
                    return DataTypes.TEXT;
            }
        },

        DECIMAL: (precision = 10, scale = 2) => DataTypes.DECIMAL(precision, scale),

        BOOLEAN: DataTypes.BOOLEAN,

        DATE: DataTypes.DATE,
        DATEONLY: DataTypes.DATEONLY,

        JSON: (() => {
            if (isPostgres || isMySQL || isMariaDB) return DataTypes.JSON;
            throw new Error(`JSON type is not supported in ${DB_TYPE}`);
        })(),

        JSONB: (() => {
            if (isPostgres) return DataTypes.JSONB;
            return DataTypes.JSON;
        })(),

        UUID: DataTypes.UUID,
        UUIDV4: DataTypes.UUIDV4,

        ENUM: (...values) => DataTypes.ENUM(...values),

        ARRAY: (type) => {
            if (isPostgres) return DataTypes.ARRAY(type);
            throw new Error(`ARRAY is only supported in PostgreSQL, not in ${DB_TYPE}`);
        },

        GEOGRAPHY: (type, srid = 4326) => {
            if (isPostgres) return DataTypes.GEOGRAPHY(type, srid);
            throw new Error(`GEOGRAPHY is only supported in PostgreSQL, not in ${DB_TYPE}`);
        },

        GEOMETRY: (type, srid = 4326) => {
            if (isPostgres) return DataTypes.GEOMETRY(type, srid);
            throw new Error(`GEOMETRY is only supported in PostgreSQL, not in ${DB_TYPE}`);
        },
    };
}

export default DataTypesCustom;
