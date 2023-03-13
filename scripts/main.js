'use strict';

const formatMovementDate = (date, locale) => {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const generateHTMLWithMovements = (account, movs) => {
  containerMovements.innerHTML = '';

  movs.forEach((movement, index) => {
    const type = movement > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(account.movementsDates[index]);
    const displayDate = formatMovementDate(date, account.locale);

    const html = `
          <div class="movements__row">
            <div class="movements__type movements__type--${type}">
              ${index + 1} ${type}
            </div>
            <div class="movements__date">${displayDate}</div>
            <div class="movements__value">${movement.toFixed(2)}€</div>
          </div>
  `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const displayMovements = account => {
  containerMovements.innerHTML = '';

  generateHTMLWithMovements(account, account.movements);
};

const calcDisplayBalance = account => {
  account.balance = account.movements.reduce(
    (acc, movement) => acc + movement,
    0
  );
  labelBalance.textContent = `${account.balance.toFixed(2)} €`;
};

const calcDisplaySummary = account => {
  const valueIn = account.movements
    .filter(movement => movement > 0)
    .reduce((acc, movement) => acc + movement, 0);

  const valueOut = account.movements
    .filter(movement => movement < 0)
    .reduce((acc, movement) => acc + movement, 0);

  const interest = account.movements
    .filter(movement => movement > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(interest => {
      return interest >= 1;
    })
    .reduce((acc, interest) => acc + interest, 0);

  labelSumIn.textContent = `${valueIn.toFixed(2)} €`;
  labelSumOut.textContent = `${Math.abs(valueOut).toFixed(2)} €`;
  labelSumInterest.textContent = `${interest.toFixed(2)} €`;
};

const updateUI = function (account) {
  displayMovements(account);
  calcDisplayBalance(account);
  calcDisplaySummary(account);
};

btnTransfer.addEventListener('click', e => {
  e.preventDefault();

  const amount = +inputTransferAmount.value;

  const receiverAcc = accounts.find(acc => acc.login === inputTransferTo.value);

  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.login !== currentAccount.login
  ) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', e => {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount.movements.some(movement => movement >= amount * 0.1)
  ) {
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', e => {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.login &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const accountIndex = accounts.findIndex(
      account => account.login === currentAccount.login
    );

    accounts.splice(accountIndex, 1);

    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
  labelWelcome.textContent = 'Log in to get started';
});

let sorted = false;

btnSort.addEventListener('click', e => {
  e.preventDefault();

  let movs = [];

  if (sorted) {
    movs = currentAccount.movements.slice().sort((a, b) => a - b);
    btnSort.textContent = 'SORT ';
    btnSort.textContent += '↑';
  } else {
    movs = currentAccount.movements.slice().sort((a, b) => b - a);
    btnSort.textContent = 'SORT ';
    btnSort.textContent += '↓';
  }

  generateHTMLWithMovements(currentAccount, movs);

  sorted = !sorted;
});

btnDefault.addEventListener('click', e => {
  e.preventDefault();

  displayMovements(currentAccount);
});
