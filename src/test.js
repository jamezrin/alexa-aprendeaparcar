const provider = require('./provider');
const utils = require('./utils');
const moment = require('moment');

provider.accessLastStatus({
    "numDni": "05975463V",
    "diaNac": 29,
    "mesNac": 10,
    "anoNac": 1999
}).then(status => {
    console.log(status)
});

provider.accessLastStatus({
    "numDni": "05975464H",
    "diaNac": 29,
    "mesNac": 10,
    "anoNac": 1999
}).then(status => {
    console.log(status)
});

provider.accessLastStatus({
    "numDni": "04",
    "diaNac": 29,
    "mesNac": 10,
    "anoNac": 1999
}).then(status => {
    console.log(status)
});

provider.accessLastStatus({
    "numDni": "05975464H",
    "diaNac": 29,
    "mesNac": 23,
    "anoNac": 1999
}).then(status => {
    console.log(status)
});

const currentMoment = moment();
const birthdayMoment = moment("1999-10-29");

console.log(currentMoment.diff(birthdayMoment, 'years'));

console.log(utils.checkDniNumber('05975463V'));

console.log(utils.checkBirthDay('1999-10-29'))