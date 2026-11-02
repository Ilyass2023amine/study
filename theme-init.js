(function () {
  try {
    var root = document.documentElement;
    var theme = window.localStorage.getItem('studyverse.theme');
    if (theme !== 'light' && theme !== 'dark') {
      theme = 'dark';
    }
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;

    var language = window.localStorage.getItem('studyverse.language');
    var isArabic = language === 'ar' || language === 'dar';
    root.lang = language === 'dar' ? 'ary' : language === 'ar' ? 'ar' : 'fr';
    root.dir = isArabic ? 'rtl' : 'ltr';
  } catch (error) {
    /* Storage can be unavailable in hardened browsers; server-rendered defaults apply. */
  }
})();
