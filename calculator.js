document.addEventListener('DOMContentLoaded', function() {
    const display = document.querySelector('.output');
    let currentInput = '0';
    let operator = '';
    let firstOperand = null;
    let waitingForSecondOperand = false;

    function updateDisplay() {
        display.innerText = formatNumber(currentInput);
        resizeFont();
    }

    function handleNumberClick(number) {
        if (waitingForSecondOperand) {
            currentInput = number;
            waitingForSecondOperand = false;
            removeOperatorHighlight();
        } else {
            if (currentInput.length < 12) { // Limit to 12 characters including '-'
                currentInput === '0' ? currentInput = number : currentInput += number;
            }
        }
        updateDisplay();
    }

    function handleOperatorClick(op) {
        const inputNumber = parseFloat(currentInput.replace(/,/g, ''));
        if (firstOperand === null) {
            firstOperand = inputNumber;
        } else if (operator) {
            const result = calculate(firstOperand, inputNumber, operator);
            currentInput = String(result);
            firstOperand = result;
        }
        operator = op;
        waitingForSecondOperand = true;
        updateDisplay();
        highlightOperator(op);
    }

    function calculate(first, second, op) {
        switch (op) {
            case '+': return first + second;
            case '-': return first - second;
            case 'x': return first * second;
            case '÷': return first / second;
            default: return second;
        }
    }

    function resizeFont() {
        if (currentInput.length >= 6) {
            display.style.fontSize = '30px';
        } else {
            display.style.fontSize = '90px';
        }
    }

    function formatNumber(number) {
        return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    function highlightOperator(op) {
        document.querySelectorAll('button.operator').forEach(button => {
            if (button.innerText === op) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });
    }

    function removeOperatorHighlight() {
        document.querySelectorAll('button.operator').forEach(button => {
            button.classList.remove('selected');
        });
    }

    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            const value = button.innerText;

            // Flash button color
            button.classList.add('flash');
            // setTimeout(() => button.classList.remove('flash'), 300); // 0.5s duration

            if (!isNaN(value)) {
                handleNumberClick(value);
            } else if (value === 'C') {
                currentInput = '0';
                operator = '';
                firstOperand = null;
                waitingForSecondOperand = false;
                updateDisplay();
                removeOperatorHighlight();
            } else if (value === '+/-') {
                currentInput = String(parseFloat(currentInput) * -1);
                updateDisplay();
            } else if (value === '%') {
                currentInput = String(parseFloat(currentInput) / 100);
                updateDisplay();
            } else if (value === '.') {
                if (!currentInput.includes('.')) {
                    currentInput += '.';
                    updateDisplay();
                }
            } else if (value === '=') {
                handleOperatorClick(value);
                removeOperatorHighlight();
            } else {
                handleOperatorClick(value);
            }
        });
    });

    updateDisplay(); // Initial call to update the display and adjust font size
});
