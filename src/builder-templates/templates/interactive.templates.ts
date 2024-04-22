import { SCHUDULE_LIST } from "src/context/helpers/constants";


export class InteractiveTemplates {

    static selectHoursOptions(phone: string, dniName: string) {
        return {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'interactive',
            interactive: {
                type: 'button',
                body: {
                    text: `Puedes buscar buscar disponibilidad por lo más pronto o por un día específico`,
                },
                action: {
                    buttons: [
                        {
                            type: 'reply',
                            reply: {
                                id: 'accpt_dni',
                                title: 'Lo más pronto 🕐',
                            },
                        },
                        {
                            type: 'reply',
                            reply: {
                                id: 'retry_dni',
                                title: 'Por día 📅',
                            },
                        },
                    ],
                },
            },
        };
    }

    static dniConfirmationTemplate(phone: string, dniName: string) {
        return {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'interactive',
            interactive: {
                type: 'button',
                body: {
                    text: `¿Eres ROBERTO DIONISIO SUAREZ PULACHE?`,
                },
                action: {
                    buttons: [
                        {
                            type: 'reply',
                            reply: {
                                id: 'accpt_dni',
                                title: 'Confirmar ✅',
                            },
                        },
                        {
                            type: 'reply',
                            reply: {
                                id: 'retry_dni',
                                title: 'Volver a intentar 👀',
                            },
                        },
                    ],
                },
            },
        };
    }


    // static generateSpecialitiesList(phone: string) {
    //     return {
    //         messaging_product: 'whatsapp',
    //         to: phone,
    //         type: 'interactive',
    //         interactive: {
    //             type: 'list',
    //             header: {
    //                 type: 'text',
    //                 text: 'Lista de especialidades 📋',
    //             },
    //             body: {
    //                 text: 'Puedes elegir una de las siguientes especialidades o escribir el nombre de la especialidad que deseas',
    //             },
    //             footer: {
    //                 text: 'Escribir ayuda para atención personalizada',
    //             },
    //             action: {
    //                 button: 'Ver especialidades 🔎',
    //                 sections: [
    //                     {
    //                         title: 'Especialidades',
    //                         rows: SPECIALITIES_LIST
    //                     },
    //                 ],
    //             },
    //         },
    //     };
    // }

    // static generateDoctorList(phone: string) {
    //     return {
    //         messaging_product: 'whatsapp',
    //         to: phone,
    //         type: 'interactive',
    //         interactive: {
    //             type: 'list',
    //             header: {
    //                 type: 'text',
    //                 text: 'Lista de doctores 📋',
    //             },
    //             body: {
    //                 text: 'Puedes elegir uno de los siguientes doctores',
    //             },
    //             footer: {
    //                 text: 'Escribir ayuda para atención personalizada',
    //             },
    //             action: {
    //                 button: 'Ver Doctores 🔎',
    //                 sections: [
    //                     {
    //                         title: 'Doctores',
    //                         rows: SPECIALITIES_LIST
    //                     },
    //                 ],
    //             },
    //         },
    //     };
    // }

    static generateHoursAvaible(phone: string) {
        return {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'interactive',
            interactive: {
                type: 'list',
                header: {
                    type: 'text',
                    text: 'Horarios disponibles 📋',
                },
                body: {
                    text: 'Puedes elegir uno de los siguientes horarios',
                },
                footer: {
                    text: 'Escribir ayuda para atención personalizada',
                },
                action: {
                    button: 'Ver Horarios 🔎',
                    sections: [
                        {
                            title: 'Horarios',
                            rows: SCHUDULE_LIST
                        },
                    ],
                },
            },
        };
    }
    

}