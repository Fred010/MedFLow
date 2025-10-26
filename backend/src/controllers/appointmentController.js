import * as models from './model.js';


export const createAppointment = async () => {
    //const { appointment_type, notification_method, description, start_date_time, end_date_time, recurrence} = req.body;
    const appointments = await models.appointments.create({appointment_type, notification_method, description, start_date_time, end_date_time, recurrence });
    console.log('appointment created:', appointments)
    return appointments;
};

export const getAppointment = async () => {
    const appointments = await appointments.findAll();
    console.log('appointment list:', appointments)
    return appointments;
};


