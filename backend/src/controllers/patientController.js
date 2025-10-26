import * as models from './model.js';


export const createPatient = async (patient_id, name, age, sex, email) => {
    //const { patient_id, name, age, sex, email } = req.body;
    const patients = await models.patients.create({ patient_id, name, age, sex, email });
    console.log('patient created:', patients)
    return patients;
};

export const getPatient = async () => {
    const patients = await patients.findAll();
    console.log('users list:', users)
    return users;
};


