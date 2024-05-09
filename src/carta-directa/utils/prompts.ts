export const getMenuKeyWordsPrompt = `Como una inteligencia artificial avanzada, tu tarea es analizar [QUESTION] y seleccionar la [KEY WORD] adecuada.

[QUESTION]:
{CLIENT_ANSWER}

[KEY WORD]:
({KEY_WORDS})


Tu objetivo es comprender la intención del cliente y seleccionar la keyword más adecuada en respuesta a su declaración.

Respuesta ideal ({KEY_WORDS}):`;
