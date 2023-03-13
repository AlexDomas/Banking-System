let currentAccount, timer;

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

const startLogOutTimer = () => {
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    time--;
  };

  let time = 300;

  tick();
  const timer = setInterval(tick, 1000);
  return timer;
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
    inputLoginPin.blur();

    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    updateUI(currentAccount);
  }
});
