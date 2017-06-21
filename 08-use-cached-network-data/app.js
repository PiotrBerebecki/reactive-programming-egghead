const refreshBtnDOM = document.querySelector('.refresh');
const closeBtnDOM1 = document.querySelector('.close1');
const closeBtnDOM2 = document.querySelector('.close2');
const closeBtnDOM3 = document.querySelector('.close3');

const refreshClickStream = Rx.Observable.fromEvent(refreshBtnDOM, 'click');
const close1Clicks = Rx.Observable.fromEvent(closeBtnDOM1, 'click');
const close2Clicks = Rx.Observable.fromEvent(closeBtnDOM2, 'click');
const close3Clicks = Rx.Observable.fromEvent(closeBtnDOM3, 'click');

const requestOnRefreshStream = refreshClickStream.map(ev => {
  return 'https://api.github.com/users';
});

const startupRequestStream = Rx.Observable.of('https://api.github.com/users');

const requestStream = startupRequestStream.merge(requestOnRefreshStream);

const responseStream = requestStream
  .delay(500) // added for debugging
  .debounceTime(500)
  .flatMap(url => {
    console.log('do network request');
    return Rx.Observable.fromPromise(fetch(url));
  })
  .flatMap(res => Rx.Observable.fromPromise(res.json()))
  .publishReplay(1)
  .refCount(1);

const suggestion1Stream = createSuggestionStream(responseStream, close1Clicks);
const suggestion2Stream = createSuggestionStream(responseStream, close2Clicks);
const suggestion3Stream = createSuggestionStream(responseStream, close3Clicks);

suggestion1Stream.subscribe(user => {
  renderSuggestion(user, '.suggestion1');
});

suggestion2Stream.subscribe(user => {
  renderSuggestion(user, '.suggestion2');
});

suggestion3Stream.subscribe(user => {
  renderSuggestion(user, '.suggestion3');
});

// refreshClickStream: -------f------------->  // f is refresh event
// requestStream:      r------r------------->
// responseStream:     ---R-------R--------->  // R is userList
// closeClickStream:   ---------------x----->
// suggestion1Stream:  N--u---N---u---u----->

function createSuggestionStream(responseStream, closeClickStream) {
  return responseStream
    .map(getRandomUser)
    .startWith(null)
    .merge(refreshClickStream.map(ev => null))
    .merge(
      closeClickStream.withLatestFrom(responseStream, (ev, userList) =>
        getRandomUser(userList)
      )
    );
}

function getRandomUser(userList) {
  return userList[Math.floor(Math.random() * userList.length)];
}

function renderSuggestion(user, selector) {
  const parentDOM = document.querySelector(selector);
  if (user === null) {
    parentDOM.style.visibility = 'hidden';
    return;
  }
  parentDOM.style.visibility = 'visible';

  const usernameDOM = parentDOM.querySelector('.username');
  usernameDOM.textContent = user.login;
  usernameDOM.href = user.html_url;

  const avatarDOM = parentDOM.querySelector('img');
  avatarDOM.src = user.avatar_url;
}
