import db from "../../configs/Database.js";
import DataTypesCustom from "../../libs/DataTypesCustom.js";
const { TYPES } = DataTypesCustom;

const WellcomeModels = db.define("wellcome", {
    id: {
        type: TYPES.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    description: {
        type: TYPES.TEXT("long"),
        allowNull: true,
    },
    type: {
        type: TYPES.TINYINT,
        defaultValue: 1,
        description: "1: itsme, 2:itsyou"
    },
    created_at: {
        type: TYPES.BIGINT,
        allowNull: true,
    },
    updated_at: {
        type: TYPES.BIGINT,
        allowNull: true,
    },
}, {
    freezeTableName: true,
    timestamps: false,
});

export default WellcomeModels;
