'use strict';

const account1 = {
  owner: 'Alex Domas',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2,
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

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

const displayMovements = function (movements) {
  containerMovements.innerHTML = '';

  movements.forEach((movement, index) => {
    const type = movement > 0 ? 'deposit' : 'withdrawal';

    const html = `
          <div class="movements__row">
            <div class="movements__type movements__type--${type}">
              ${index + 1} ${type}
            </div>
            <div class="movements__value">${movement.toFixed(2)}€</div>
          </div>
  `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
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
  displayMovements(account.movements);
  calcDisplayBalance(account);
  calcDisplaySummary(account);
};

let currentAccount;

btnLogin.addEventListener('click', e => {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(acc => acc.login === inputLoginUsername.value);

  if (currentAccount?.pin === +inputLoginPin.value) {
    labelWelcome.textContent = `Welcome, ${
      currentAccount.owner.split(' ')[0]
    }!`;
    containerApp.style.opacity = 100;
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

  displayMovements(movs);
  sorted = !sorted;
});

btnDefault.addEventListener('click', e => {
  e.preventDefault();

  displayMovements(currentAccount.movements);
});
