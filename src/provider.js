const request = require('request-promise');
const cheerio = require('cheerio');

const USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.87 Safari/537.36";

function makeInitialRequest() {
    return request({
        url: "https://sedeapl.dgt.gob.es/WEB_EST_PERSEO/",
        resolveWithFullResponse: true,
        method: "GET",
        headers: {
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7,cs;q=0.6",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Host": "sedeapl.dgt.gob.es",
            "Pragma": "no-cache",
            "Referer": "https://sede.dgt.gob.es/es/aplicaciones/servicio-de-conductores-sin-certificado.shtml",
            "Sec-Fetch-Mode": "nested-navigate",
            "Sec-Fetch-Site": "same-site",
            "Upgrade-Insecure-Requests": 1
        }
    });
}

function makeResultRequest(jsfState, userData) {
    return request({
        url: "https://sedeapl.dgt.gob.es/WEB_EST_PERSEO/resultado.faces",
        method: "POST",
        form: {
            "form1": "form1",
            "form1:doi": userData["numDni"],
            "form1:diaNacimiento": userData["diaNac"],
            "form1:mesNacimiento": userData["mesNac"],
            "form1:anoNacimiento": userData["anoNac"],
            [jsfState.viewState]: "Buscar",
            "javax.faces.ViewState": jsfState.viewStateMarker,
        },
        headers: {
            "User-Agent": USER_AGENT,
            "Cookie": `JSESSIONID=${jsfState.jSessionId}`,
            "Pragma": "no-cache",
            "Referer": "https://sedeapl.dgt.gob.es/WEB_EST_PERSEO/busqueda.faces",
            "Origin": "https://sedeapl.dgt.gob.es",
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept-Language": "es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7,cs;q=0.6",
            "Sec-Fetch-Mode": "nested-navigate",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-User": "?1",
        },
    });
}

function extractSessionId(response) {
    const cookies = response.headers["set-cookie"];

    for (var i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const firstPair = cookie.split(";");
        const secondPair = firstPair[0].split("=");
        if (secondPair[0] === "JSESSIONID") {
            return secondPair[1];
        }
    }
}

async function accessFirstRequest() {
    const firstResponse = await makeInitialRequest();
    
    const $ = cheerio.load(firstResponse.body);
    const viewStateMarker = $("#javax\\.faces\\.ViewState").val();
    const viewState = $("input[value=\"Buscar\"]").first().attr('name');
    const jSessionId = extractSessionId(firstResponse);

    return {
        viewStateMarker,
        viewState,
        jSessionId
    };
}

async function accessResultRequest(jsfState, userData) {
    const resultBody = await makeResultRequest(jsfState, userData);
    const $ = cheerio.load(resultBody);
    return $(".tablaResultado tbody tr td").text().trim();
}

async function accessLastStatus(userData) {
    const jsfState = await accessFirstRequest();
    const lastStatus = await accessResultRequest(jsfState, userData);
    return lastStatus;
}

module.exports = { accessLastStatus }
