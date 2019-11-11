const Alexa = require('ask-sdk-core');
const ddbAdapter = require('ask-sdk-dynamodb-persistence-adapter');
const provider = require('./provider');
const utils = require('./utils');


const SKILL_TITLE = "Estado Carnet DGT";

/*
  LaunchRequest:
    Si no está en la base de datos (dni & fecha)
      * Bienvenido a Estado de Carnet DGT, para empezar necesito que me digas tu DNI y tu fecha de nacimiento
      * Estos datos se almacenan temporalmente, hasta que tu decidas eliminarlos de nuestra base de datos
      * Para empezar di "registra mis datos" o si quieres saber mas, di "ayuda"
    Si está en la base de datos
      * ¡Hola de nuevo! Vamos a ver cual es el estado de tu carnet... <sonidos de computación>
      * El ultimo estado es: <ultimo estado>
  HelpIntent:
    * Esta skill te permite consultar el estado de tu carnet de conducir definitivo
    * Para consultar el estado de tu carnet, necesitamos tu DNI y tu fecha de nacimiento
    * Esos datos se guardan en nuestra base de datos para las próximas veces que lo consultes
    * Y obviamente, se envían a la pagina web de la DGT que es la que nos da el estado de tu carnet
    * Para eliminar tus datos di "elimina mis datos"
    * Para registrar tus datos di "registra mis datos"
    * Una vez estés registrado, puedes consultar el estado de tu carnet diciendo "consulta el estado"
  RegisterUserDataIntent:
    Si no está en la base de datos (dni & fecha)
      * Dime tu DNI incluyendo la letra
        05975463V
          Si es valido
            * Bien, ahora dime tu fecha de nacimiento
              29 de octubre de 1999
                * Guardar en base de datos y consultar
          Si no es valido
            * Ese dni no parece ser valido, volver a preguntar
    Si está en la base de datos
      * Parece que ya estás en nuestra base de datos, si quieres eliminar tus datos di "elimina mis datos"
  ClearUserDataIntent:
    Si no está en la base de datos (dni & fecha)
      * Parece que ya no estás en nuestra base de datos, no tenemos nada que eliminar
    Si está en la base de datos
      * Hemos eliminado todos los datos que guardábamos de tí, disfruta de tu carnet <sonido de coche>
  StatusQueryIntent:
    Si no está en la base de datos (dni & fecha)
      * Parece que todavía no estás en nuestra base de datos, dí "registra mis datos" para empezar
    Si está en la base de datos
      * El ultimo estado es: <ultimo estado>
*/

const RegisterUserDataIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RegisterUserDataIntent';
  },

  async handle(handlerInput) {
    const { attributesManager, requestEnvelope } = handlerInput;
    const attributes = await attributesManager.getPersistentAttributes() || {};
    const intent = requestEnvelope.request.intent;
    
    if (attributes.dniNumber && attributes.birthDate) {
      const speechText = 'Parece que ya estás en nuestra base de datos, si quieres eliminar tus datos di "elimina mis datos"';
      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard(SKILL_TITLE, speechText)
        .getResponse()
    }

    const dniNumberSlot = intent.slots["dniNumber"].value;
    const birthDateSlot = intent.slots["birthDate"].value;

    if (!utils.checkDniNumber(dniNumberSlot)) {
      const speechText = 'El dni que me has dado no parece ser valido. Por favor, dime un DNI valido';
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .addElicitSlotDirective('dniNumber')
        .getResponse();
    }

    if (!utils.checkBirthDay(birthDateSlot)) {
      const speechText = 'La fecha de nacimiento que me has dado no parece ser valida. Por favor, dime cuando naciste';
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .addElicitSlotDirective('birthDate')
        .getResponse();
    }

    attributes.dniNumber = dniNumberSlot.toUpperCase();
    attributes.birthDate = birthDateSlot;

    attributesManager.setPersistentAttributes(attributes);
    await attributesManager.savePersistentAttributes();

    const speechText = 'Has registrado tus datos correctamente. Ahora puedes saber el estado de tu carnet diciendo "consulta el estado de mi carnet"'
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(SKILL_TITLE, speechText)
      .getResponse();
  }
}

const StatusQueryIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'StatusQueryIntent';
  },

  handle(handlerInput) {
    const speechText = '';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(SKILL_TITLE, speechText)
      .getResponse();
  }
}

const ClearUserDataIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "ClearUserDataIntent";
  },

  handle(handlerInput) {
    const speechText = '';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(SKILL_TITLE, speechText)
      .getResponse();
  }
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },

  handle(handlerInput) {
    const speechText = 'Bienvenido a Estado de Carnet DGT, dime "comprueba el estado de mi carnet" o si prefieres, pídeme ayuda';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(SKILL_TITLE, speechText)
      .getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = `
    Esta skill te permite consultar el estado de tu carnet de conducir definitivo.
    Para consultar el estado de tu carnet, necesitamos tu DNI y tu fecha de nacimiento.
    Esos datos se guardan en nuestra base de datos para las próximas veces que lo consultes.
    Y obviamente, se envían a la pagina web de la DGT que es la que nos da el estado de tu carnet.
    Una vez estés registrado, puedes consultar el estado de tu carnet diciendo "consulta el estado".
    Para registrar tus datos di "registra mis datos".
    Para eliminar tus datos di "elimina mis datos".
    Gracias por usar esta skill.
    `;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(SKILL_TITLE, speechText)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = '¡Hasta luego!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(SKILL_TITLE, speechText)
      .withShouldEndSession(true)
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    //any cleanup logic goes here
    console.log(`Session ended: ${handlerInput}`);
    return handlerInput.responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);

    const speechText = 'Ha ocurrido un error, por favor inténtalo otra vez';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

function getPersistenceAdapter(tableName) {
  return new ddbAdapter.DynamoDbPersistenceAdapter({
    tableName: tableName,
    createTable: true,
  });
}

let skill;

exports.handler = async function (event, context) {
  console.log(`SKILL REQUEST ${JSON.stringify(event)}`);

  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .withPersistenceAdapter(
        getPersistenceAdapter('alexa-dgtstatus'))
      .addRequestHandlers(
        LaunchRequestHandler,
        StatusQueryIntentHandler,
        ClearUserDataIntentHandler,
        RegisterUserDataIntentHandler,

        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler)
      .addErrorHandlers(ErrorHandler)
      .create();
  }

  const response = await skill.invoke(event, context);
  console.log(`SKILL RESPONSE ${JSON.stringify(response)}`);

  return response;
};