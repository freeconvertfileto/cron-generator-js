(function() {
    var minuteEl = document.getElementById('crgMinute');
    var hourEl = document.getElementById('crgHour');
    var domEl = document.getElementById('crgDom');
    var monthEl = document.getElementById('crgMonth');
    var dowEl = document.getElementById('crgDow');
    var expressionEl = document.getElementById('crgExpression');
    var descriptionEl = document.getElementById('crgDescription');
    var nextRunsEl = document.getElementById('crgNextRuns');
    var copyBtn = document.getElementById('crgCopy');
    var presetBtns = document.querySelectorAll('.crg-preset-btn');

    var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    function getExpression() {
        var m = minuteEl ? minuteEl.value.trim() || '*' : '*';
        var h = hourEl ? hourEl.value.trim() || '*' : '*';
        var dom = domEl ? domEl.value.trim() || '*' : '*';
        var mo = monthEl ? monthEl.value.trim() || '*' : '*';
        var dow = dowEl ? dowEl.value.trim() || '*' : '*';
        return m + ' ' + h + ' ' + dom + ' ' + mo + ' ' + dow;
    }

    function describeField(val, min, max, names) {
        if (val === '*') return 'every';
        if (val.indexOf('/') !== -1) {
            var parts = val.split('/');
            return 'every ' + parts[1];
        }
        if (val.indexOf('-') !== -1) {
            var parts = val.split('-');
            return parts[0] + '-' + parts[1];
        }
        if (val.indexOf(',') !== -1) {
            return val.split(',').map(function(v) {
                return names ? (names[parseInt(v, 10)] || v) : v;
            }).join(', ');
        }
        if (names) return names[parseInt(val, 10)] || val;
        return val;
    }

    function describe(expr) {
        var parts = expr.split(/\s+/);
        if (parts.length !== 5) return 'Invalid expression';
        var m = parts[0], h = parts[1], dom = parts[2], mo = parts[3], dow = parts[4];

        if (expr === '* * * * *') return 'Every minute';
        if (expr === '0 * * * *') return 'At minute 0 of every hour';
        if (expr === '0 0 * * *') return 'Every day at midnight';
        if (expr === '0 0 * * 0') return 'Every Sunday at midnight';
        if (expr === '0 0 1 * *') return 'At midnight on the 1st of every month';
        if (expr === '0 0 1 1 *') return 'At midnight on January 1st';

        var desc = 'At ';
        if (m === '*' && h === '*') desc += 'every minute';
        else if (m === '*') desc += 'every minute of hour ' + h;
        else if (h === '*') desc += 'minute ' + m + ' of every hour';
        else desc += h + ':' + (m.length === 1 ? '0' + m : m);

        if (dom !== '*') desc += ', on day ' + dom + ' of the month';
        if (mo !== '*') desc += ', in ' + describeField(mo, 1, 12, MONTHS);
        if (dow !== '*') desc += ', on ' + describeField(dow, 0, 6, DAYS);
        return desc;
    }

    function parsePart(val, min, max) {
        var set = [];
        if (val === '*') {
            for (var i = min; i <= max; i++) set.push(i);
            return set;
        }
        if (val.indexOf('/') !== -1) {
            var p = val.split('/');
            var step = parseInt(p[1], 10);
            var start = p[0] === '*' ? min : parseInt(p[0], 10);
            for (var i = start; i <= max; i += step) set.push(i);
            return set;
        }
        if (val.indexOf(',') !== -1) {
            return val.split(',').map(function(v) { return parseInt(v.trim(), 10); });
        }
        if (val.indexOf('-') !== -1) {
            var p = val.split('-');
            for (var i = parseInt(p[0], 10); i <= parseInt(p[1], 10); i++) set.push(i);
            return set;
        }
        return [parseInt(val, 10)];
    }

    function nextRuns(expr, count) {
        var parts = expr.split(/\s+/);
        if (parts.length !== 5) return [];
        var minutes = parsePart(parts[0], 0, 59);
        var hours = parsePart(parts[1], 0, 23);
        var doms = parsePart(parts[2], 1, 31);
        var months = parsePart(parts[3], 1, 12);
        var dows = parsePart(parts[4], 0, 6);
        var domStar = parts[2] === '*';
        var dowStar = parts[4] === '*';

        var runs = [];
        var now = new Date();
        now.setSeconds(0, 0);
        now.setMinutes(now.getMinutes() + 1);

        var limit = 0;
        while (runs.length < count && limit < 50000) {
            limit++;
            var mo = now.getMonth() + 1;
            var d = now.getDate();
            var h = now.getHours();
            var mi = now.getMinutes();
            var dw = now.getDay();

            if (months.indexOf(mo) === -1) {
                now = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
                continue;
            }

            var domMatch = domStar || doms.indexOf(d) !== -1;
            var dowMatch = dowStar || dows.indexOf(dw) !== -1;
            var dayMatch = (!domStar && !dowStar) ? (domMatch || dowMatch) : (domMatch && dowMatch);

            if (!dayMatch) {
                now = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
                continue;
            }

            if (hours.indexOf(h) === -1) {
                var nextH = null;
                for (var i = 0; i < hours.length; i++) { if (hours[i] > h) { nextH = hours[i]; break; } }
                if (nextH === null) {
                    now = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
                } else {
                    now.setHours(nextH, 0, 0, 0);
                }
                continue;
            }

            if (minutes.indexOf(mi) === -1) {
                var nextM = null;
                for (var i = 0; i < minutes.length; i++) { if (minutes[i] > mi) { nextM = minutes[i]; break; } }
                if (nextM === null) {
                    var nextHIdx = -1;
                    for (var i = 0; i < hours.length; i++) { if (hours[i] > h) { nextHIdx = i; break; } }
                    if (nextHIdx === -1) {
                        now = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
                    } else {
                        now.setHours(hours[nextHIdx], 0, 0, 0);
                    }
                } else {
                    now.setMinutes(nextM, 0, 0);
                }
                continue;
            }

            runs.push(new Date(now));
            now.setMinutes(now.getMinutes() + 1);
        }
        return runs;
    }

    function formatDate(d) {
        return d.toLocaleString();
    }

    function update() {
        var expr = getExpression();
        if (expressionEl) expressionEl.textContent = expr;
        if (descriptionEl) descriptionEl.textContent = describe(expr);
        if (nextRunsEl) {
            nextRunsEl.innerHTML = '';
            var runs = nextRuns(expr, 5);
            runs.forEach(function(d) {
                var li = document.createElement('li');
                li.textContent = formatDate(d);
                nextRunsEl.appendChild(li);
            });
        }
    }

    [minuteEl, hourEl, domEl, monthEl, dowEl].forEach(function(el) {
        if (el) el.addEventListener('input', update);
    });

    if (presetBtns) {
        presetBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var expr = btn.getAttribute('data-expr');
                if (!expr) return;
                presetBtns.forEach(function(b) { b.classList.remove('active'); });
                btn.classList.add('active');
                var parts = expr.split(' ');
                if (minuteEl) minuteEl.value = parts[0];
                if (hourEl) hourEl.value = parts[1];
                if (domEl) domEl.value = parts[2];
                if (monthEl) monthEl.value = parts[3];
                if (dowEl) dowEl.value = parts[4];
                update();
            });
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            var expr = getExpression();
            navigator.clipboard.writeText(expr).then(function() {
                var orig = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(function() { copyBtn.textContent = orig; }, 1500);
            });
        });
    }

    update();
})();
