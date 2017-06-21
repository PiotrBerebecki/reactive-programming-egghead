const refreshBtnDOM = document.querySelector('.refresh');
const refreshClickStream = Rx.Observable.fromEvent(refreshBtnDOM, 'click');

const requestOnRefreshStream = refreshClickStream.map(ev => {
  return 'https://api.github.com/users';
});

const startupRequestStream = Rx.Observable.of('https://api.github.com/users');

const responseStream = startupRequestStream
  .merge(requestOnRefreshStream)
  .delay(500) // added for debugging
  .flatMap(url => Rx.Observable.fromPromise(fetch(url)))
  .flatMap(res => Rx.Observable.fromPromise(res.json()));

const suggestion1Stream = createSuggestionStream(responseStream);
const suggestion2Stream = createSuggestionStream(responseStream);
const suggestion3Stream = createSuggestionStream(responseStream);

suggestion1Stream.subscribe(user => {
  renderSuggestion(user, '.suggestion1');
});

suggestion2Stream.subscribe(user => {
  renderSuggestion(user, '.suggestion2');
});

suggestion3Stream.subscribe(user => {
  renderSuggestion(user, '.suggestion3');
});

// ----u-------------u-->
//     startWith(N)
// N---u---------------->
// N---u---N----N------->
//       merge
// N---u---N----N----u-->

function createSuggestionStream(responseStream) {
  return responseStream
    .map(userList => {
      return userList[Math.floor(Math.random() * userList.length)];
    })
    .startWith(null)
    .merge(refreshClickStream.map(ev => null));
}

function renderSuggestion(user, selector) {
  const parentDOM = document.querySelector(selector);
  if (user === null) {
    // console.log(null);
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
