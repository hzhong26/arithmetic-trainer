# Arithmetic Trainer

A timed mental math speed drill: solve as many arithmetic problems as you can before the clock runs out. It has the classic minimal speed-drill layout, plus **trick drills** for practicing one mental math technique at a time, and **records** that track your scores and speed.

**▶ Play it here: https://hzhong26.github.io/arithmetic-trainer/**

Inspired by the [Arithmetic Game](https://arithmetic.zetamac.com/) and the [Zetamac guide by Geoffrey Lee](https://www.geoffreylee.me/zetamac). This is an independent project and isn't affiliated with either.

## Features

### Standard mode
- Addition, subtraction, multiplication and division with adjustable number ranges
- Subtraction and division are addition and multiplication in reverse, so answers are always whole numbers
- Durations from 30 seconds to 10 minutes
- Type the answer and the next problem appears right away. There's no Enter key to press.
- Press **Esc** to quit a game without saving it

### Trick drills
Pick one or more tricks, and only problems built for those tricks will appear. You can also turn on a hint that shows under each problem.

| Trick | Example | Hint |
|---|---|---|
| Addition with carries | 58 + 67 | Add left to right: tens first, then units, then add the carry |
| Subtract from 100 / 1000 | 1000 – 384 | Every digit pairs up to 9, except the last, which pairs up to 10 |
| Subtract across a hundred | 203 – 57 | Subtract down to the hundred first, then subtract what's left |
| Multiply by 11 | 47 × 11 | Split the digits and put their sum in the middle |
| Multiply by 12 | 36 × 12 | ×10, plus ×2 |
| Multiply by 5 or 25 | 68 × 25 | ×5 = halve then ×10; ×25 = divide by 4 then ×100 |
| Round then adjust | 49 × 7 | Round to the nearest ten, multiply, then fix the difference |
| Split 2-digit × 1-digit | 73 × 6 | Multiply tens and units separately, then add |
| Squares 11–32 | 27 × 27 | Use a nearby easy square: (a ± b)² = a² ± 2ab + b² |
| Squares ending in 5 | 65 × 65 | Tens digit × (tens digit + 1), then write 25 after it |
| Same tens, units add to 10 | 43 × 47 | Tens × (tens + 1), then write units × units as two digits |
| Divide by 9 | 783 ÷ 9 | Estimate, then check: 9 × answer must match |
| Divide by 11 | 517 ÷ 11 | Reverse the ×11 trick |

### Records
- **After each game:** your score, whether it's a new personal best, and your average time per problem type, slowest first
- **Records page:**
  - your personal bests for each combination of settings and duration
  - your average speed on every problem type, which shows which tricks to practice
  - your last 20 games
- **Without an account:** records are saved in your browser
- **With an account:** create one on the Records page and your records are saved online, so they follow you to any device. Games already saved in your browser are uploaded the first time you sign in.

## How it's built

Plain **HTML, CSS and JavaScript**, with no framework and no build step. Online accounts use [Supabase](https://supabase.com), and the site is hosted on GitHub Pages.

| File | What it does |
|---|---|
| `index.html` | The four screens: setup, game, results and records |
| `style.css` | The layout and sizes |
| `script.js` | Problem generation, the trick drills, the timer, scoring and records |
| `config.js` | The Supabase project URL and public key. Leave them empty to turn accounts off. |
| `supabase-setup.sql` | Creates the `games` table and the rules that keep each user's games private |
| `learning/` | My first hand-written version, from learning HTML step by step |

### Adding a new trick
Each trick is one entry in the `TRICKS` list in `script.js`:

```js
{
    id: "mul-15",
    name: "Multiply by 15",
    example: "24 × 15",
    hint: "×10, plus half of that.",
    make() {
        const x = randInt(12, 99);
        return { text: `${x} × 15`, answer: x * 15 };
    },
},
```

It shows up on the setup screen and in the records automatically.

## Running it yourself

1. Clone the repo and open `index.html` with a local server, such as the **Live Server** extension in VS Code.
2. To use your own online accounts, which are optional:
   1. Create a free project at [supabase.com](https://supabase.com).
   2. Run `supabase-setup.sql` in the **SQL Editor**.
   3. Under **Authentication → URL Configuration**, set **Site URL** to your site's address.
   4. Put your **Project URL** and **publishable (anon) key** in `config.js`. Never use the `service_role` or secret key here.
