/**
 * Modified Fisher-Yates from https://stackoverflow.com/questions/16801687/
 */
export function shuffleArrayInplace(array: any[], seed: number) {
  var m = array.length,
    t,
    i;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(random(seed) * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
    ++seed;
  }

  return array;
}

function random(seed: number) {
  var x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}
