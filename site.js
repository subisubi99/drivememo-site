// DriveMemo 사이트 공통 스크립트
// - 언어: 기본 한국어, 오른쪽 위 버튼으로 영어 전환 (브라우저에 기억, ?lang=en 으로도 지정)
// - 머리(메뉴)와 바닥글을 각 페이지에 넣음
// - 최신 버전·다운로드 주소·변경 내역은 DriveMemo-releases 저장소에서 읽어 옴
var DM = (function () {
  var REPO = 'https://github.com/subisubi99/DriveMemo-releases';
  var RAW = 'https://raw.githubusercontent.com/subisubi99/DriveMemo-releases/main/';
  var html = document.documentElement;

  function getLang() {
    var m = /[?&]lang=(ko|en)\b/.exec(location.search);
    if (m) return m[1];
    try { return localStorage.getItem('lang') || 'ko'; } catch (e) { return 'ko'; }
  }
  function setLang(l) {
    html.className = l === 'en' ? 'en' : '';
    html.lang = l;
    var t = html.getAttribute('data-title-' + l);
    if (t) document.title = t;
  }
  setLang(getLang());

  var pages = [
    ['index.html', '홈', 'Home'],
    ['download.html', '다운로드', 'Download'],
    ['help.html', '도움말', 'Help'],
    ['donate.html', '후원', 'Donate'],
    ['about.html', '개인정보·라이선스', 'Privacy & License']
  ];

  function t(ko, en) { return '<span class="ko">' + ko + '</span><span class="en">' + en + '</span>'; }

  function header(cur) {
    var nav = '';
    for (var i = 0; i < pages.length; i++) {
      var p = pages[i];
      nav += '<a href="' + p[0] + '"' + (p[0] === cur ? ' class="on"' : '') + '>' + t(p[1], p[2]) + '</a>';
    }
    document.currentScript.insertAdjacentHTML('beforebegin',
      '<div class="wrap">' +
        '<div class="top">' +
          '<a class="logo" href="index.html"><img src="favicon.ico" alt="">DriveMemo</a>' +
          '<button class="lang" type="button" onclick="DM.toggle()" aria-label="Language">' + t('English', '한국어') + '</button>' +
        '</div>' +
        '<nav>' + nav + '</nav>' +
      '</div>');
  }

  function footer() {
    document.currentScript.insertAdjacentHTML('beforebegin',
      '<div class="wrap">' +
        t('DriveMemo는 무료로 배포되는 개인 제작 프로그램입니다. Google Drive는 Google LLC의 상표이며 DriveMemo는 Google과 관련이 없습니다.',
          'DriveMemo is free software made by an individual developer. Google Drive is a trademark of Google LLC; DriveMemo is not affiliated with Google.') +
        '<br>© 2026 DriveMemo · <a href="about.html">' + t('개인정보·라이선스', 'Privacy & License') + '</a>' +
        ' · <a href="' + REPO + '">GitHub</a>' +
      '</div>');
  }

  function toggle() {
    var l = html.className === 'en' ? 'ko' : 'en';
    try { localStorage.setItem('lang', l); } catch (e) {}
    setLang(l);
  }

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // latest.txt 를 읽어 [data-ver] 글자, [data-zip] 링크, [data-sha] 값을 채움.
  // 못 읽으면 페이지에 적어 둔 값을 그대로 씀.
  function latest() {
    fetch(RAW + 'latest.txt', { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw 0;
      return r.text();
    }).then(function (txt) {
      var ver = (/^version=(.+)$/m.exec(txt) || [])[1];
      var sha = (/^sha256=(.+)$/m.exec(txt) || [])[1];
      if (!ver) return;
      ver = ver.trim();
      var i, els = document.querySelectorAll('[data-ver]');
      for (i = 0; i < els.length; i++) els[i].textContent = ver;
      els = document.querySelectorAll('[data-zip]');
      for (i = 0; i < els.length; i++) els[i].href = REPO + '/raw/main/DriveMemo-' + ver + '.zip';
      els = document.querySelectorAll('[data-zipname]');
      for (i = 0; i < els.length; i++) els[i].textContent = 'DriveMemo-' + ver + '.zip';
      if (sha) {
        els = document.querySelectorAll('[data-sha]');
        for (i = 0; i < els.length; i++) els[i].textContent = sha.trim();
      }
    })['catch'](function () {});
  }

  // CHANGELOG.md 의 '## 버전 (날짜)' 와 '- 항목' 만 옮겨 보여 줌
  function changelog(id) {
    var box = document.getElementById(id);
    fetch(RAW + 'CHANGELOG.md', { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw 0;
      return r.text();
    }).then(function (md) {
      var out = '', open = false, lines = md.split(/\r?\n/);
      for (var i = 0; i < lines.length; i++) {
        var s = lines[i];
        if (/^## /.test(s)) {
          if (open) out += '</ul>';
          out += '<h3>' + esc(s.slice(3)) + '</h3><ul>';
          open = true;
        } else if (/^- /.test(s) && open) {
          out += '<li>' + esc(s.slice(2)) + '</li>';
        }
      }
      if (open) out += '</ul>';
      if (out) box.innerHTML = out;
    })['catch'](function () {});
  }

  return { header: header, footer: footer, toggle: toggle, latest: latest, changelog: changelog };
})();
