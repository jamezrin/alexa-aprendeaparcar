const Alexa = require('ask-sdk-core');
const provider = require('./provider');

const SKILL_TITLE = "Aprende a Aparcar";

/*
let x = {
  "name": "parkingType",
  "value": "linea",
  "resolutions": {
    "resolutionsPerAuthority": [
      {
        "authority": "amzn1.er-authority.echo-sdk.amzn1.ask.skill.9a8e5e22-0cb6-408b-b564-c1bd3efee111.ParkingType",
        "status": {
          "code": "ER_SUCCESS_MATCH"
        }, 
        "values": [
          {
            "value": {
              "name": "linea",
              "id": "linea"
            }
          }
        ]
      }]
  }, 
  "confirmationStatus": "NONE", 
  "source": "USER"
};
*/

function getSlotValueId(intentSlot) {
  const resolutions = intentSlot.resolutions.resolutionsPerAuthority;
  for (const resolution of resolutions) {
    if (resolution.status.code === "ER_SUCCESS_MATCH") {
      const firstIntentSlotValue = resolution.values[0].value;
      return firstIntentSlotValue.id;
    }
  }
}

const LearnIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "IntentRequest"
      && handlerInput.requestEnvelope.request.intent.name === "LearnIntent"
  },

  async handle(handlerInput) {
    const { requestEnvelope } = handlerInput;

    if (requestEnvelope.request.dialogState !== "COMPLETED") {
      return handlerInput.responseBuilder
        .addDelegateDirective()
        .getResponse();
    }

    const intent = handlerInput.requestEnvelope.request.intent;
    const parkingTypeSlot = intent.slots["parkingType"];
    const parkingTypeSlotValue = parkingTypeSlot.value;
    const parkingTypeSlotValueId = getSlotValueId(parkingTypeSlot);


    if (parkingTypeSlotValueId === 'diagonal') {

    } else if (parkingTypeSlotValueId === 'bateria') {
      
    } else if (parkingTypeSlotValueId === 'linea') {

    }

    const speechText = JSON.stringify(parkingTypeSlotValueId);

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withShouldEndSession(true)
      .getResponse();
  }
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Bienvenido a Aprender a Aparcar, con esta skill podrás aprender a aparcar utilizando referencias usadas por autoescuelas. ' +
      'Dime "enséñame a aparcar" o "enséñame a aparcar en línea" para empezar.';

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
    const speechText = '';

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

    const speechText = 'Lo siento, no puedo entender ese comando. Dímelo otra vez.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

let skill;

exports.handler = async function (event, context) {
  console.log(`SKILL REQUEST ${JSON.stringify(event)}`);

  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        LaunchRequestHandler,
        LearnIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
      )
      .addErrorHandlers(ErrorHandler)
      .create();
  }

  const response = await skill.invoke(event, context);
  console.log(`SKILL RESPONSE ${JSON.stringify(response)}`);

  return response;
};