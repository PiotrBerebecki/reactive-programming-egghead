const requestStream = Rx.Observable.of('https://api.github.com/users');

// flatMap is now an alias for mergeMap
// but will work just the same.

const responseStream = requestStream
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

function createSuggestionStream(responseStream) {
  return responseStream.map(userList => {
    return userList[Math.floor(Math.random() * userList.length)];
  });
}

function renderSuggestion(user, selector) {
  const parentDOM = document.querySelector(selector);

  const usernameDOM = parentDOM.querySelector('.username');
  usernameDOM.textContent = user.login;
  usernameDOM.href = user.html_url;

  const avatarDOM = parentDOM.querySelector('img');
  avatarDOM.src = user.avatar_url;
}
