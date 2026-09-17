/* =====================================================================
   SERRES Wrap Center (US) — QuoteForm   (spec sections 7.1 / 7.3)
   ---------------------------------------------------------------------
   Progressively enhances every  <form data-us-quote>  on the page.

   * If the form already contains named controls, they are enhanced in place.
   * If it is empty, the whole field set is rendered here, so a bare
     <form data-us-quote></form> is a complete, accessible quote form.

   Fields: name · phone (US validated) · email · car make/model/year ·
           service (<select> built at runtime from the PUBLISHED items in
           window.SERRES_PRICING — never a hardcoded list) · message.

   Anti-spam (7.3): honeypot field + 3-second minimum fill timer. No CAPTCHA.

   DELIVERY: the owner chose WhatsApp prefill — business.waHref(text).
   WhatsApp is NOT live yet (business.whatsappDigits === null), so the form
   does not pretend to send: it renders a truthful "nothing was sent" state
   instead of a fabricated confirmation. No "we reply within 2 hours" copy
   is shown while there is no channel that could honour it.
   ===================================================================== */
(function () {
  "use strict";

  if (window.SERRES_QUOTE_FORM) return;

  var MIN_FILL_MS = 3000;
  /* TODO(owner): business.js has no field for when the direct line switches on.
     Until it does, this copy is the only place that date lives. */
  var DIRECT_LINE_LABEL = 'October 2026';

  function B() { return window.SERRES_BUSINESS || {}; }
  function P() { return window.SERRES_PRICING || null; }
  function toArray(l) { return Array.prototype.slice.call(l || []); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function track(evt, params) {
    if (typeof window.SERRES_TRACK === 'function') window.SERRES_TRACK(evt, params || {});
  }
  /* =================================================================== css */
  var css = ''
  + '.us-qf{display:grid;gap:20px}'
  + '.us-qf-grid{display:grid;gap:16px;grid-template-columns:repeat(2,minmax(0,1fr))}'
  + '@media(max-width:700px){.us-qf-grid{grid-template-columns:1fr}}'
  + '.us-qf-field{display:grid;gap:8px;min-width:0;align-content:start}'
  + '.us-qf-field.us-qf-wide{grid-column:1/-1}'
  + '.us-qf-label{font-family:"Barlow Condensed","Bahnschrift","Arial Narrow",sans-serif;font-weight:600;'
  +   'text-transform:uppercase;letter-spacing:.16em;font-size:12px;color:var(--muted,#9a9aa3)}'
  + '.us-qf-label .us-qf-opt{color:var(--muted-2,#6e6e77);letter-spacing:.1em}'
  + '.us-qf-field input,.us-qf-field select,.us-qf-field textarea{'
  +   'width:100%;min-height:48px;padding:12px 14px;box-sizing:border-box;'
  +   'background:var(--panel,#141417);color:var(--text,#f3f3f5);'
  +   'border:1px solid var(--line-strong,rgba(255,255,255,.16));border-radius:0;'
  +   'font-family:inherit;font-size:16px;line-height:1.5;'
  +   'transition:border-color .2s var(--ease,ease),background .2s var(--ease,ease)}'
  + '.us-qf-field textarea{min-height:112px;resize:vertical}'
  + '.us-qf-field select{appearance:none;-webkit-appearance:none;cursor:pointer;padding-right:40px;'
  +   'background-image:linear-gradient(45deg,transparent 50%,var(--muted,#9a9aa3) 50%),'
  +   'linear-gradient(135deg,var(--muted,#9a9aa3) 50%,transparent 50%);'
  +   'background-position:calc(100% - 20px) 22px,calc(100% - 14px) 22px;'
  +   'background-size:6px 6px,6px 6px;background-repeat:no-repeat}'
  + '.us-qf-field input:hover,.us-qf-field select:hover,.us-qf-field textarea:hover{background:var(--panel-2,#191920)}'
  + '.us-qf-field input:focus-visible,.us-qf-field select:focus-visible,.us-qf-field textarea:focus-visible{'
  +   'outline:2px solid var(--text,#f3f3f5);outline-offset:2px;border-color:var(--text,#f3f3f5)}'
  + '.us-qf-field input[aria-invalid="true"],.us-qf-field select[aria-invalid="true"],'
  +   '.us-qf-field textarea[aria-invalid="true"]{border-color:#e2765f}'
  + '.us-qf-hint{font-size:13px;line-height:1.5;color:var(--muted,#9a9aa3)}'   /* 7.2:1 on --bg */
  + '.us-qf-err{font-size:13px;line-height:1.5;color:#f0947f;min-height:0}'
  + '.us-qf-err:empty{display:none}'

  /* honeypot — off-screen rather than display:none, which some bots skip */
  + '.us-qf-hp{position:absolute!important;width:1px;height:1px;overflow:hidden;'
  +   'clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0;padding:0;margin:-1px}'

  + '.us-qf-foot{display:flex;align-items:center;gap:18px;flex-wrap:wrap}'
  + '.us-qf-submit{min-height:52px;padding:0 28px;cursor:pointer;'
  +   'font-family:"Barlow Condensed","Bahnschrift","Arial Narrow",sans-serif;font-weight:700;'
  +   'text-transform:uppercase;letter-spacing:.18em;font-size:14px;'
  +   'color:#0a0a0b;background:var(--text,#f3f3f5);border:1px solid var(--text,#f3f3f5);'
  +   'clip-path:polygon(0 0,100% 0,100% 100%,12px 100%,0 calc(100% - 12px));'
  +   'transition:transform .2s var(--ease,ease),background .2s var(--ease,ease)}'
  + '.us-qf-submit:hover{transform:translateY(-2px);background:#fff}'
  + '.us-qf-submit:focus-visible{outline:2px solid var(--text,#f3f3f5);outline-offset:3px}'
  + '.us-qf-terms{font-size:13px;line-height:1.6;color:var(--muted,#9a9aa3);max-width:46ch}'

  /* pre-flight honesty notice + post-submit state */
  + '.us-qf-note{display:grid;gap:8px;padding:16px 18px;'
  +   'border:1px solid var(--line-strong,rgba(255,255,255,.16));'
  +   'background:linear-gradient(180deg,var(--panel-2,#191920),var(--panel,#141417));'
  +   'border-left:2px solid var(--muted,#9a9aa3)}'
  + '.us-qf-note-title{font-family:"Barlow Condensed","Bahnschrift","Arial Narrow",sans-serif;font-weight:700;'
  +   'text-transform:uppercase;letter-spacing:.14em;font-size:15px;color:var(--text,#f3f3f5)}'
  + '.us-qf-note p{margin:0;font-size:14.5px;line-height:1.65;color:var(--muted,#9a9aa3)}'
  + '.us-qf-note ul{margin:4px 0 0;padding-left:18px;font-size:14px;line-height:1.7;color:var(--muted,#9a9aa3)}'
  + '.us-qf-note a{color:var(--text,#f3f3f5);text-underline-offset:3px}'
  + '.us-qf-state{margin-bottom:4px}'
  + '.us-qf-state:focus{outline:2px solid var(--text,#f3f3f5);outline-offset:3px}'
  + '.us-qf-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:8px}'
  + '.us-qf-ghost{min-height:44px;padding:0 18px;display:inline-flex;align-items:center;cursor:pointer;'
  +   'font-family:"Barlow Condensed","Bahnschrift","Arial Narrow",sans-serif;font-weight:600;'
  +   'text-transform:uppercase;letter-spacing:.16em;font-size:12.5px;'
  +   'color:var(--text,#f3f3f5);background:transparent;'
  +   'border:1px solid var(--line-strong,rgba(255,255,255,.16));'
  +   'transition:border-color .2s var(--ease,ease),background .2s var(--ease,ease)}'
  + '.us-qf-ghost:hover{border-color:var(--text,#f3f3f5);background:rgba(255,255,255,.04)}'
  + '.us-qf-ghost:focus-visible{outline:2px solid var(--text,#f3f3f5);outline-offset:2px}'
  + '@media(prefers-reduced-motion:reduce){.us-qf-submit,.us-qf-ghost,.us-qf-field input,'
  +   '.us-qf-field select,.us-qf-field textarea{transition-duration:.01ms!important}'
  +   '.us-qf-submit:hover{transform:none}}';

  function injectCss() {
    if (document.getElementById('us-qf-style')) return;
    var s = document.createElement('style');
    s.id = 'us-qf-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* ============================================================ validation */
  function digitsOf(v) { return String(v || '').replace(/\D+/g, ''); }

  /* NANP: 10 digits, or 11 with a leading 1. Area code and exchange code
     must not start with 0 or 1. */
  function isUsPhone(v) {
    var d = digitsOf(v);
    if (d.length === 11 && d.charAt(0) === '1') d = d.slice(1);
    if (d.length !== 10) return false;
    if (/^[01]/.test(d)) return false;
    if (/^[01]/.test(d.slice(3))) return false;
    return true;
  }
  function formatUsPhone(v) {
    var d = digitsOf(v);
    if (d.length === 11 && d.charAt(0) === '1') d = d.slice(1);
    if (d.length !== 10) return String(v || '').trim();
    return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
  }
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(v || '').trim()); }

  /* ======================================================= service options */
  function serviceGroups() {
    var p = P();
    if (!p || typeof p.published !== 'function') return [];
    var order = ['packages', 'ppf', 'wraps', 'tint', 'detailing'];
    var labels = p.GROUP_LABELS || {};
    var out = [];
    order.forEach(function (g) {
      var items = [];
      try { items = p.published(g) || []; } catch (_) { items = []; }
      if (!items.length) return;
      out.push({
        key: g,
        label: labels[g] || g,
        items: items.map(function (it) {
          var price = '';
          try {
            price = (it.priceEssential !== undefined) ? p.from(it, 'priceEssential') : p.from(it);
          } catch (_) { price = ''; }
          return { id: it.id, name: it.name, price: price };
        })
      });
    });
    return out;
  }

  function optionsHtml() {
    var html = '<option value="" selected disabled>Select a service</option>';
    serviceGroups().forEach(function (g) {
      html += '<option value="" disabled>&#8212; ' + esc(g.label) + ' &#8212;</option>';
      g.items.forEach(function (it) {
        var txt = it.name + (it.price ? '  ·  ' + it.price : '');
        html += '<option value="' + esc(it.id) + '" data-us-name="' + esc(it.name) + '">' + esc(txt) + '</option>';
      });
    });
    html += '<option value="not-sure" data-us-name="Not sure yet">Not sure yet &#8212; help me choose</option>';
    return html;
  }

  /* Some browsers render <optgroup> labels poorly on dark UI; a disabled
     separator <option> is used above instead, so grouping still reads. */

  /* ============================================================ field spec */
  var FIELDS = [
    { key: 'name',    names: ['name', 'fullname', 'full-name'], label: 'Your name',
      type: 'text', autocomplete: 'name', required: true },
    { key: 'phone',   names: ['phone', 'tel', 'telephone'], label: 'Phone',
      type: 'tel', autocomplete: 'tel', required: true, hint: 'US number — the fastest way to get your quote back.' },
    { key: 'email',   names: ['email', 'e-mail'], label: 'Email',
      type: 'email', autocomplete: 'email', required: false },
    { key: 'vehicle', names: ['vehicle', 'car', 'car-info', 'vehicle-info'], label: 'Car — make, model, year',
      type: 'text', autocomplete: 'off', required: true, wide: true,
      hint: 'Exact model and year change the pattern and the price.' },
    { key: 'service', names: ['service'], label: 'Service', type: 'select', required: true, wide: true },
    { key: 'message', names: ['message', 'notes', 'comments'], label: 'Anything else?',
      type: 'textarea', required: false, wide: true }
  ];

  function findControl(form, spec) {
    for (var i = 0; i < spec.names.length; i++) {
      var el = form.querySelector('[name="' + spec.names[i] + '"]');
      if (el) return el;
    }
    return null;
  }

  function hasAnyControl(form) {
    return !!form.querySelector('input[name],select[name],textarea[name]');
  }

  /* =========================================================== rendering */
  var uid = 0;
  function renderFields(form, prefix) {
    var grid = document.createElement('div');
    grid.className = 'us-qf-grid';
    var html = '';
    FIELDS.forEach(function (f) {
      var id = prefix + '-' + f.key;
      var optional = f.required ? '' : ' <span class="us-qf-opt">(optional)</span>';
      var control;
      if (f.type === 'select') {
        control = '<select id="' + id + '" name="' + f.key + '" required>' + optionsHtml() + '</select>';
      } else if (f.type === 'textarea') {
        control = '<textarea id="' + id + '" name="' + f.key + '" rows="4"></textarea>';
      } else {
        control = '<input id="' + id + '" name="' + f.key + '" type="' + f.type + '"' +
                  (f.autocomplete ? ' autocomplete="' + f.autocomplete + '"' : '') +
                  (f.type === 'tel' ? ' inputmode="tel"' : '') +
                  (f.required ? ' required' : '') + '>';
      }
      html += '<div class="us-qf-field' + (f.wide ? ' us-qf-wide' : '') + '">' +
                '<label class="us-qf-label" for="' + id + '">' + esc(f.label) + optional + '</label>' +
                control +
                (f.hint ? '<p class="us-qf-hint" id="' + id + '-hint">' + esc(f.hint) + '</p>' : '') +
                '<p class="us-qf-err" id="' + id + '-err" aria-live="polite"></p>' +
              '</div>';
    });
    grid.innerHTML = html;
    form.appendChild(grid);

    var foot = document.createElement('div');
    foot.className = 'us-qf-foot';
    foot.innerHTML = '<button type="submit" class="us-qf-submit">Get my quote</button>';
    var p = P();
    var terms = [];
    if (p && p.TERMS) {
      if (p.TERMS.fromMeaning) terms.push(p.TERMS.fromMeaning);
      if (p.TERMS.tax) terms.push(p.TERMS.tax);
    }
    if (terms.length) {
      foot.innerHTML += '<p class="us-qf-terms">' + esc(terms.join(' ')) + '</p>';
    }
    form.appendChild(foot);
  }

  /* ---- make sure an existing (author-written) control is accessible ---- */
  function wireControl(form, spec, control, prefix) {
    if (!control.id) control.id = prefix + '-' + spec.key;
    var wrap = control.closest ? control.closest('.us-qf-field') : null;
    if (!wrap) wrap = control.parentNode;

    /* label — never a placeholder standing in for one */
    var label = form.querySelector('label[for="' + control.id + '"]');
    if (!label && wrap) {
      label = document.createElement('label');
      label.className = 'us-qf-label';
      label.setAttribute('for', control.id);
      label.textContent = spec.label;
      wrap.insertBefore(label, control);
    }
    if (control.getAttribute('placeholder') && label) control.removeAttribute('placeholder');

    /* error node */
    var err = document.getElementById(control.id + '-err');
    if (!err && wrap) {
      err = document.createElement('p');
      err.className = 'us-qf-err';
      err.id = control.id + '-err';
      err.setAttribute('aria-live', 'polite');
      wrap.appendChild(err);
    }
    var described = [];
    if (document.getElementById(control.id + '-hint')) described.push(control.id + '-hint');
    if (err) described.push(err.id);
    if (described.length) control.setAttribute('aria-describedby', described.join(' '));
  }

  /* ========================================================== validation */
  function errNode(control) { return document.getElementById(control.id + '-err'); }

  function setError(control, msg) {
    var n = errNode(control);
    if (n) n.textContent = msg || '';
    if (msg) control.setAttribute('aria-invalid', 'true');
    else control.removeAttribute('aria-invalid');
  }

  function validate(control, spec) {
    var v = (control.value || '').trim();
    var required = control.hasAttribute('required') || spec.required;
    if (!v) {
      if (required) { setError(control, 'Please fill this in.'); return false; }
      setError(control, ''); return true;
    }
    if (spec.key === 'phone' && !isUsPhone(v)) {
      setError(control, 'Enter a US phone number, e.g. (561) 555-0123.');
      return false;
    }
    if (spec.key === 'email' && !isEmail(v)) {
      setError(control, 'That email address does not look right.');
      return false;
    }
    if (spec.key === 'name' && v.length < 2) {
      setError(control, 'Please enter your name.');
      return false;
    }
    setError(control, '');
    return true;
  }

  /* ============================================================= message */
  function selectedServiceName(control) {
    if (!control) return '';
    var opt = control.options && control.selectedIndex >= 0 ? control.options[control.selectedIndex] : null;
    if (!opt) return control.value || '';
    return opt.getAttribute('data-us-name') || opt.textContent || control.value || '';
  }

  function compose(map) {
    var b = B();
    var lines = [];
    var head = b.WA_TEXT || 'Hi SERRES — I would like a quote. My car is a ';
    lines.push(head + (map.vehicle || '(car not given)'));
    lines.push('');
    if (map.service) lines.push('Service: ' + map.service);
    if (map.name) lines.push('Name: ' + map.name);
    if (map.phone) lines.push('Phone: ' + map.phone);
    if (map.email) lines.push('Email: ' + map.email);
    if (map.message) { lines.push(''); lines.push(map.message); }
    return lines.join('\n');
  }

  /* ======================================================== result states */
  function stateNode(form) {
    var n = form.querySelector('.us-qf-state');
    if (!n) {
      n = document.createElement('div');
      n.className = 'us-qf-note us-qf-state';
      n.setAttribute('tabindex', '-1');
      n.setAttribute('role', 'status');
      form.insertBefore(n, form.firstChild);
    }
    return n;
  }

  function showUndeliverable(form, text) {
    var b = B();
    var n = stateNode(form);
    var bits = [];
    bits.push('<span class="us-qf-note-title">Nothing was sent &#8212; and we will not pretend it was.</span>');
    bits.push('<p>Our direct line (WhatsApp, calls and texts) switches on in ' + esc(DIRECT_LINE_LABEL) +
              '. Until then there is no inbox behind this form, so your message is still sitting right here with you.</p>');
    var when = [];
    if (b.openingSoftLabel) when.push('The studio opens <strong>' + esc(b.openingSoftLabel) + '</strong>' +
      (b.city ? ' in ' + esc(b.city) + (b.region ? ', ' + esc(b.region) : '') : '') + '.');
    if (b.openingFullLabel) when.push('Full paint protection film launches <strong>' + esc(b.openingFullLabel) + '</strong>.');
    if (when.length) bits.push('<ul><li>' + when.join('</li><li>') + '</li></ul>');
    bits.push('<p>Copy your details below and keep them &#8212; or follow the build on Instagram and message us the day the line opens.</p>');

    var actions = '<div class="us-qf-actions">' +
      '<button type="button" class="us-qf-ghost" data-us-copy>Copy my details</button>';
    if (b.instagram) {
      actions += '<a class="us-qf-ghost" href="' + esc(b.instagram) + '" target="_blank" rel="noopener">Instagram</a>';
    }
    actions += '</div>';

    n.innerHTML = bits.join('') + actions;

    var btn = n.querySelector('[data-us-copy]');
    if (btn) {
      btn.addEventListener('click', function () {
        var done = function (ok) { btn.textContent = ok ? 'Copied' : 'Press Ctrl+C to copy'; };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
        } else {
          try {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'absolute';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            done(true);
          } catch (_) { done(false); }
        }
      });
    }
    n.focus();
  }

  function showNotice(form, title, body) {
    var n = stateNode(form);
    n.innerHTML = '<span class="us-qf-note-title">' + esc(title) + '</span><p>' + esc(body) + '</p>';
    n.focus();
  }

  /* =============================================================== enhance */
  function enhance(form) {
    if (form.getAttribute('data-us-quote-ready') === '1') return;
    form.setAttribute('data-us-quote-ready', '1');
    form.classList.add('us-qf');
    form.noValidate = true;                 // our messages, not the browser's

    var prefix = 'usqf' + (++uid);
    var selfRendered = !hasAnyControl(form);
    if (selfRendered) renderFields(form, prefix);

    /* resolve every field, wire labels / errors */
    var map = {};
    FIELDS.forEach(function (spec) {
      var c = findControl(form, spec);
      if (!c) return;
      map[spec.key] = { spec: spec, el: c };
      wireControl(form, spec, c, prefix);
    });

    /* service <select> — always populated from pricing.js, never hardcoded */
    if (map.service && map.service.el.tagName === 'SELECT' &&
        !form.hasAttribute('data-us-keep-options')) {
      var sel = map.service.el;
      if (!sel.getAttribute('data-us-filled')) {
        sel.innerHTML = optionsHtml();
        sel.setAttribute('data-us-filled', '1');
      }
    }

    /* honeypot (7.3) */
    var hp = form.querySelector('[name="company"]');
    if (!hp) {
      var hpWrap = document.createElement('div');
      hpWrap.className = 'us-qf-hp';
      hpWrap.setAttribute('aria-hidden', 'true');
      var hpId = prefix + '-company';
      hpWrap.innerHTML = '<label for="' + hpId + '">Company (leave blank)</label>' +
        '<input id="' + hpId + '" name="company" type="text" tabindex="-1" autocomplete="off">';
      form.appendChild(hpWrap);
      hp = hpWrap.querySelector('input');
    }

    /* 3-second minimum fill timer (7.3) */
    var startedAt = Date.now();

    /* pre-flight honesty notice: no channel can receive this yet */
    var b = B();
    var deliverable = !!(b.WHATSAPP_LIVE && typeof b.waHref === 'function' && b.waHref(''));
    if (!deliverable && !form.querySelector('[data-us-qf-notice]')) {
      var pre = document.createElement('div');
      pre.className = 'us-qf-note';
      pre.setAttribute('data-us-qf-notice', '');
      pre.innerHTML = '<span class="us-qf-note-title">Heads-up before you type</span>' +
        '<p>Our direct line opens in ' + esc(DIRECT_LINE_LABEL) +
        ', so nobody can answer this form yet. Fill it in to see exactly what we will need &#8212; ' +
        'you can copy it and send it the moment we are reachable.</p>';
      form.insertBefore(pre, form.firstChild);
      /* Do not promise a quote the form cannot fetch. Only relabel a button we
         rendered ourselves — an author-written label is theirs to word. */
      var sub = selfRendered ? form.querySelector('.us-qf-submit') : null;
      if (sub) sub.textContent = 'See what we’ll need';
    }

    /* inline validation on blur, clear on input */
    Object.keys(map).forEach(function (k) {
      var f = map[k];
      f.el.addEventListener('blur', function () {
        validate(f.el, f.spec);
        if (f.spec.key === 'phone' && isUsPhone(f.el.value)) f.el.value = formatUsPhone(f.el.value);
      });
      var live = (f.el.tagName === 'SELECT') ? 'change' : 'input';
      f.el.addEventListener(live, function () {
        if (f.el.getAttribute('aria-invalid') === 'true') validate(f.el, f.spec);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* honeypot — a bot filled a field no human can see. Do nothing. */
      if (hp && (hp.value || '').trim()) return;

      /* validate everything, focus the first problem */
      var firstBad = null;
      Object.keys(map).forEach(function (k) {
        var f = map[k];
        if (!validate(f.el, f.spec) && !firstBad) firstBad = f.el;
      });
      if (firstBad) { firstBad.focus(); return; }

      /* minimum fill timer */
      if (Date.now() - startedAt < MIN_FILL_MS) {
        showNotice(form, 'One moment',
          'Give your details a quick read, then submit again.');
        return;
      }

      var values = {};
      Object.keys(map).forEach(function (k) {
        values[k] = k === 'service'
          ? selectedServiceName(map[k].el)
          : (map[k].el.value || '').trim();
      });
      var text = compose(values);
      var biz = B();
      var wa = (biz.WHATSAPP_LIVE && typeof biz.waHref === 'function') ? biz.waHref(text) : null;

      track('quote_submit', {
        service: values.service || '',
        delivery: wa ? 'whatsapp' : 'unavailable'
      });

      if (wa) {
        var w = null;
        try { w = window.open(wa, '_blank', 'noopener'); } catch (_) {}
        if (!w) window.location.href = wa;
        return;
      }
      /* No channel is live — say so plainly, keep the visitor's input. */
      showUndeliverable(form, text);
    });
  }

  function init() {
    var forms = toArray(document.querySelectorAll('form[data-us-quote]'));
    if (!forms.length) return;
    injectCss();
    forms.forEach(enhance);
  }

  window.SERRES_QUOTE_FORM = { enhance: enhance, init: init, isUsPhone: isUsPhone, compose: compose };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
