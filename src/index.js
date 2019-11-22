const Alexa = require('ask-sdk-core');
const fs = require('fs');

const SKILL_TITLE = "Aprende a Aparcar";

function getSlotValueId(intentSlot) {
  const resolutions = intentSlot.resolutions.resolutionsPerAuthority;
  for (const resolution of resolutions) {
    if (resolution.status.code === "ER_SUCCESS_MATCH") {
      const firstIntentSlotValue = resolution.values[0].value;
      return firstIntentSlotValue.id;
    }
  }

  return null;
}

function getParkingTutorial(parkingTypeSlotValue, parkingTypeSlotValueId) {
  if (parkingTypeSlotValueId === 'diagonal') {
    return {
      images: ['https://www.dropbox.com/s/9fexqblmvo3vdvd/AF173_027-1.jpg?raw=1'],
      text: `Para aparcar en ${parkingTypeSlotValue} sigue estos pasos: ` +
        'Primero, pon el intermitente hacia el lado al que vayas a aparcar. Si, por ejemplo, aparcas hacia la derecha, en el momento que tu retrovisor derecho llegue a la altura de la esquina trasera izquierda del coche que quedará a tu derecha, será el momento de girar. ' +
        'Después, gira toda la dirección a la derecha y avanza observando por el retrovisor derecho que no rozas con el coche de al lado. Asimismo, vigila no rozar la esquina delantera izquierda de tu coche con el vehículo que quedará a tu izquierda. ' +
        'Para sacar el coche, da marcha atrás en línea recta y gira toda la dirección a la derecha cuando el eje trasero de tu coche llegue a la esquina trasera del vehículo que tienes a la derecha.'
    }
  } else if (parkingTypeSlotValueId === 'bateria') {
    return {
      images: ['https://www.dropbox.com/s/93f24uue84jea24/AF173_027-7.jpg?raw=1'],
      text: `Para aparcar en ${parkingTypeSlotValue} sigue estos pasos: ` +
        'Primero, si, por ejemplo, vas a aparcar hacia la derecha, pon el intermitente derecho. ' +
        'Después, coloca tu coche en perpendicular a los que están aparcados, a una distancia aproximada de un metro, y alineando el final de tu parachoques trasero con el vehículo que quedará a tu derecha una vez estaciones. ' +
        'Para ello, gira toda la dirección a la derecha y retrocede vigilando que el retrovisor derecho de tu coche no golpee al vehículo estacionado. ' +
        'Con la dirección girada a la derecha, continúa dando marcha atrás mirando el retrovisor izquierdo para asegurarte de que no choques con el automóvil que hay en la izquierda. ' +
        'Por último, si es necesario, efectúa una última maniobra para que quede totalmente paralelo a los otros coches.'
    }
  } else if (parkingTypeSlotValueId === 'linea') {
    return {
      images: ['https://www.dropbox.com/s/vjs1615x36j4bf2/AF173_026-4.jpg?raw=1'],
      text: `Para aparcar en ${parkingTypeSlotValue} sigue estos pasos: ` +
        'Primero, señaliza con el intermitente correspondiente el lado hacia el que vas a aparcar, por ejemplo, el derecho si vas a estacionar en la derecha- y sitúa el coche en paralelo al vehículo que está aparcado delante del hueco a una distancia aproximada de un metro y haciendo coincidir los espejos retrovisores. ' +
        'A continuación, comienza a dar marcha atrás en línea recta y, cuando por la ventanilla trasera derecha veas la esquina trasera izquierda del otro coche , detente. ' +
        'Otras referencias válidas son hasta que el eje trasero de tu vehículo esté a la altura de la esquina del otro automóvil, o hasta que el morro de tu vehículo coincida con el retrovisor del otro coche. ' +
        'Entonces, gira toda la dirección a la derecha y vuelve dar marcha atrás hasta que por tu retrovisor izquierdo veas el faro delantero derecho del coche de atrás o hasta que tu retrovisor derecho coincida con la parte final del vehículo precedente. Detente de nuevo. ' +
        'Ahora mismo, tu coche debería formar un ángulo de 45 grados con los que están estacionados. ' +
        'El siguiente paso es girar toda la dirección a la izquierda y dar marcha atrás para introducir el coche, pero vigila no colisionar con el vehículo de detrás. ' +
        'Por último, "cuádralo" para que quede más o menos a la misma distancia del coche de delante que del de detrás.'
    }
  }

  return null;
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

    const parkingTutorial = getParkingTutorial(
      parkingTypeSlotValue,
      parkingTypeSlotValueId
    );

    if (!parkingTutorial) {
      const speechText = 'Ese tipo de aparcamiento no está soportado';
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .withShouldEndSession(true)
        .getResponse();
    }

    const parkingTitle = `Aparcamiento en ${parkingTypeSlotValue}`;

    if (handlerInput.requestEnvelope.context.System.device.supportedInterfaces['Alexa.Presentation.APL']) {
      let myDocument = JSON.parse(fs.readFileSync('./apl/document.json', 'utf8'));
      let myDatasource = JSON.parse(fs.readFileSync('./apl/datasources.json', 'utf8'));

      myDatasource.bodyTemplate3Data.title = parkingTitle;
      myDatasource.bodyTemplate3Data.image.sources[0].url = parkingTutorial.images[0];
      myDatasource.bodyTemplate3Data.image.sources[1].url = parkingTutorial.images[0];
      myDatasource.bodyTemplate3Data.textContent.parkingExplanation.text = parkingTutorial.text;

      return handlerInput.responseBuilder
        .speak(parkingTutorial.text)
        .addDirective({
          type: 'Alexa.Presentation.APL.RenderDocument',
          version: '1.0',
          document: myDocument,
          datasources: myDatasource
        })
        .withShouldEndSession(true)
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak(parkingTutorial.text)
        .reprompt(parkingTutorial.text)
        .withSimpleCard(parkingTitle, parkingTutorial.text)
        .withShouldEndSession(true)
        .getResponse();
    }
  }
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Bienvenido a "Aprende a Aparcar", con esta skill podrás aprender a aparcar utilizando referencias usadas por autoescuelas. ' +
      'Puedes aparcar en linea, en batería o en oblicuo. Dime "enséñame a aparcar" o "enséñame a aparcar en línea" para empezar.';

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
    const speechText = 'Esta skill usa las imágenes y explicaciones de autofacil.es. ' +
      'Estas explicaciones son igual que las que usan los profesores de autoescuelas. ' +
      'Esperamos que aprendas mucho usando esta skill';

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