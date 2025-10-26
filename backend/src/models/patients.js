import sequelize from "../config/db.js"; 
import { DataTypes } from "sequelize";

const patients = sequelize.define ("patients", 
    {
    patient_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false},
    age: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sex: {
        type: DataTypes.STRING,
        allowNull: false},    
    email: {
        type: DataTypes.STRING,
        allowNull: false}
});  

export default patients;