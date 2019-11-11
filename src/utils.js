const moment = require('moment');

const restTable = [
    'T', 'R', 'W', 'A', 'G', 'M', 'Y', 'F', 'P', 'D', 'X', 'B',
    'N', 'J', 'Z', 'S', 'Q', 'V', 'H', 'L', 'C', 'K', 'E'
]

function checkDniNumber(dniNumber) {
    if (dniNumber.length !== 9) {
        return false;
    }

    const numberPart = dniNumber.substring(0, 8);
    const currentLetter = dniNumber.charAt(8).toUpperCase();
    const divisionRest = numberPart % 23;
    const expectedLetter = restTable[divisionRest];
    return currentLetter === expectedLetter;
}

function checkBirthDay(birthDay) {
    try {
        const birthDayMoment = moment(birthDay);
        
        if (!birthDayMoment.isValid()) {
            return false;
        }

        const currentMoment = moment();

        const yearsDiff = currentMoment.diff(
            birthDayMoment, 
            'years'
        );
        
        return yearsDiff >= 18;
    } catch (e) {
        return false;
    }
}

module.exports = { checkDniNumber, checkBirthDay }