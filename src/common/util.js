const urlExp = url => {
  let expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi,
      regex = new RegExp(expression);
  return regex.test(url);
};

const curry = fn => {
  const arity = fn.length;

  return (function resolver () {
    let memory = Array.prototype.slice.call(arguments)
    return function () {
      let local = memory.slice()
      Array.prototype.push.apply(local, arguments)
      let next = local.length >= arity ? fn : resolver
      return next.apply(null, local)
    }
  })()
}

const urlify = text => {
    let urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    return text.replace(urlRegex, url => {
        return '<a href="' + url + '" target="_blank">' + url + '</a>';
    })
}

const yyyymm = v => {
  // getMonth() is zero-based
  let mm = v.getMonth() + 1,
      dd = v.getDate();

  return [ v.getFullYear(), (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd ].join('');
}

/*
  @params1 deviceHeight 디바이스 높이 {Number}
  @params2 context 컨텐츠 총 높이 {DOM Object}
*/
const isCurrentView = (deviceHeight, context) => {
  let currentTop1 = document.querySelector('html'), // pc
      currentTop2 = document.querySelector('body'), // mobile
      contHeight = context.scrollHeight;

  // 스크롤 위치가 하단 뷰 즉 내가 하단에서 채팅을 하고 있을때
  if ((currentTop2.scrollTop || currentTop1.scrollTop) + deviceHeight >= contHeight - deviceHeight) {
    return true
  } else {
    return false
  }
}


export { urlExp, curry, yyyymm, urlify, isCurrentView }

