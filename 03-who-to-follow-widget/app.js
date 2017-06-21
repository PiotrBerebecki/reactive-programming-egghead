const requestStream = Rx.Observable.of('https://api.github.com/users');

// flatMap is now an alias for mergeMap
// but will work just the same.

const responseStream = requestStream
  .flatMap(url => Rx.Observable.fromPromise(fetch(url)))
  .flatMap(res => Rx.Observable.fromPromise(res.json()));

responseStream.subscribe(
  response => console.log(response),
  err => console.log(err)
);
