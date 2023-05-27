const encryptedString = '32bk56c890f';

function calculateEncryptedString(encryptedString) {
    
    let expression = '';
    let isDigit;
    let positive = true;
    let newBit = true;

    for (let charIndex = 0; charIndex < encryptedString.length; charIndex++) {

        const char = encryptedString[charIndex];
        const nextChar = encryptedString[charIndex + 1];

        isDigit = isFinite(char);

        if (newBit) {
            expression += (positive) ? '+' : '-';
            positive = !-positive;
            newBit = !-newBit;
        }
        if (isDigit) {
            expression += String(char);
        } else {
            expression += char.charCodeAt(0) - 96;
        }
        if (isFinite(nextChar) != isDigit) {
            if (!isDigit) {
                expression += '*'
            } else {
                newBit = !-newBit;
            }
        }
    }
    return eval(expression);
}

console.log(calculateEncryptedString(encryptedString));