// Theme toggle: follows the system until the visitor picks a theme.
(function () {
  var root = document.documentElement;
  var button = document.getElementById('themeToggle');

  function current() {
    return root.dataset.theme ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  function label() {
    button.textContent = current() === 'dark' ? 'Light' : 'Dark';
    button.setAttribute('aria-label', 'Switch to ' + button.textContent.toLowerCase() + ' theme');
  }

  button.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    label();
  });
  label();
})();

// SignalR routing demo: recreates the routing rules from the SignalRApp repo.
(function () {
  var connections = [
    { id: 'c1', user: 'Ahmad', browser: 'Chrome', group: 'Developers, DevOps' },
    { id: 'c2', user: 'Ahmad', browser: 'Edge', group: 'Developers, DevOps' },
    { id: 'c3', user: 'Maen', browser: 'Firefox', group: 'Quality' },
    { id: 'c4', user: 'Mostafa', browser: 'Chrome', group: 'Developers' }
  ];

  var routes = [
    { name: 'All', code: 'Clients.All', hits: ['c1', 'c2', 'c3', 'c4'],
      why: 'Every open connection receives it, including the sender.' },
    { name: 'Caller', code: 'Clients.Caller', hits: ['c1'],
      why: 'Only the socket that called the hub. Ahmad’s Edge tab gets nothing.' },
    { name: 'Others', code: 'Clients.Others', hits: ['c2', 'c3', 'c4'],
      why: 'Everyone except the calling socket, so Ahmad’s other browser still receives it.' },
    { name: 'Client', code: 'Clients.Client(edgeId)', hits: ['c2'],
      why: 'One specific socket, chosen by its ConnectionId.' },
    { name: 'Clients', code: 'Clients.Clients(edgeId, maenId)', hits: ['c2', 'c3'],
      why: 'A chosen list of sockets, by ConnectionId.' },
    { name: 'User', code: 'Clients.User("ahmad")', hits: ['c1', 'c2'],
      why: 'Every socket that belongs to one user. A user is not a connection.' },
    { name: 'Users', code: 'Clients.Users("ahmad", "maen")', hits: ['c1', 'c2', 'c3'],
      why: 'Every socket for each listed user.' },
    { name: 'Group', code: 'Clients.Group("Developers Team")', hits: ['c1', 'c2', 'c4'],
      why: 'Every socket joined to the group, across users.' },
    { name: 'Groups', code: 'Clients.Groups("Quality Team", "DevOps Team")', hits: ['c1', 'c2', 'c3'],
      why: 'Every socket joined to any of the listed groups.' },
    { name: 'GroupExcept', code: 'Clients.GroupExcept("Developers Team", edgeId)', hits: ['c1', 'c4'],
      why: 'The group, minus the sockets you exclude.' }
  ];

  var controls = document.getElementById('demoControls');
  var list = document.getElementById('demoConns');
  var codeEl = document.getElementById('demoCode');
  var result = document.getElementById('demoResult');
  if (!controls || !list) return;

  var rows = {};
  connections.forEach(function (c) {
    var li = document.createElement('li');
    li.className = 'conn';
    li.innerHTML =
      '<span class="conn__wire" aria-hidden="true"><span class="packet"></span></span>' +
      '<div class="conn__card">' +
        '<span class="conn__who"><b>' + c.user + '</b> on ' + c.browser + (c.id === 'c1' ? ' (caller)' : '') + '</span>' +
        '<span class="conn__tag">' + c.group + '</span>' +
      '</div>';
    list.appendChild(li);
    rows[c.id] = li;
  });

  var buttons = routes.map(function (route) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = route.name;
    b.addEventListener('click', function () { select(route, b, true); });
    controls.appendChild(b);
    return b;
  });

  function select(route, button, animate) {
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
    codeEl.textContent = route.code;

    connections.forEach(function (c) {
      var row = rows[c.id];
      var hit = route.hits.indexOf(c.id) !== -1;
      row.classList.toggle('is-hit', hit);
      row.classList.remove('is-sending');
      if (hit && animate) {
        void row.offsetWidth; // restart the packet animation
        row.classList.add('is-sending');
      }
    });

    result.innerHTML = '<b>' + route.hits.length + ' of ' + connections.length +
      ' connections receive it.</b> ' + route.why;
  }

  var initial = routes.findIndex(function (r) { return r.name === 'User'; });
  select(routes[initial], buttons[initial], false);
})();

// Fade sections in on scroll. Measures positions directly and also polls,
// so content can never stay hidden if a scroll event or frame is missed.
(function () {
  var pending = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  function check() {
    var limit = window.innerHeight * 0.96;
    pending = pending.filter(function (el) {
      if (el.getBoundingClientRect().top < limit) {
        el.classList.add('is-in');
        return false;
      }
      return true;
    });
    if (!pending.length) {
      clearInterval(timer);
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    }
  }

  var timer = setInterval(check, 300);
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check);
  check();
})();

// Soft light on cards that follows the pointer.
document.addEventListener('pointermove', function (event) {
  var card = event.target.closest && event.target.closest('.card');
  if (!card) return;
  var box = card.getBoundingClientRect();
  card.style.setProperty('--x', (event.clientX - box.left) + 'px');
  card.style.setProperty('--y', (event.clientY - box.top) + 'px');
});
