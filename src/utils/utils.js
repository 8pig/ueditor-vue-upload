export function throttle (fn, wait) {
  let time = 0; let timer = null;
  return function () {
    let now = Date.now();
    let args = arguments;
    if(now - time > wait) {
      fn.apply(this, args);
      time = now;
    }else{
      timer && clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, args);
        time = now;
      }, wait);
    }
  };
}
