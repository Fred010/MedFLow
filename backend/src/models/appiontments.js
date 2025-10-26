import sequelize from "../db.js"; 
import { DataTypes } from "sequelize";

const appiontments = sequelize.define ("appiontments", 
    {
    appointment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
    },
    appointment_type: {
        type: DataTypes.STRING,
        allowNull: false},
    notification_method: {
        type: DataTypes.STRING,
        defaultValue: 'email',
        allowNull: false},
    description: {
        type: DataTypes.TEXT,
        allowNull: true},
    start_date_time: {
        type: DataTypes.DATE,
        allowNull: false},
    end_date_time: {
        type: DataTypes.DATE,
        allowNull: false},
    recurrence: {
        type: DataTypes.STRING,
        allowNull: false},
    
});  

   
  
export default appiontments; 