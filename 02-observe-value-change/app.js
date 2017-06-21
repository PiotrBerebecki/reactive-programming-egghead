const streamA = Rx.Observable.of(2, 4);

const streamB = streamA.map(num => num * 10);

streamB.subscribe(num => console.log(num));
