var element = document.documentElement,
  body = document.body,
  scrollTop = 'scrollTop',
  scrollHeight = 'scrollHeight',
  progress = document.querySelector('.progress-bar'),
  scroll;

document.addEventListener('scroll', function() {
  scroll = (element[scrollTop]||body[scrollTop]) / ((element[scrollHeight]||body[scrollHeight]) - element.clientHeight) * 100;
  progress.style.setProperty('--scroll', scroll + '%');
});