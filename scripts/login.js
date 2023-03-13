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
