/* Ensure JS code only runs after entire HRML document loaded */
document.addEventListener('DOMContentLoaded', function() {
    /* Variable declaration */
    const display = document.querySelector('.output');  // Selects the HTML element that displays output 
    let currentInput = '0'; 
    let operator = ''; 
    let firstOperand = null; 
    let justCalculated = false;
    let waitingForSecondOperand = false;  // flag to see if waiting for user to enter second number 

    function roundLastDigit(formattedNumber) {
        // Remove commas and convert to a number
        let digits = parseFloat(formattedNumber.replace(/,/g, ''));
        
        // Convert the number to a string in scientific notation to handle significant digits
        let digitsStr = digits.toPrecision(9);
        
        // Convert back to a number to remove any trailing zeros
        digits = parseFloat(digitsStr);
        
        // Convert the number back to a string
        digitsStr = digits.toString();
        
        // Format the number with commas if it's an integer
        if (digits >= 1) {
            let parts = digitsStr.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            formattedNumber = parts.join('.');
        } else {
            formattedNumber = digitsStr;
        }
        
        return formattedNumber;
    }

    /* calculate computes the arithmetic operations of the calculator*/ 
    function calculate(first, second, op) {
        let result;
        switch(op) {
            case '+': result = first + second; break;
            case '-': result = first - second; break;
            case 'x': result = first * second; break;
            case '÷': result = first / second; break;
        }
        return String(result);
    }

    /* formatNumber adds commas to the displayed output*/
    function formatNumber(number) {
        if (number[0] == '.') {
            number = '0' + number;
        }

        if (number === 'undefined' || number === 'Infinity' || number === '0'){
            return number;
        }
        let negative = false;  // flag to prevent adding comma after negative sign
        if (number[0] === '-') {
            number = number.slice(1);
            negative = true;
        }
        let parts = number.toString().split('.');
        let integerPart = parts[0]; 
        let decimalPart = parts[1]; 
    
        let formattedInteger = ''; 
        for (let i = integerPart.length - 1, count = 1; i >= 0; i--, count++) {
            formattedInteger = integerPart[i] + formattedInteger; 
            if (count % 3 === 0 && i != 0) {   // adds a comma every 3 digits excluding the front of the number
                formattedInteger = ',' + formattedInteger; 
            }
        }
        let formattedNumber = formattedInteger;
        if (decimalPart !== undefined) {
            formattedNumber += '.' + decimalPart;
        } else if (number.includes('.')) {
            formattedNumber += '.';
        }
        if (negative) {
            formattedNumber = '-' + formattedNumber;
        }
        let num = parseFloat(formattedNumber.replace(/,/g, ''));
        if (Math.abs(num) >= 1e9) {  // too large of a number, convert to exponential notation
            let expNotation = num.toExponential(5); 
            formattedNumber = expNotation.replace('+', ''); // Remove the + sign in exponential notation
        } else if (number.replace(',', '').replace('.', '').length > 9){
            formattedNumber = roundLastDigit(formattedNumber);
        }
        return formattedNumber;
    }


    /* removeOperatorHighlight removes highlight from all operator buttons */
    function removeOperatorHighlight() {
        document.querySelectorAll('button').forEach(button => {
            if (['+', '-', 'x', '÷'].includes(button.innerText)) {
                setTimeout(() => button.classList.remove('flash-operator-dark'), 200);
                setTimeout(() => button.classList.remove('flash-operator-light'), 200);
            }
        })
    }


    /* resize adjusts the font size of the display based on the length of the current input */
    function resizeFont() {
        let rawLength = currentInput.replace('.', '');
        if (rawLength.length <= 6) { 
            display.style.fontSize = '84px';
        } else if (rawLength.length === 7) {
            display.style.fontSize = '68px';
        } else if (rawLength.length === 8 ) {
            display.style.fontSize = '60px';
        } else {
            display.style.fontSize = '54px'
        }
    }


    /* updateDisplay formats and displays the current input with scaled font size*/
    function updateDisplay() {
        resizeFont();
        display.innerText = formatNumber(currentInput); 
    }


    /* handleNumberClick is called anytime a user presses a number*/ 
    function handleNumberClick(number) {
        if (waitingForSecondOperand) {
            currentInput = number;
            waitingForSecondOperand = false; 
            removeOperatorHighlight();
        } else {
            if (currentInput.replace(',', '').replace('.', '').length < 9) { // Limit to 9 characters including '-' for negative numbers
                if (number === '.') {
                    if (!currentInput.includes('.')) { // Only add decimal if it doesn't already exist
                        currentInput += ".";
                    }
                } else {
                    if (justCalculated) {   // Fresh after a calculation, if enter a number, clear the current input
                        currentInput = number;
                    } else {
                        currentInput === '0' ? currentInput = number : currentInput += number;  // Note: string concatenation not addition

                    }
                }
            }
        }
        updateDisplay(); 
        justCalculated = false;
    }
    


    /* handleOperatorClick updates variables and flags when a user presses an operator*/
    function handleOperatorClick(op){
        justCalculated = false;
        const inputNumber = parseFloat(currentInput.replace(/,/g, ''));  // remove all commas from the string
        if (firstOperand === null) {
            firstOperand = inputNumber; 
        } else if (operator && !waitingForSecondOperand) {
            currentInput = calculate(firstOperand, inputNumber, operator);
            firstOperand = currentInput; 
        }
        removeOperatorHighlight;
        operator = op; 
        waitingForSecondOperand = true; 
        updateDisplay(); 
    }


    /* handEqualClick is specific to '=', stores output as first operand */
    function handleEqualClick() {
        const inputNumber = parseFloat(currentInput.replace(/,/g, ''));  // remove commas
        if (operator && firstOperand !== null) {
            currentInput = calculate(firstOperand, inputNumber, operator); 
            firstOperand = null;
            operator = '';
            waitingForSecondOperand = false;
        }
        removeOperatorHighlight(); 
        updateDisplay(); 
        justCalculated = true;
    }


    /* Add Event Listeners */
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            const value = button.innerText; 

            // Flash button color on non operators
            if (!['+', '-', 'x', '÷'].includes(value)) {
                button.classList.add('flash-light');
                setTimeout(() => button.classList.remove('flash-light'), 300); // 0.3s duration
            } else { // for operators, start with a flash, then change color to represent selction
                if (document.body.classList.contains('light-mode')) {
                    button.classList.add('flash-operator-light');
                } else {
                    button.classList.add('flash-operator-dark');
                }

                
                // remove highlight from any other operators that are potentially on
                document.querySelectorAll('button').forEach(button => {
                    if (['+', '-', 'x', '÷'].includes(button.innerText) && button.innerText !== value) {
                        setTimeout(() => button.classList.remove('flash-operator-light'), 200);
                        setTimeout(() => button.classList.remove('flash-operator-dark'), 200);
                    }
                })
            }
            if (!isNaN(value) || value === '.') {
                handleNumberClick(value);
            } else if (value === 'C') { 
                currentInput = '0'; 
                operator = ''; 
                firstOperand = null; 
                removeOperatorHighlight;
                waitingForSecondOperand = false; 
                updateDisplay(); 
                removeOperatorHighlight(); 
            } else if (value === '+/-') {
                currentInput = String(parseFloat(currentInput) * -1);
                updateDisplay();
            } else if (value === '%') {
                currentInput = String(parseFloat(currentInput / 100));
                updateDisplay(); 
            } else if (value === '=') {
                handleEqualClick();
            } else {
                handleOperatorClick(value);
            }
        })
    });
    updateDisplay();
});

    /* for switching to light/dark mode*/
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('colorToggle').addEventListener('change', function() {
        const output = document.getElementById('display');
        if (this.checked) {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
            output.classList.add('output-dark-font');
            document.querySelectorAll('.child').forEach(button => {
                const value = button.innerText;
                if (['+', '-', 'x', '÷', '='].includes(value)) {
                    button.classList.add('purple');
                    button.classList.remove('orange');
                } else if (['C', '+/-', '%'].includes(value)){
                    button.classList.add('periwinkle'); 
                    button.classList.remove('light-gray')
                } else {
                    button.classList.add('new-gray'); 
                    button.classList.remove('dark-gray');
                }
            });
        } else {
            document.body.classList.add('dark-mode'); 
            document.body.classList.remove('light-mode');
            output.classList.remove('output-dark-font');
            document.querySelectorAll('.child').forEach(button => {
                const value = button.innerText;
                if (['+', '-', 'x', '÷', '='].includes(value)) {
                    button.classList.add('orange');
                    button.classList.remove('purple');
                } else if (['C', '+/-', '%'].includes(value)){
                    button.classList.add('light-gray'); 
                    button.classList.remove('periwinkle')
                } else {
                    button.classList.add('dark-gray'); 
                    button.classList.remove('new-gray');
                }
            });
        } 
    });
});
