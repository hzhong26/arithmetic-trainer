// ============================================================
// Helpers
// ============================================================

// Random whole number from min to max (both included)
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Pick a random item from an array
function pick(list) {
    return list[randInt(0, list.length - 1)];
}

// Shortcut for document.getElementById
function $(id) {
    return document.getElementById(id);
}

// Show one screen and hide the others
function showScreen(id) {
    for (const screen of ["setup", "game", "results", "records"]) {
        $(screen).hidden = screen !== id;
    }
}


// ============================================================
// Trick drills
// Each trick has a make() function that returns a problem
// that can be solved with that trick: { text, answer }
// ============================================================

const TRICKS = [
    {
        id: "add-carry",
        name: "Addition with carries",
        example: "58 + 67",
        hint: "Add left to right: tens first, then units, then add the carry.",
        make() {
            const au = randInt(1, 9);
            const bu = randInt(10 - au, 9);          // units add up to 10 or more
            const a = randInt(1, 8) * 10 + au;
            const b = randInt(1, 8) * 10 + bu;
            return { text: `${a} + ${b}`, answer: a + b };
        },
    },
    {
        id: "sub-complement",
        name: "Subtract from 100 / 1000",
        example: "1000 – 384",
        hint: "Every digit pairs up to 9, except the last one, which pairs up to 10.",
        make() {
            if (Math.random() < 0.5) {
                const x = randInt(11, 99);
                return { text: `100 – ${x}`, answer: 100 - x };
            }
            const x = randInt(101, 999);
            return { text: `1000 – ${x}`, answer: 1000 - x };
        },
    },
    {
        id: "sub-cross",
        name: "Subtract across a hundred",
        example: "203 – 57",
        hint: "Subtract down to the hundred first, then subtract what's left.",
        make() {
            const b = randInt(12, 99);
            const a = randInt(1, 9) * 100 + randInt(0, b - 1);   // forces crossing the hundred
            return { text: `${a} – ${b}`, answer: a - b };
        },
    },
    {
        id: "mul-11",
        name: "Multiply by 11",
        example: "47 × 11",
        hint: "Split the two digits and put their sum in the middle (carry if 10+).",
        make() {
            const x = randInt(12, 99);
            return { text: `${x} × 11`, answer: x * 11 };
        },
    },
    {
        id: "mul-12",
        name: "Multiply by 12",
        example: "36 × 12",
        hint: "×10, plus ×2.",
        make() {
            const x = randInt(13, 99);
            return { text: `${x} × 12`, answer: x * 12 };
        },
    },
    {
        id: "mul-5-25",
        name: "Multiply by 5 or 25",
        example: "68 × 25",
        hint: "×5 = halve, then ×10.   ×25 = divide by 4, then ×100.",
        make() {
            if (Math.random() < 0.5) {
                const x = randInt(12, 198);
                return { text: `${x} × 5`, answer: x * 5 };
            }
            const x = randInt(4, 48);
            return { text: `${x} × 25`, answer: x * 25 };
        },
    },
    {
        id: "mul-round",
        name: "Round then adjust",
        example: "49 × 7",
        hint: "Round to the nearest ten, multiply, then fix the difference.",
        make() {
            const d = randInt(3, 9);
            const n = randInt(2, 9) * 10 + pick([-2, -1, 1, 2]);
            return { text: `${n} × ${d}`, answer: n * d };
        },
    },
    {
        id: "mul-split",
        name: "Split 2-digit × 1-digit",
        example: "73 × 6",
        hint: "Multiply the tens and the units separately, then add.",
        make() {
            const d = randInt(3, 9);
            let n = randInt(13, 99);
            if (n % 10 === 0) n += 1;
            return { text: `${n} × ${d}`, answer: n * d };
        },
    },
    {
        id: "square",
        name: "Squares 11–32",
        example: "27 × 27",
        hint: "Use a nearby easy square: (a ± b)² = a² ± 2ab + b².",
        make() {
            let n = randInt(11, 32);
            if (n % 10 === 0) n += 1;
            return { text: `${n} × ${n}`, answer: n * n };
        },
    },
    {
        id: "square-5",
        name: "Squares ending in 5",
        example: "65 × 65",
        hint: "Tens digit × (tens digit + 1), then write 25 after it.",
        make() {
            const n = randInt(1, 9) * 10 + 5;
            return { text: `${n} × ${n}`, answer: n * n };
        },
    },
    {
        id: "same-tens",
        name: "Same tens, units add to 10",
        example: "43 × 47",
        hint: "Tens × (tens + 1), then write units × units as two digits.",
        make() {
            const t = randInt(1, 9);
            const u = randInt(1, 9);
            const a = t * 10 + u;
            const b = t * 10 + (10 - u);
            return { text: `${a} × ${b}`, answer: a * b };
        },
    },
    {
        id: "div-9",
        name: "Divide by 9",
        example: "783 ÷ 9",
        hint: "Estimate with ÷10 (roughly), then adjust: 9 × answer must match.",
        make() {
            const q = randInt(12, 111);
            return { text: `${q * 9} ÷ 9`, answer: q };
        },
    },
    {
        id: "div-11",
        name: "Divide by 11",
        example: "517 ÷ 11",
        hint: "Reverse the ×11 trick: first and last digits of the answer come from the outside digits.",
        make() {
            const q = randInt(10, 90);
            return { text: `${q * 11} ÷ 11`, answer: q };
        },
    },
];

// Display names for standard problem types (used in records)
const TYPE_NAMES = {
    add: "Addition",
    sub: "Subtraction",
    mul: "Multiplication",
    div: "Division",
};
for (const trick of TRICKS) {
    TYPE_NAMES[trick.id] = trick.name;
}

// Build the trick checkboxes on the setup screen
function buildTrickList() {
    const list = $("trick-list");
    for (const trick of TRICKS) {
        const div = document.createElement("div");
        div.className = "trick";
        div.innerHTML =
            `<label><input type="checkbox" value="${trick.id}"> ${trick.name}</label>` +
            `<span class="example">e.g. ${trick.example}</span>`;
        list.appendChild(div);
    }
}


// ============================================================
// Settings
// ============================================================

const SETTINGS_KEY = "arith-trainer-settings";
const NUMBER_IDS = [
    "add-a-min", "add-a-max", "add-b-min", "add-b-max",
    "mul-a-min", "mul-a-max", "mul-b-min", "mul-b-max",
];
const CHECKBOX_IDS = ["add-on", "sub-on", "mul-on", "div-on", "show-hints"];

// Read a range from two inputs, swapping them if min > max
function readRange(minId, maxId) {
    let min = parseInt($(minId).value, 10);
    let max = parseInt($(maxId).value, 10);
    if (isNaN(min)) min = 2;
    if (isNaN(max)) max = min;
    if (min > max) [min, max] = [max, min];
    return [min, max];
}

// Collect everything on the setup screen into one object
function readSettings() {
    return {
        mode: document.querySelector('input[name="mode"]:checked').value,
        add: $("add-on").checked,
        sub: $("sub-on").checked,
        mul: $("mul-on").checked,
        div: $("div-on").checked,
        addA: readRange("add-a-min", "add-a-max"),
        addB: readRange("add-b-min", "add-b-max"),
        mulA: readRange("mul-a-min", "mul-a-max"),
        mulB: readRange("mul-b-min", "mul-b-max"),
        tricks: [...document.querySelectorAll("#trick-list input:checked")].map(box => box.value),
        hints: $("show-hints").checked,
        duration: parseInt($("duration").value, 10),
    };
}

// Remember the setup screen between visits
function saveSettingsForm() {
    const saved = {
        mode: document.querySelector('input[name="mode"]:checked').value,
        duration: $("duration").value,
        tricks: [...document.querySelectorAll("#trick-list input:checked")].map(box => box.value),
    };
    for (const id of NUMBER_IDS) saved[id] = $(id).value;
    for (const id of CHECKBOX_IDS) saved[id] = $(id).checked;
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(saved));
    } catch (e) {
        // Storage unavailable (e.g. private window): settings just won't be remembered
    }
}

function loadSettingsForm() {
    let saved;
    try {
        saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    } catch (e) {
        saved = null;
    }
    if (!saved) return;

    for (const id of NUMBER_IDS) if (saved[id] !== undefined) $(id).value = saved[id];
    for (const id of CHECKBOX_IDS) if (saved[id] !== undefined) $(id).checked = saved[id];
    if (saved.duration) $("duration").value = saved.duration;
    if (saved.mode) {
        document.querySelector(`input[name="mode"][value="${saved.mode}"]`).checked = true;
    }
    for (const box of document.querySelectorAll("#trick-list input")) {
        box.checked = (saved.tricks || []).includes(box.value);
    }
}

// Show the options that belong to the selected mode
function updateModeView() {
    const mode = document.querySelector('input[name="mode"]:checked').value;
    $("standard-options").hidden = mode !== "standard";
    $("trick-options").hidden = mode !== "tricks";
}

// A short description of the settings, used to group records.
// Games only count toward the same personal best if their label matches.
function settingsLabel(s) {
    if (s.mode === "tricks") {
        return "Tricks: " + s.tricks.map(id => TYPE_NAMES[id]).join(", ");
    }
    const parts = [];
    if (s.add || s.sub) parts.push(`+– (${s.addA[0]}–${s.addA[1]}, ${s.addB[0]}–${s.addB[1]})`);
    if (s.mul || s.div) parts.push(`×÷ (${s.mulA[0]}–${s.mulA[1]}, ${s.mulB[0]}–${s.mulB[1]})`);
    const ops = ["add", "sub", "mul", "div"].filter(op => s[op]).map(op => TYPE_NAMES[op]);
    return "Standard: " + ops.join(", ") + " " + parts.join(" ");
}


// ============================================================
// Making problems
// ============================================================

// Returns { text, answer, type }
function makeProblem(s) {
    if (s.mode === "tricks") {
        const id = pick(s.tricks);
        const trick = TRICKS.find(t => t.id === id);
        return { ...trick.make(), type: trick.id, hint: trick.hint };
    }

    const ops = ["add", "sub", "mul", "div"].filter(op => s[op]);
    const op = pick(ops);

    if (op === "add" || op === "sub") {
        const a = randInt(...s.addA);
        const b = randInt(...s.addB);
        if (op === "add") return { text: `${a} + ${b}`, answer: a + b, type: op };
        return { text: `${a + b} – ${a}`, answer: b, type: op };
    }

    const a = randInt(...s.mulA);
    const b = randInt(...s.mulB);
    if (op === "mul") return { text: `${a} × ${b}`, answer: a * b, type: op };
    // Division never divides by 0
    if (a === 0) return { text: `${a} × ${b}`, answer: 0, type: "mul" };
    return { text: `${a * b} ÷ ${a}`, answer: b, type: op };
}


// ============================================================
// Game
// ============================================================

let settings = null;
let current = null;        // the problem on screen
let score = 0;
let endTime = 0;           // when the game ends (milliseconds)
let problemStart = 0;      // when the current problem appeared
let timerId = null;
let stats = {};            // per type: { count, ms }

function startGame() {
    settings = readSettings();

    // Make sure there's something to practice
    const anyOp = settings.add || settings.sub || settings.mul || settings.div;
    if (settings.mode === "standard" && !anyOp) {
        $("setup-error").textContent = "Pick at least one operation.";
        return;
    }
    if (settings.mode === "tricks" && settings.tricks.length === 0) {
        $("setup-error").textContent = "Pick at least one trick to drill.";
        return;
    }
    $("setup-error").textContent = "";
    saveSettingsForm();

    score = 0;
    stats = {};
    $("score").textContent = score;
    $("timer").textContent = settings.duration;
    $("answer").value = "";
    showScreen("game");
    nextProblem();
    $("answer").focus();

    endTime = Date.now() + settings.duration * 1000;
    clearInterval(timerId);
    timerId = setInterval(tick, 100);
}

function nextProblem() {
    // Avoid showing the exact same problem twice in a row
    let problem;
    do {
        problem = makeProblem(settings);
    } while (current && problem.text === current.text && Math.random() < 0.9);

    current = problem;
    problemStart = Date.now();
    $("problem").textContent = current.text;
    $("hint").textContent = settings.mode === "tricks" && settings.hints ? current.hint : "";
}

function tick() {
    const left = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    $("timer").textContent = left;
    if (left === 0) endGame();
}

// Runs every time the answer box changes.
// Like the original, a correct answer moves on right away — no Enter needed.
function checkAnswer() {
    const typed = $("answer").value.trim();
    if (typed !== String(current.answer)) return;

    const ms = Date.now() - problemStart;
    if (!stats[current.type]) stats[current.type] = { count: 0, ms: 0 };
    stats[current.type].count += 1;
    stats[current.type].ms += ms;

    score += 1;
    $("score").textContent = score;
    $("answer").value = "";
    nextProblem();
}

async function endGame() {
    clearInterval(timerId);
    $("answer").blur();
    $("answer").disabled = true;

    const game = {
        date: new Date().toISOString(),
        label: settingsLabel(settings),
        duration: settings.duration,
        score: score,
        stats: stats,
    };
    const previousBest = await bestScore(game.label, game.duration);
    await saveGame(game);
    $("answer").disabled = false;
    showResults(game, previousBest);
}


// ============================================================
// Online accounts (Supabase)
// Only turned on when config.js has the project's URL and key.
// ============================================================

const db = SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;
let user = null;           // the signed-in user, or null

function setAccountMessage(text) {
    $("account-msg").textContent = text;
}

// Show "sign in" or "signed in as ..." on the Records screen
function renderAccount() {
    $("account").hidden = !db;
    $("account-out").hidden = !!user;
    $("account-in").hidden = !user;
    if (user) $("account-email").textContent = user.email;
}

async function signIn() {
    setAccountMessage("");
    const { error } = await db.auth.signInWithPassword({
        email: $("email").value.trim(),
        password: $("password").value,
    });
    if (error) setAccountMessage(error.message);
}

async function signUp() {
    setAccountMessage("");
    const { data, error } = await db.auth.signUp({
        email: $("email").value.trim(),
        password: $("password").value,
        options: { emailRedirectTo: location.origin + location.pathname },
    });
    if (error) {
        setAccountMessage(error.message);
    } else if (!data.session) {
        setAccountMessage("Check your email and click the link to confirm, then sign in here.");
    }
}

async function signOut() {
    await db.auth.signOut();
}

// Games are stored in the database with slightly different column names
function toRow(game) {
    return {
        played_at: game.date,
        label: game.label,
        duration: game.duration,
        score: game.score,
        stats: game.stats,
    };
}

function fromRow(row) {
    return {
        date: row.played_at,
        label: row.label,
        duration: row.duration,
        score: row.score,
        stats: row.stats,
    };
}

// After signing in, move any games saved in this browser into the account
async function uploadLocalGames() {
    const local = loadLocalGames();
    if (local.length === 0) return;
    const { error } = await db.from("games").insert(local.map(toRow));
    if (error) {
        console.error(error);
        return;
    }
    try {
        localStorage.removeItem(RECORDS_KEY);
    } catch (e) {
        // nothing to clear
    }
    if (!$("records").hidden) showRecords();
}


// ============================================================
// Records
// Signed in: saved in the online database.
// Signed out: saved in this browser with localStorage.
// ============================================================

const RECORDS_KEY = "arith-trainer-records";

function loadLocalGames() {
    try {
        return JSON.parse(localStorage.getItem(RECORDS_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function saveLocalGame(game) {
    const games = loadLocalGames();
    games.push(game);
    try {
        localStorage.setItem(RECORDS_KEY, JSON.stringify(games));
    } catch (e) {
        // Storage unavailable: this game just isn't saved
    }
}

async function loadGames() {
    if (user) {
        const { data, error } = await db.from("games").select("*").order("played_at");
        if (!error) return data.map(fromRow);
        console.error(error);
    }
    return loadLocalGames();
}

async function saveGame(game) {
    if (user) {
        const { error } = await db.from("games").insert(toRow(game));
        if (!error) return;
        // Couldn't reach the database: keep the game in this browser instead.
        // It gets uploaded the next time you sign in.
        console.error(error);
    }
    saveLocalGame(game);
}

async function clearGames() {
    if (user) {
        const { error } = await db.from("games").delete().eq("user_id", user.id);
        if (error) console.error(error);
    }
    try {
        localStorage.removeItem(RECORDS_KEY);
    } catch (e) {
        // nothing to clear
    }
}

// Best previous score with the same settings and duration (or null)
async function bestScore(label, duration) {
    const scores = (await loadGames())
        .filter(g => g.label === label && g.duration === duration)
        .map(g => g.score);
    return scores.length ? Math.max(...scores) : null;
}

// Make text safe to put inside innerHTML
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// Average seconds per problem, e.g. "2.4 s"
function avgSeconds(entry) {
    return (entry.ms / entry.count / 1000).toFixed(1) + " s";
}

// HTML table of speed per problem type
function speedTable(statsByType) {
    const types = Object.keys(statsByType)
        .sort((a, b) => statsByType[b].ms / statsByType[b].count - statsByType[a].ms / statsByType[a].count);
    if (types.length === 0) return "";

    let html = "<table><tr><th>Problem type</th><th class='num'>Solved</th><th class='num'>Avg time</th></tr>";
    for (const type of types) {
        const entry = statsByType[type];
        html += `<tr><td>${escapeHtml(TYPE_NAMES[type] || type)}</td><td class="num">${entry.count}</td><td class="num">${avgSeconds(entry)}</td></tr>`;
    }
    return html + "</table>";
}

function showResults(game, previousBest) {
    $("final-score").textContent = game.score;

    if (previousBest === null) {
        $("best-message").textContent = "First game with these settings. This is your record to beat!";
    } else if (game.score > previousBest) {
        $("best-message").textContent = `New personal best! (previous: ${previousBest})`;
    } else {
        $("best-message").textContent = `Personal best with these settings: ${previousBest}`;
    }

    const table = speedTable(game.stats);
    $("breakdown").innerHTML = table ? "<h2>Slowest first</h2>" + table : "";
    showScreen("results");
    $("again-btn").focus();
}

async function showRecords() {
    renderAccount();
    $("records-where").textContent = user
        ? "Records are saved to your account."
        : "Records are saved in this browser only.";

    const games = await loadGames();
    if (games.length === 0) {
        $("records-content").innerHTML = "<p>No games played yet. Finish a game and it will show up here.</p>";
        showScreen("records");
        return;
    }

    // Personal bests, grouped by settings + duration
    const groups = {};
    for (const g of games) {
        const key = g.label + "|" + g.duration;
        if (!groups[key]) groups[key] = { label: g.label, duration: g.duration, best: 0, played: 0, total: 0 };
        groups[key].best = Math.max(groups[key].best, g.score);
        groups[key].played += 1;
        groups[key].total += g.score;
    }
    let html = "<h2>Personal bests</h2><table><tr><th>Settings</th><th class='num'>Time</th><th class='num'>Games</th><th class='num'>Avg</th><th class='num'>Best</th></tr>";
    for (const grp of Object.values(groups).sort((a, b) => b.played - a.played)) {
        html += `<tr><td>${escapeHtml(grp.label)}</td><td class="num">${grp.duration}s</td><td class="num">${grp.played}</td>` +
            `<td class="num">${(grp.total / grp.played).toFixed(1)}</td><td class="num"><b>${grp.best}</b></td></tr>`;
    }
    html += "</table>";

    // Speed per problem type, across all games
    const allStats = {};
    for (const g of games) {
        for (const [type, entry] of Object.entries(g.stats || {})) {
            if (!allStats[type]) allStats[type] = { count: 0, ms: 0 };
            allStats[type].count += entry.count;
            allStats[type].ms += entry.ms;
        }
    }
    html += "<h2>Speed by problem type (slowest first)</h2>" + speedTable(allStats);

    // Most recent games
    html += "<h2>Recent games</h2><table><tr><th>Date</th><th>Settings</th><th class='num'>Time</th><th class='num'>Score</th></tr>";
    for (const g of games.slice(-20).reverse()) {
        const date = new Date(g.date).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
        html += `<tr><td>${date}</td><td>${escapeHtml(g.label)}</td><td class="num">${g.duration}s</td><td class="num">${g.score}</td></tr>`;
    }
    html += "</table>";

    $("records-content").innerHTML = html;
    showScreen("records");
}


// ============================================================
// Wire up buttons and inputs
// ============================================================

buildTrickList();
loadSettingsForm();
updateModeView();

for (const radio of document.querySelectorAll('input[name="mode"]')) {
    radio.addEventListener("change", updateModeView);
}
$("start-btn").addEventListener("click", startGame);
$("again-btn").addEventListener("click", startGame);
$("settings-btn").addEventListener("click", () => showScreen("setup"));
$("records-btn").addEventListener("click", showRecords);
$("back-btn").addEventListener("click", () => showScreen("setup"));
$("answer").addEventListener("input", checkAnswer);

$("clear-btn").addEventListener("click", async () => {
    if (confirm("Delete all saved games? This can't be undone.")) {
        await clearGames();
        showRecords();
    }
});

renderAccount();
if (db) {
    $("signin-btn").addEventListener("click", signIn);
    $("signup-btn").addEventListener("click", signUp);
    $("signout-btn").addEventListener("click", signOut);

    // Runs on page load (with a saved session) and on every sign in / sign out
    db.auth.onAuthStateChange((event, session) => {
        user = session ? session.user : null;
        renderAccount();
        // setTimeout: Supabase asks not to call it again from inside this callback
        setTimeout(async () => {
            if (user) await uploadLocalGames();
            if (!$("records").hidden) showRecords();
        }, 0);
    });
}

// Esc during a game quits back to the setup screen (the game isn't saved)
document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !$("game").hidden) {
        clearInterval(timerId);
        showScreen("setup");
    }
});
