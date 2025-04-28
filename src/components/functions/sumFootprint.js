

const sumFootprint = (first,second,third,fourth) => {
    let firstNumber = 0;
    let secondNumber = 0;
    let thirdNumber = 0;
    let fourthNumber = 0;
    if(first !== 'N/A'){
        firstNumber = first;
    }
    if(second !== 'N/A'){
        secondNumber = second;
    }
    if(third !== 'N/A'){
        thirdNumber = third;
    }
    if(fourth !== 'N/A'){
        fourthNumber = fourth;
    }
    return firstNumber + secondNumber + thirdNumber + fourthNumber;
}

export default sumFootprint;