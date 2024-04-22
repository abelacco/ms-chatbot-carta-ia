import { MENU, SCHUDULE_LIST, TITLE_INT_BTN } from 'src/context/helpers/constants';


export class TextTemplates {




        static greetings(phone: string) {
        return {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'interactive',
            interactive: {
                type: 'list',
                // header: {
                //     type: 'text',
                //     text: 'Opciones',
                // },
                body: {
                    text: 'Hola, ¿qué tal? ¿Cuéntanos, cómo podemos ayudarte? ✨',
                },
                footer: {
                    text: 'Escribir ayuda para atención personalizada',
                },
                action: {
                    button: 'Ver menú 🔎',
                    sections: [
                        {
                            title: 'Menú',
                            rows: MENU
                        },
                    ],
                },
            },
        };
    }

    static askForDniTemplate(phone: string) {
        return {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'text',
            text: {
                body: '¡Genial! Por favor, ingresa tu DNI para registrarte ✅\n\n**ESTO ES UNA DEMO , ESCRIBIR 1 PARA SEGUIR**',
            },
        };
    }

    static dniConfirmationTemplate(phone: string) {
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

    static planesNutricionales(phone: string) {
        return {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'document',
            document: {
                link: 'https://drive.google.com/file/d/1aNt0jA4n7fSNSNxBUQtonnA7L86o_5sl/view?usp=sharing',
                filename: 'Planes Nutricionales.pdf',
            },

        };
    }

    static confirmAntesDeEscogerPlan(phone: string) {
        return {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'interactive',
            interactive: {
                type: 'button',
                body: {
                    text: `¿Estás list@ para continuar?                    `,
                },
                action: {
                    buttons: [
                        {
                            type: 'reply',
                            reply: {
                                id: 'btn_si',
                                title: '✅ Si',
                            },
                        },
                        {
                            type: 'reply',
                            reply: {
                                id: 'btn_no',
                                title: '⛔️ No',
                            },
                        },
                        {
                            type: 'reply',
                            reply: {
                                id: 'btn_dudas',
                                title: '🤔 Tengo dudas',
                            },
                        },
                    ],
                },
            },
        };
    }

    static cupoDisponible(phone: string) {
        return {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'interactive',
            interactive: {
                type: 'button',
                body: {
                    text: ` El cupo disponible más próximo es el 31/01/2024 ¿Deseas reservar?`,
                },
                action: {
                    buttons: [
                        {
                            type: 'reply',
                            reply: {
                                id: 'btn_si',
                                title: '✅ Si',
                            },
                        },
                        {
                            type: 'reply',
                            reply: {
                                id: 'btn_no',
                                title: '⛔️ No',
                            },
                        },
                    ],
                },
            },
        };
    }

    static listaPlanes(phone: string) {
        return {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'interactive',
            interactive: {
                type: 'button',
                body: {
                    text: `Planes a elegir ✨`,
                },
                action: {
                    buttons: [
                        {
                            type: 'reply',
                            reply: {
                                id: 'btn_si',
                                title: 'Mi Mejor Versión 🧘‍♀️',
                            },
                        },
                        {
                            type: 'reply',
                            reply: {
                                id: 'btn_no',
                                title: 'APLV 🤱',
                            },
                        },
                        {
                            type: 'reply',
                            reply: {
                                id: 'btn_dudas',
                                title: 'Mi Luna Interior🌛',
                            },
                        },
                    ],
                },
            },
        };
    }

    static tipoPlan(phone: string) {
        return {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'interactive',
            interactive: {
                type: 'button',
                body: {
                    text: `Acá puedes escoger la modalidad del plan que deseas adquirir.`,
                },
                action: {
                    buttons: [
                        {
                            type: 'reply',
                            reply: {
                                id: 'btn_si',
                                title: 'Intercambio ',
                            },
                        },
                        {
                            type: 'reply',
                            reply: {
                                id: 'Menú Semanal',
                                title: 'Menú Semanal',
                            },
                        },
                        {
                            type: 'reply',
                            reply: {
                                id: 'btn_dudas',
                                title: 'Menú Mensual',
                            },
                        },
                    ],
                },
            },
        };
    }

    static generatePaymentOptions(phone: string) {
        return {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'interactive',
            interactive: {
                type: 'button',
                body: {
                    text: 'Y ya para terminar, escoge tu medio de pago 🙌',
                },
                action: {
                    buttons: [
                        {
                            type: 'reply',
                            reply: {
                                id: 'UNIQUE_BUTTON_ID_1',
                                title: TITLE_INT_BTN.PAYMENTS_OPTIONS[0],
                            },
                        },
                        {
                          type: 'reply',
                          reply: {
                            id: 'UNIQUE_BUTTON_ID_2',
                            title: TITLE_INT_BTN.PAYMENTS_OPTIONS[1],
                          },
                        },
                        {
                            type: 'reply',
                            reply: {
                              id: 'UNIQUE_BUTTON_ID_3',
                              title: TITLE_INT_BTN.PAYMENTS_OPTIONS[2],
                            },
                          }
                    ],
                },
            },
        };
    }

    static generateTextAccount(phone: string) {
        return {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'text',
            text: {
                body: '☝️ Para terminar, por favor realizar el yape al 99999999 a nombre de Diana Otero \n\n**ESTO ES UNA DEMO, ESCRIBIR 1 PARA SEGUIR**',
            },
        };
    }


    static verifyingVoucherTemplate(phone: string) {
        return {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'text',
            text: {
                body: 'Estamos verificando tu comprobante de pago, un minuto por favor! 🙌\n\n**ESTO ES UNA DEMO, ESCRIBIR 1 PARA SEGUIR**',
            },
        };
    }


    static askForModalityTemplate(phone: string) {
        return {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'interactive',
            interactive: {
                type: 'button',
                body: {
                    text: `¿Que modalidad prefieres para la cita?`,
                },
                action: {
                    buttons: [
                        {
                            type: 'reply',
                            reply: {
                                id: 'select_on_site_id',
                                title: 'Presencial',
                            },
                        },
                        {
                            type: 'reply',
                            reply: {
                                id: 'select_remote_id',
                                title: 'Online',
                            },
                        },
                    ],
                },
            },
        };
    }



    static defaultMessageTemplate(phone: string) {
        return {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'text',
            text: {
                body: '⛔ No es lo que esperaba, vuelve a intentar',
            },
        };
    }

    static resetQuestions(phone: string) {
        return {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'interactive',
            interactive: {
                type: 'button',
                body: {
                    text: 'Has tenido varios inconvenientes, puedes reiniciar el proceso siempre que quieras escribiendo "Reset"',
                },
                action: {
                    buttons: [
                        {
                            type: 'reply',
                            reply: {
                                id: 'button_reset_id',
                                title: 'Reset',
                            },
                        },
                    ],
                },
            },
        };
    }


    static AboutOurServices(phone: string) {
        return {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'text',
            text: {
                body: '🙌\n\n**Gracias por participar en esta demostración. Este fue un ejemplo de cómo nuestro bot puede funcionar, basado en información proporcionada por el cliente. Si estás interesado en saber más sobre nuestros servicios y obtener una cotización personalizada, no dudes en contactarnos. ¡Estamos aquí para ayudarte!**',
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

    static generateDoctorList(phone: string) {
        return {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'interactive',
            interactive: {
                type: 'list',
                header: {
                    type: 'text',
                    text: 'Lista de doctores 📋',
                },
                body: {
                    text: 'Puedes elegir uno de los siguientes doctores',
                },
                footer: {
                    text: 'Escribir ayuda para atención personalizada',
                },
                action: {
                    button: 'Ver Doctores 🔎',
                    sections: [
                        {
                            title: 'Doctores',
                            rows: MENU
                        },
                    ],
                },
            },
        };
    }

    static selectHoursOptions(phone: string) {
        return {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'interactive',
            interactive: {
                type: 'button',
                body: {
                    text: `Puedes buscar  disponibilidad por lo más pronto o por un día específico`,
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









    static doctorConfirmation(phone: string, docName: string, fee: number, date: string) {
        return {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'interactive',
            interactive: {
                type: 'button',
                body: {
                    text: `Por favor, confirma tu cita: \n\nDoctor: ${docName} \nTurno: ${date} \nCosto: S/ ${fee}`,
                },
                action: {
                    buttons: [
                        {
                            type: 'reply',
                            reply: {
                                id: 'accpt_doctor',
                                title: 'Confirmar ✅',
                            },
                        },
                        {
                            type: 'reply',
                            reply: {
                                id: 'retry_doctor',
                                title: 'Elegir Otro 🔄',
                            },
                        },
                    ],
                },
            },
        };
    }

    static dateConfirmation(phone: string, date: string) {
        return {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'interactive',
            interactive: {
                type: 'button',
                body: {
                    text: `¿Confirma la fecha y hora: ${date}? 👀`,
                },
                action: {
                    buttons: [
                        {
                            type: 'reply',
                            reply: {
                                id: 'accpt_date',
                                title: 'Confirmar ✅',
                            },
                        },
                        {
                            type: 'reply',
                            reply: {
                                id: 'retry_date',
                                title: 'Elegir otra 🤔',
                            },
                        },
                    ],
                },
            },
        };
    }

    static patientConfirmationPayment(patientPhone: any) {
        // const { code, date, fee, patientId, doctorId } = appointment;
        // const { name: docName, speciality, phone: doctorPhone, office } = doctorId;
        // const { phone: patientPhone, name: patientName } = patientId;
        const docName = 'Juan Perez';
        const speciality = 'Nutrición';
        const doctorPhone = '51999999999';
        const plan = 'Mi Mejor Versión - Intercambio';
        const fee = '50';
        const patientName = 'Roberto Suarez';
        const code = '123456';
        const dateString = '21/01/2021 10:00 am';
        return {
            messaging_product: 'whatsapp',
            to: patientPhone,
            type: 'text',
            text: {
                body: `
                ¡Gracias por confiar en nuestro equipo!! 🧑‍⚕️A continuación, los datos de tu plan 🙌 \n\nEn breves te está escribiendo tu asesor personal para ayudarte en cualquier duda que tengas 🩵  
                \n\nPaciente: ${patientName}\n\nFecha y Hora de la cita: ${dateString}\n\nPlan: ${plan}\n\nLink Formulario: 'https:/demo.com'\n\nCosto del plan: S/${fee}\n\nIdentificación: ${code} \n\nMuchas gracias por adquirir un plan con Diana Otero Nutrición💯 \n\n Para mayor información acerca de la cita escribir al ${doctorPhone}`,
            },
        };
    }

    

    static reminder(phone: string) {
        return {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'text',
            text: {
                body: 'Recuerda que tienes una cita para el día Lunes 21/01/24 a las 10:00 p.m. con el Dr. Juan Perez en el consultorio 101. \n\nPara mayor información acerca de la cita escribir al 999999999',
            },
        };
    }

    static recetaMedica(phone: string) {
        return {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'document',
            document: {
                link: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                filename: 'Receta Medica.pdf',
            },
        };
    }

    










}

