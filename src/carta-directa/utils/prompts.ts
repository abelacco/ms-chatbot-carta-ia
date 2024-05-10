export const getMenuKeyWordsPrompt = `Como una inteligencia artificial avanzada, tu tarea es analizar [QUESTION] y seleccionar la keywords que consideres que existen en la question, si hay palabras en plural pasalas, todas las palabras tienen que estar separadas por coma.

La repuesta debe ser con el siguiente formato: hamburguesa, ensalada.

[QUESTION]:
{CLIENT_ANSWER}


Tu objetivo es comprender la intención del cliente y seleccionar las keywords más adecuadas en respuesta a su declaración.`;
