'use strict';

const account1 = {
  owner: 'Alex Domas',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2023-11-18T21:31:17.178Z',
    '2023-12-23T07:42:02.383Z',
    '2023-01-28T09:15:04.904Z',
    '2023-04-01T10:17:24.185Z',
    '2023-05-08T14:11:59.604Z',
    '2023-03-09T17:01:17.194Z',
    '2023-03-12T23:36:17.929Z',
    '2023-03-13T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'en-US', // de-DE
};

const account2 = {
  owner: 'Drake Bell',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2023-11-01T13:15:33.035Z',
    '2023-11-30T09:48:16.867Z',
    '2023-12-25T06:04:23.907Z',
    '2023-01-25T14:18:46.235Z',
    '2023-02-05T16:33:06.386Z',
    '2023-04-10T14:43:26.374Z',
    '2023-06-25T18:49:59.371Z',
    '2023-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'pt-PT',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');
const btnDefault = document.querySelector('.btn--default-movement');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

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

const createLogin = accounts => {
  accounts.forEach(account => {
    account.login = account.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createLogin(accounts);

const updateUI = function (account) {
  displayMovements(account);
  calcDisplayBalance(account);
  calcDisplaySummary(account);
};

let currentAccount;

const createCurrentDateAndTime = account => {
  const now = new Date();
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  };
  labelDate.textContent = new Intl.DateTimeFormat(
    account.locale,
    options
  ).format(now);
};

btnLogin.addEventListener('click', e => {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(acc => acc.login === inputLoginUsername.value);

  if (currentAccount?.pin === +inputLoginPin.value) {
    labelWelcome.textContent = `Welcome, ${
      currentAccount.owner.split(' ')[0]
    }!`;
    containerApp.style.opacity = 100;

    createCurrentDateAndTime(currentAccount);

    inputLoginUsername.value = inputLoginPin.value = '';
    inputCloseUsername.value = inputClosePin.value = '';
    inputTransferAmount.value = '';
    inputLoanAmount.value = '';
    inputLoginPin.blur();
    updateUI(currentAccount);
  }
});

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
