export const API_ENDPOINTS = {
    THERAPISTS: '/api/therapists',
    THERAPY_TYPES: '/api/therapytype',
    ACCOUNT: {
        BASE: '/api/account',
        LOGIN: '/api/account/login',
        REGISTER: '/api/account',
        REFRESH: '/api/account/refresh',
        PROFILE: '/api/account',
        DELETE: '/api/account/delete',
        CHANGE_PASSWORD: '/api/account/change-password',
        ADD_TO_ROLE: '/api/Account/add-role',
        REMOVE_FROM_ROLE: '/api/Account/remove-role',
    },
    APPOINTMENTS: {
        BASE: '/api/appointments',
        BY_PATIENT: '/api/appointments/by-patient',
        BY_THERAPIST: '/api/appointments/by-therapist',
    },

    FIREBASE: {
        UPLOAD_PROFILE_IMAGE: 'profile-pictures',
    }
};
