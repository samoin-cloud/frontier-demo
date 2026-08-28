/* FRONTIER — Data layer (Smart Toys edition)
   50 curated smart toys for ages 1–10 · 8 play categories · 32 play brands.
   Deterministic seeds keep the catalog identical on every load. */
window.DATA = (function () {
  'use strict';

  /* seeded RNG */
  function hash(str) { var x = 2166136261; for (var i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  function rng(seedStr) { var t = typeof seedStr === 'number' ? seedStr : hash(seedStr); return function () { t += 0x6D2B79F5; var r = Math.imul(t ^ t >>> 15, 1 | t); r ^= r + Math.imul(r ^ r >>> 7, 61 | r); return ((r ^ r >>> 14) >>> 0) / 4294967296; }; }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function intR(r, a, b) { return a + Math.floor(r() * (b - a + 1)); }

  /* ---------- play categories ---------- */
  var CATS = [
    { slug: 'toy-cars', name: 'Smart Toy Cars', icon: 'car', hue: 12, subs: ['Ride-Ons', 'RC Cars', 'Track Sets', 'Garages & Playsets'] },
    { slug: 'robots', name: 'Learning Robots', icon: 'robot', hue: 262, subs: ['First Robots', 'Coding Robots', 'Battle Bots', 'Companion Bots'] },
    { slug: 'plush', name: 'Interactive Plush', icon: 'plush', hue: 320, subs: ['Soothing Plush', 'Talk & Learn Plush', 'Night-Light Friends', 'Pet Pals'] },
    { slug: 'stem', name: 'STEM & Building', icon: 'blocks', hue: 205, subs: ['Building Sets', 'Science Kits', 'Circuit & Coding', 'Math & Logic'] },
    { slug: 'sensory', name: 'Musical & Sensory', icon: 'music', hue: 145, subs: ['First Instruments', 'Light & Sound', 'Textured Play', 'Bath Toys'] },
    { slug: 'smart-games', name: 'AR & Smart Games', icon: 'puzzle', hue: 45, subs: ['AR Globes & Maps', 'Interactive Puzzles', 'Screen-Free Games', 'Family Game Night'] },
    { slug: 'flyers', name: 'Drones & Flyers', icon: 'drone', hue: 174, subs: ['First Flyers', 'Camera Drones for Kids', 'Indoor Hover Toys', 'Rocket Launchers'] },
    { slug: 'dolls-figures', name: 'Smart Dolls & Figures', icon: 'sparkles', hue: 288, subs: ['Talk & Respond Dolls', 'Action Figures', 'Playsets', 'Collectibles'] }
  ];
  function catBySlug(s) { for (var i = 0; i < CATS.length; i++) if (CATS[i].slug === s) return CATS[i]; }

  var BRANDS = ['TinyTorque', 'BrightBloom', 'WonderBot', 'CuddleTech', 'PlayForge', 'KidSpark', 'MiniFlyer', 'DreamDoll Co', 'LittleLumens', 'GeoPlay', 'SnapKit', 'Zephyr Toys', 'Honey Hive Toys', 'Bolt & Bloom', 'Pico Bots', 'Marbel', 'Toodle', 'NimbleNest', 'Cubby', 'Drift Junior', 'Loopy Lab', 'Starling Play', 'Moss & Moon', 'Comet Kids', 'Fable Forge', 'Tinker Tots', 'Juno Joy', 'Beacon Toys', 'Wander Wild', 'Sunny Side', 'Playlab Nine', 'Glow Guild'];

  var COLORS = [
    { name: 'Sunshine Yellow', hex: '#F7C948' }, { name: 'Bubblegum Pink', hex: '#F58FB0' },
    { name: 'Sky Blue', hex: '#58B7E8' }, { name: 'Mint', hex: '#7ED9A7' },
    { name: 'Lavender', hex: '#B39BE8' }, { name: 'Coral', hex: '#FF6B6B' },
    { name: 'Cloud White', hex: '#F6F4EF' }, { name: 'Honey Orange', hex: '#F49E4C' }
  ];
  var CONNECT = ['Bluetooth', 'App-connected', 'USB-C rechargeable', 'Screen-free play', 'Wi-Fi updates', 'Remote control'];

  /* ---------- 50 curated smart toys ---------- */
  /* n name · b brand · c category slug · s subcategory · p price · op oldPrice · r rating · rv reviews
     a [ageMin,ageMax] · bat playtime hours · col color names · st stock · bd extra badges · tag line · spec standout */
  var T = [
    // — Smart Toy Cars —
    { n: 'Turbo Tot Ride-On Smart Car', b: 'TinyTorque', c: 'toy-cars', s: 'Ride-Ons', p: 189, op: 239, r: 4.8, rv: 2140, a: [1, 3], bat: 3, col: ['Sunshine Yellow', 'Coral', 'Sky Blue'], st: 'in', bd: ['new', 'hot'], tag: 'A first car with a parental remote, soft-start wheels and a horn toddlers cannot stop pressing.', spec: 'Parental remote control + soft-start wheels' },
    { n: 'Drift Junior RC Pro', b: 'Drift Junior', c: 'toy-cars', s: 'RC Cars', p: 79, op: 99, r: 4.6, rv: 1890, a: [6, 10], bat: 1.5, col: ['Sky Blue', 'Honey Orange'], st: 'in', bd: [], tag: 'A hobby-grade drifter scaled for kids — proportional steering, stunt mode and swappable batteries.', spec: 'Proportional steering with stunt mode' },
    { n: 'Rally Legend RC Truck', b: 'Zephyr Toys', c: 'toy-cars', s: 'RC Cars', p: 64.99, op: null, r: 4.5, rv: 963, a: [6, 10], bat: 1.5, col: ['Coral', 'Cloud White'], st: 'in', bd: [], tag: 'All-terrain rally truck that shrugs off grass, gravel and the stairs incident of last spring.', spec: 'All-terrain tires with oil-filled feel dampers' },
    { n: 'Loop Champion Motorized Track', b: 'Loopy Lab', c: 'toy-cars', s: 'Track Sets', p: 54.99, op: 69, r: 4.4, rv: 1204, a: [4, 8], bat: 0, col: ['Sunshine Yellow', 'Sky Blue'], st: 'in', bd: ['sale'], tag: 'A motorized booster that flings cars through 6 meters of glow-in-the-dark loop track.', spec: 'Motorized booster + glow track' },
    { n: 'Speedy Shapes Garage Sorter', b: 'BrightBloom', c: 'toy-cars', s: 'Garages & Playsets', p: 39.99, op: null, r: 4.7, rv: 2310, a: [1, 3], bat: 0, col: ['Mint', 'Sunshine Yellow'], st: 'in', bd: [], tag: 'Shape-sorting garage with three chunky cars — early matching skills disguised as vroom-vroom.', spec: 'Shape sorting + elevator ramp' },
    { n: 'City Hopper School Bus RC', b: 'Toodle', c: 'toy-cars', s: 'RC Cars', p: 44.99, op: 54, r: 4.3, rv: 540, a: [3, 6], bat: 2, col: ['Sunshine Yellow'], st: 'low', bd: [], tag: 'A gentle two-button remote bus with real doors, working lights and four cheerful passengers.', spec: 'Two-button toddler remote, working doors' },
    { n: 'Rock Crawler Junior', b: 'TinyTorque', c: 'toy-cars', s: 'RC Cars', p: 59.99, op: null, r: 4.6, rv: 870, a: [5, 9], bat: 1.5, col: ['Honey Orange', 'Mint'], st: 'in', bd: [], tag: 'Four-wheel drive, triple-linked axles and a body that treats the sofa as a mountain.', spec: '4WD with triple-linked crawler axles' },
    // — Learning Robots —
    { n: 'WonderBot Coding Buddy', b: 'WonderBot', c: 'robots', s: 'Coding Robots', p: 89, op: 119, r: 4.9, rv: 3120, a: [5, 8], bat: 6, col: ['Lavender', 'Sky Blue'], st: 'in', bd: ['hot', 'sale'], tag: 'Screen-optional coding robot: kids snap command tiles into sequences and WonderBot obeys — homework energy, recess soul.', spec: 'Screen-free tile coding + 40 puzzle missions' },
    { n: 'Wobble My First Robot', b: 'BrightBloom', c: 'robots', s: 'First Robots', p: 49.99, op: null, r: 4.7, rv: 1560, a: [1, 3], bat: 4, col: ['Mint', 'Bubblegum Pink'], st: 'in', bd: [], tag: 'A wobbly, bump-and-turn companion with light-up eyes, built for chubby hands and gentle tumbles.', spec: 'Bump-and-go movement, giggle responses' },
    { n: 'Pathfinder Maze Bot', b: 'PlayForge', c: 'robots', s: 'Coding Robots', p: 59.99, op: 74, r: 4.5, rv: 780, a: [5, 9], bat: 5, col: ['Sky Blue', 'Cloud White'], st: 'in', bd: ['sale'], tag: 'Program step-by-step routes with arrow keys on its back — maze cards get harder as kids level up.', spec: 'On-back arrow programming, 62 maze cards' },
    { n: 'Clash Bots Arena Duo', b: 'KidSpark', c: 'robots', s: 'Battle Bots', p: 99, op: 129, r: 4.6, rv: 1044, a: [6, 10], bat: 1.5, col: ['Coral', 'Sky Blue'], st: 'in', bd: [], tag: 'Two battling bots, one fold-out arena, and instant rematches — siblings finally have a rules-based rivalry.', spec: 'Two IR battle bots + fold-out arena' },
    { n: 'CuddleBot Companion', b: 'CuddleTech', c: 'robots', s: 'Companion Bots', p: 74.99, op: null, r: 4.8, rv: 1330, a: [2, 5], bat: 8, col: ['Lavender', 'Mint'], st: 'in', bd: [], tag: 'A soft-sided robot that remembers names, plays hide-and-seek, and naps when naptime matters.', spec: 'Name recognition + hide-and-seek mode' },
    { n: 'StoryBot Tale Teller', b: 'Fable Forge', c: 'robots', s: 'Companion Bots', p: 64.99, op: null, r: 4.5, rv: 690, a: [3, 7], bat: 7, col: ['Cloud White', 'Honey Orange'], st: 'in', bd: [], tag: 'A pocket storyteller robot with 120 illustrated tales — and it accepts kid-recorded endings.', spec: '120 stories + record-your-own endings' },
    // — Interactive Plush —
    { n: 'Dreamy the Bedtime Bear', b: 'CuddleTech', c: 'plush', s: 'Night-Light Friends', p: 39.99, op: 49, r: 4.9, rv: 4260, a: [0, 2], bat: 10, col: ['Cloud White', 'Lavender'], st: 'in', bd: ['hot'], tag: 'A breathing-light bear that fades with real slow-breath rhythm — bedtime, minus the tears.', spec: 'Breathing light rhythm + 6 lullabies' },
    { n: 'Snuggle Sense Koala', b: 'CuddleTech', c: 'plush', s: 'Soothing Plush', p: 34.99, op: null, r: 4.8, rv: 1880, a: [0, 2], bat: 8, col: ['Cloud White', 'Mint'], st: 'in', bd: [], tag: 'Heartbeat-soothe koala that calms on contact — parents call it the third pair of arms.', spec: 'Heartbeat + white-noise soothe on hug' },
    { n: 'ABC Chat Bunny', b: 'BrightBloom', c: 'plush', s: 'Talk & Learn Plush', p: 44.99, op: 59, r: 4.6, rv: 1420, a: [2, 4], bat: 6, col: ['Bubblegum Pink', 'Cloud White'], st: 'in', bd: ['sale'], tag: 'A chatty bunny that turns letters, colors and counting into call-and-response play.', spec: 'Letters, colors & counting games' },
    { n: 'Puppy Pal Mojo', b: 'Toodle', c: 'plush', s: 'Pet Pals', p: 54.99, op: null, r: 4.5, rv: 980, a: [2, 5], bat: 5, col: ['Honey Orange', 'Cloud White'], st: 'in', bd: [], tag: 'A leash-trained plush puppy that walks, barks at his ball and never needs a backyard.', spec: 'Walks on leash, responds to his ball' },
    { n: 'Lullaby Lamb', b: 'Moss & Moon', c: 'plush', s: 'Soothing Plush', p: 29.99, op: null, r: 4.7, rv: 1610, a: [0, 2], bat: 12, col: ['Cloud White'], st: 'in', bd: [], tag: 'A wool-soft lamb with crib-clip and five gentle lullabies at a hearing-safe volume.', spec: 'Crib clip + 85dB volume cap' },
    { n: 'Ollie the Emotions Otter', b: 'Starling Play', c: 'plush', s: 'Talk & Learn Plush', p: 36.99, op: null, r: 4.8, rv: 1140, a: [3, 6], bat: 6, col: ['Sky Blue', 'Mint'], st: 'in', bd: ['new'], tag: 'Ollie helps kids name big feelings with card prompts — screen-free emotional intelligence.', spec: '24 feelings cards + gentle prompts' },
    { n: 'Galaxy Nebula Bear', b: 'LittleLumens', c: 'plush', s: 'Night-Light Friends', p: 42, op: 55, r: 4.6, rv: 720, a: [3, 8], bat: 9, col: ['Lavender', 'Sky Blue'], st: 'in', bd: [], tag: 'Projects a calm starfield on the ceiling and tells one constellation fact per night.', spec: 'Star projector + 30 constellation facts' },
    // — STEM & Building —
    { n: 'BrickLab Motorized Set', b: 'PlayForge', c: 'stem', s: 'Building Sets', p: 69, op: 89, r: 4.8, rv: 2010, a: [5, 10], bat: 0, col: ['Sunshine Yellow', 'Coral', 'Sky Blue'], st: 'in', bd: ['hot', 'sale'], tag: '420 pieces, two motors and a cranky-satisfying crank — builds that move, spin and lift.', spec: '420 pieces, 2 motors, 25 guided builds' },
    { n: 'Volcano Lab Chemistry Duo', b: 'KidSpark', c: 'stem', s: 'Science Kits', p: 34.99, op: null, r: 4.6, rv: 890, a: [8, 10], bat: 0, col: ['Coral', 'Honey Orange'], st: 'in', bd: [], tag: 'Eruptions, color-change reactions and goggles sized for small scientists — mess contained, wonder not.', spec: '15 safe experiments + lab tools' },
    { n: 'SnapLight Circuits Jr', b: 'SnapKit', c: 'stem', s: 'Circuit & Coding', p: 49.99, op: 64, r: 4.7, rv: 1330, a: [6, 10], bat: 0, col: ['Sunshine Yellow', 'Sky Blue'], st: 'in', bd: [], tag: 'Snap-together circuits that light, spin and sing — 100 projects with zero solder and zero boredom.', spec: '100 snap circuit projects' },
    { n: 'Robot Mouse Coding Maze', b: 'PlayForge', c: 'stem', s: 'Circuit & Coding', p: 59.99, op: null, r: 4.5, rv: 970, a: [4, 8], bat: 0, col: ['Lavender', 'Mint'], st: 'low', bd: [], tag: 'Build a maze, program the mouse, celebrate the cheese — first coding steps without a screen.', spec: 'Programmable steps + 16 maze grids' },
    { n: 'Math Magician Balance Board', b: 'BrightBloom', c: 'stem', s: 'Math & Logic', p: 29.99, op: null, r: 4.4, rv: 540, a: [3, 6], bat: 0, col: ['Sunshine Yellow', 'Mint'], st: 'in', bd: [], tag: 'A self-correcting balance scale that makes adding feel like a playground trick.', spec: 'Self-correcting number balance' },
    { n: 'Solar Rover Kit', b: 'SnapKit', c: 'stem', s: 'Building Sets', p: 27.99, op: null, r: 4.5, rv: 810, a: [6, 10], bat: 0, col: ['Cloud White', 'Honey Orange'], st: 'in', bd: [], tag: 'Build it once, then let the sun drive it — a rover that runs on pure backyard sunshine.', spec: 'Solar panel drivetrain, no batteries' },
    { n: 'Magnetic Tiles Glow Set', b: 'GeoPlay', c: 'stem', s: 'Building Sets', p: 54.99, op: 69, r: 4.9, rv: 2760, a: [3, 8], bat: 0, col: ['Bubblegum Pink', 'Sky Blue', 'Sunshine Yellow'], st: 'in', bd: ['hot', 'sale'], tag: 'Translucent magnetic tiles that glow under the included light — castles by day, lantern cities by night.', spec: '72 glow tiles + light wand' },
    // — Musical & Sensory —
    { n: 'Tiny Tempo Drum Set', b: 'Honey Hive Toys', c: 'sensory', s: 'First Instruments', p: 44.99, op: null, r: 4.6, rv: 990, a: [1, 4], bat: 0, col: ['Coral', 'Sky Blue'], st: 'in', bd: [], tag: 'Three tuned drums, a cymbal and two mallets — with a volume cap parents will thank us for.', spec: 'Tuned trio + 85dB cap' },
    { n: 'Rainbow Xylophone Bench', b: 'BrightBloom', c: 'sensory', s: 'First Instruments', p: 29.99, op: null, r: 4.7, rv: 1230, a: [1, 4], bat: 0, col: ['Bubblegum Pink', 'Sunshine Yellow'], st: 'in', bd: [], tag: 'Eight color-matched bars, two mallets and a hammer bench for when melody becomes construction.', spec: '8-note rainbow bars + hammer bench' },
    { n: 'Glow & Go Sensory Ball', b: 'LittleLumens', c: 'sensory', s: 'Light & Sound', p: 19.99, op: null, r: 4.5, rv: 1520, a: [0, 2], bat: 20, col: ['Sky Blue', 'Bubblegum Pink'], st: 'in', bd: [], tag: 'Lights up and giggles on every bounce — cause and effect in its most bounceable form.', spec: 'Impact-activated lights + giggle' },
    { n: 'Bubble Pop Symphony Pad', b: 'Sunny Side', c: 'sensory', s: 'Textured Play', p: 24.99, op: 32, r: 4.6, rv: 870, a: [1, 5], bat: 0, col: ['Lavender', 'Mint'], st: 'in', bd: ['sale'], tag: 'Every pop plays the next note — a washable symphony for fidgety fingers.', spec: 'Musical pop-it surface, wipe-clean' },
    { n: 'Splash Lights Bath Whale', b: 'Toodle', c: 'sensory', s: 'Bath Toys', p: 17.99, op: null, r: 4.4, rv: 1340, a: [0, 3], bat: 0, col: ['Sky Blue'], st: 'in', bd: [], tag: 'Water-activated whale that lights up the tub — no buttons, no batteries, no mold trap.', spec: 'Water-activated, fully sealed' },
    { n: 'Texture Tale Busy Board', b: 'NimbleNest', c: 'sensory', s: 'Textured Play', p: 49.99, op: 64, r: 4.8, rv: 1130, a: [1, 4], bat: 0, col: ['Honey Orange', 'Mint'], st: 'in', bd: ['sale'], tag: 'Zippers, buckles, laces and latches on a travel board — quiet-hands skills for restaurants and flights.', spec: '12 real-life fasteners, travel size' },
    // — AR & Smart Games —
    { n: 'Atlas AR Interactive Globe', b: 'GeoPlay', c: 'smart-games', s: 'AR Globes & Maps', p: 74.99, op: 99, r: 4.8, rv: 2240, a: [4, 10], bat: 0, col: ['Sky Blue', 'Cloud White'], st: 'in', bd: ['hot', 'sale'], tag: 'Tap any country to hear music, animals and 1000 facts — geography that feels like a treasure hunt.', spec: '1000+ facts via tap + free AR app' },
    { n: 'Puzzle Glow Light Panel', b: 'LittleLumens', c: 'smart-games', s: 'Interactive Puzzles', p: 39.99, op: null, r: 4.5, rv: 660, a: [3, 7], bat: 6, col: ['Cloud White', 'Lavender'], st: 'in', bd: [], tag: 'A light panel that celebrates each placed piece and quietly coaches the stubborn last corner.', spec: 'Light-guided hints, 24 puzzles' },
    { n: 'Treasure Logic Pirates', b: 'Fable Forge', c: 'smart-games', s: 'Screen-Free Games', p: 27.99, op: null, r: 4.6, rv: 720, a: [5, 9], bat: 0, col: ['Sunshine Yellow', 'Coral'], st: 'in', bd: [], tag: 'A branching logic adventure in a book-shaped box — map, compass and zero screens.', spec: '48 logic challenges + compass' },
    { n: 'QuizWhiz Family Trivia', b: 'KidSpark', c: 'smart-games', s: 'Family Game Night', p: 34.99, op: 44, r: 4.5, rv: 930, a: [6, 10], bat: 10, col: ['Honey Orange', 'Sky Blue'], st: 'in', bd: ['sale'], tag: 'Hand-held buzzers, 1500 kid-calibrated questions and merciful grown-up rounds.', spec: '4 buzzers + 1500 questions' },
    { n: 'Shape Shuffle Magic Board', b: 'BrightBloom', c: 'smart-games', s: 'Interactive Puzzles', p: 24.99, op: null, r: 4.4, rv: 580, a: [2, 5], bat: 0, col: ['Mint', 'Bubblegum Pink'], st: 'in', bd: [], tag: 'Color-mixing shapes that reveal hidden pictures when the right pairs meet.', spec: '60 hidden-picture challenges' },
    { n: 'Galaxy Projector Explorer', b: 'LittleLumens', c: 'smart-games', s: 'AR Globes & Maps', p: 29.99, op: null, r: 4.3, rv: 640, a: [3, 8], bat: 8, col: ['Lavender', 'Cloud White'], st: 'low', bd: [], tag: 'A projector dome with constellation stories narrated by a very dramatic robot voice.', spec: '24 constellation stories + dome' },
    // — Drones & Flyers —
    { n: 'SkyPals First Flyer', b: 'MiniFlyer', c: 'flyers', s: 'First Flyers', p: 39.99, op: 54, r: 4.6, rv: 1180, a: [3, 7], bat: 0.5, col: ['Sunshine Yellow', 'Sky Blue'], st: 'in', bd: ['sale'], tag: 'A caged-ball flyer that bounces off walls and ceilings — indoor flight with zero pilot licenses.', spec: 'Full-coverage cage + one-key takeoff' },
    { n: 'MiniFlyer Cam Drone', b: 'MiniFlyer', c: 'flyers', s: 'Camera Drones for Kids', p: 79.99, op: 99, r: 4.5, rv: 1420, a: [8, 10], bat: 0.5, col: ['Sky Blue', 'Honey Orange'], st: 'in', bd: [], tag: 'Altitude hold, headless mode and a 1080p camera — a real first drone with training wheels.', spec: '1080p camera + altitude hold' },
    { n: 'HoverOrb Indoor UFO', b: 'Comet Kids', c: 'flyers', s: 'Indoor Hover Toys', p: 29.99, op: null, r: 4.4, rv: 990, a: [4, 9], bat: 0.5, col: ['Lavender', 'Mint'], st: 'in', bd: [], tag: 'Hand-guided hover orb with motion sensors — the remote is your palm.', spec: 'Palm-sensor guidance, auto-collide safe' },
    { n: 'Rocket Launch Lab', b: 'KidSpark', c: 'flyers', s: 'Rocket Launchers', p: 34.99, op: null, r: 4.7, rv: 860, a: [6, 10], bat: 0, col: ['Coral', 'Cloud White'], st: 'in', bd: [], tag: 'Air-pressure rockets that soar 30 meters and land for the next countdown — physics at full volume.', spec: '30m air-pressure launches, 3 rockets' },
    { n: 'Flash Stunt Copter', b: 'Comet Kids', c: 'flyers', s: 'Indoor Hover Toys', p: 34.99, op: 44, r: 4.3, rv: 610, a: [5, 9], bat: 0.5, col: ['Honey Orange', 'Sky Blue'], st: 'out', bd: [], tag: 'A stunt helicopter with LED trails — flips, spirals and light shows in the living room.', spec: 'LED trails + stunt flip button' },
    // — Smart Dolls & Figures —
    { n: 'Luna the Ask-Me Doll', b: 'DreamDoll Co', c: 'dolls-figures', s: 'Talk & Respond Dolls', p: 59.99, op: 79, r: 4.7, rv: 1670, a: [3, 6], bat: 6, col: ['Bubblegum Pink', 'Lavender'], st: 'in', bd: ['sale'], tag: 'Luna answers questions, sings duets and remembers your child\'s favorite color.', spec: 'Voice recognition + 300 phrases' },
    { n: 'Hero Squad Action Trio', b: 'PlayForge', c: 'dolls-figures', s: 'Action Figures', p: 29.99, op: null, r: 4.5, rv: 820, a: [4, 9], bat: 0, col: ['Coral', 'Sky Blue', 'Sunshine Yellow'], st: 'in', bd: [], tag: 'Three poseable heroes with light-up emblems and a comic that gives each one a backstory.', spec: 'Light-up emblems + origin comic' },
    { n: 'Dreamhouse Smart Playset', b: 'DreamDoll Co', c: 'dolls-figures', s: 'Playsets', p: 89.99, op: 119, r: 4.8, rv: 2480, a: [3, 8], bat: 0, col: ['Bubblegum Pink', 'Lavender', 'Cloud White'], st: 'in', bd: ['hot', 'sale'], tag: 'Rooms that light up as dolls walk in — a two-story smart home for Very Busy Schedules.', spec: 'Motion-lit rooms + 20 accessories' },
    { n: 'Melody Ballerina Doll', b: 'Juno Joy', c: 'dolls-figures', s: 'Talk & Respond Dolls', p: 34.99, op: null, r: 4.6, rv: 940, a: [4, 8], bat: 5, col: ['Bubblegum Pink', 'Cloud White'], st: 'in', bd: [], tag: 'She twirls to the music your child claps — tempo-following dance with a graceful curtsy.', spec: 'Clap-tempo following dance mode' },
    { n: 'Dino Roar Figure Duo', b: 'Wander Wild', c: 'dolls-figures', s: 'Action Figures', p: 24.99, op: null, r: 4.4, rv: 700, a: [3, 7], bat: 0, col: ['Mint', 'Honey Orange'], st: 'in', bd: [], tag: 'Squeeze-friendly dinos with fossil-finding roar mode — paleontology for the toy box.', spec: 'Roar mode + 6 fossil dig cards' },
    { n: 'Mystery Vault Collectibles', b: 'Glow Guild', c: 'dolls-figures', s: 'Collectibles', p: 19.99, op: null, r: 4.3, rv: 1520, a: [5, 10], bat: 0, col: ['Lavender', 'Sky Blue'], st: 'in', bd: ['limited'], tag: 'Glow-in-the-dark mystery figures with a digital collection album — trading card energy, toy box form.', spec: '12 to collect + glow vault' }
  ];

  var PRODUCTS = T.map(function (d, i) {
    var r = rng('toy:' + i + ':' + d.n);
    var op = d.op || null;
    var disc = op ? Math.round((1 - d.p / op) * 100) : 0;
    var daysAgo = intR(r, 3, 380);
    var views = intR(r, 300, 42000);
    var badges = (d.bd || []).slice();
    if (disc > 0 && badges.indexOf('sale') === -1) badges.unshift('sale');
    if (daysAgo < 45 && badges.indexOf('new') === -1) badges.push('new');
    var connPool = { 'toy-cars': ['Remote control', 'USB-C rechargeable'], 'robots': ['Bluetooth', 'App-connected', 'USB-C rechargeable'], 'plush': ['Bluetooth', 'USB-C rechargeable', 'Screen-free play'], 'stem': ['Screen-free play', 'App-connected'], 'sensory': ['Screen-free play', 'USB-C rechargeable'], 'smart-games': ['App-connected', 'Screen-free play'], 'flyers': ['Remote control', 'USB-C rechargeable'], 'dolls-figures': ['Bluetooth', 'USB-C rechargeable', 'App-connected'] }[d.c] || ['Bluetooth'];
    var nc = intR(r, 1, connPool.length);
    var conn = connPool.slice(0, nc);
    if (CONNECT.some(function (x) { return conn.indexOf(x) === -1; })) { /* noop */ }
    return {
      id: i + 1,
      slug: d.n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      name: d.n, brand: d.b, category: d.c, subcategory: d.s,
      price: d.p, oldPrice: op, discount: disc,
      rating: d.r, reviews: d.rv,
      badges: badges, stock: d.st || 'in', lowCount: intR(r, 2, 7),
      colors: (d.col || ['Sky Blue']).map(function (cn) {
        var f = null;
        for (var ci = 0; ci < COLORS.length; ci++) if (COLORS[ci].name === cn) f = { name: cn, hex: COLORS[ci].hex };
        return f || { name: cn, hex: '#58B7E8' };
      }),
      connectivity: conn, battery: d.bat,
      ageMin: d.a[0], ageMax: d.a[1], ageLabel: 'Ages ' + d.a[0] + '–' + d.a[1],
      weight: (r() * 2 + 0.2).toFixed(2),
      releasedDaysAgo: daysAgo,
      createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10),
      views: views,
      popularity: Math.round(d.rv * 0.6 + views * 0.004 + d.r * 220 + r() * 700),
      featured: r() < 0.3,
      descUseCase: d.tag,
      specs: buildSpecs(d.c, d.bat, d.a, d.spec)
    };
  });

  function buildSpecs(slug, bat, age, standout) {
    var rows = [['Standout', standout || '—'], ['Age range', age[0] + '–' + age[1] + ' years'], ['Playtime', bat > 0 ? bat + ' h per charge' : 'No batteries needed']];
    var byCat = {
      'toy-cars': [['Speed', 'Parent-capped, kid-thrilling'], ['Controls', '2.4GHz remote, anti-interference'], ['Tires', 'Grippy rubber, floor-safe']],
      'robots': [['Coding style', 'Screen-free first, app optional'], ['Sensors', 'Obstacle, line & light sensors'], ['Companion app', 'iOS & Android, no ads']],
      'plush': [['Washable', 'Machine-washable shell, electronics out'], ['Volume', '85dB kid-safe cap'], ['Fabrics', 'Hypoallergenic, recycled fill']],
      'stem': [['Learning goals', 'Engineering, logic & problem solving'], ['Guidebook', 'Illustrated, kid-readable'], ['Materials', 'Food-grade ABS, rounded edges']],
      'sensory': [['Volume limit', '85dB kid-safe cap'], ['Surfaces', 'Wipe-clean & drool-proof'], ['Development', 'Fine motor + cause & effect']],
      'smart-games': [['Players', '1–4 players'], ['Screens', 'Optional app, never required'], ['Skills', 'Logic, geography & memory']],
      'flyers': [['Safety', 'Finger-safe enclosed rotors'], ['Flight tech', 'Altitude hold + one-key land'], ['Charge', 'USB-C, 25 min per flight']],
      'dolls-figures': [['Volume', '85dB cap + headphone jack'], ['Safety', 'No small parts under 3'], ['Play pattern', 'Role play & storytelling']]
    };
    rows = rows.concat(byCat[slug] || []);
    rows.push(['Safety', 'CPSIA · CE certified, BPA-free'], ['Warranty', '2-year FRONTIER play promise'], ['In the Box', 'Toy, quick-start guide, safety sheet']);
    return rows;
  }

  /* ---------- product art (procedural SVG thumbnails) ---------- */
  var SUB_ICON = {
    'Ride-Ons': 'car', 'RC Cars': 'car', 'Track Sets': 'car', 'Garages & Playsets': 'blocks',
    'First Robots': 'robot', 'Coding Robots': 'robot', 'Battle Bots': 'robot', 'Companion Bots': 'robot',
    'Soothing Plush': 'plush', 'Talk & Learn Plush': 'plush', 'Night-Light Friends': 'plush', 'Pet Pals': 'plush',
    'Building Sets': 'blocks', 'Science Kits': 'zap', 'Circuit & Coding': 'cpu', 'Math & Logic': 'puzzle',
    'First Instruments': 'music', 'Light & Sound': 'sun', 'Textured Play': 'plush', 'Bath Toys': 'music',
    'AR Globes & Maps': 'globe', 'Interactive Puzzles': 'puzzle', 'Screen-Free Games': 'gamepad', 'Family Game Night': 'gamepad',
    'First Flyers': 'drone', 'Camera Drones for Kids': 'drone', 'Indoor Hover Toys': 'drone', 'Rocket Launchers': 'zap',
    'Talk & Respond Dolls': 'sparkles', 'Action Figures': 'star', 'Playsets': 'home', 'Collectibles': 'gift'
  };

  function art(p, variantIdx) {
    var cat = catBySlug(p.category) || { hue: 250 };
    variantIdx = variantIdx || 0;
    var r = rng('art:' + p.id + ':' + variantIdx);
    var h = cat.hue + intR(r, -14, 22);
    var h2 = (h + intR(r, 70, 150)) % 360;
    var cx = 110 + intR(r, -16, 16), cy = 104 + intR(r, -12, 12);
    var iconName = SUB_ICON[p.subcategory] || cat.icon;
    var path = FR_ICON_RAW[iconName] || FR_ICON_RAW.package;
    var dots = '';
    for (var d = 0; d < 5; d++) {
      dots += '<circle cx="' + intR(r, 6, 214) + '" cy="' + intR(r, 6, 190) + '" r="' + (r() * 2.6 + .8).toFixed(1) + '" fill="#fff" opacity=".14"/>';
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230 200">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="hsl(' + h + ',72%,62%)"/><stop offset="1" stop-color="hsl(' + h2 + ',74%,46%)"/></linearGradient>' +
      '<radialGradient id="hl" cx=".72" cy=".24" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="230" height="200" fill="url(#g)"/><rect width="230" height="200" fill="url(#hl)"/>' +
      '<g stroke="#ffffff" stroke-opacity=".12" fill="none"><circle cx="' + cx + '" cy="' + cy + '" r="84"/><circle cx="' + cx + '" cy="' + cy + '" r="116" opacity=".7"/></g>' + dots +
      '<g transform="translate(47 40) scale(5.9)" fill="none" stroke="#ffffff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + path + '</g></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* ---------- lookups ---------- */
  var BY_ID = {}, BY_SLUG = {};
  PRODUCTS.forEach(function (p) { BY_ID[p.id] = p; BY_SLUG[p.slug] = p; });
  function byId(id) { return BY_ID[id] || null; }
  function bySlug(s) { return BY_SLUG[s] || null; }
  /* register synthetic catalogue items (gift cards, Care+ plans) on any page */
  function ensurePseudo(p) { if (!BY_ID[p.id]) { PRODUCTS.push(p); BY_ID[p.id] = p; BY_SLUG[p.slug] = p; } return BY_ID[p.id]; }

  function img(p, v) { return art(p, v || 0); }
  function money(n) { try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n); } catch (e) { return '$' + n.toFixed(2); } }

  /* ---------- store picks ---------- */
  var TRENDING = PRODUCTS.slice().sort(function (a, b) { return b.popularity - a.popularity; }).slice(0, 8);
  var NEW_ARRIVALS = PRODUCTS.filter(function (p) { return p.stock !== 'out'; }).sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); }).slice(0, 10);
  var BEST_SELLERS = PRODUCTS.slice().sort(function (a, b) { return (b.reviews * b.rating) - (a.reviews * a.rating); }).slice(0, 12);

  var dealProduct = (function () {
    var deals = PRODUCTS.filter(function (p) { return p.oldPrice && p.stock === 'in'; }).sort(function (a, b) { return b.discount - a.discount; });
    return deals[0] || PRODUCTS[0];
  })();

  function toy(part) {
    var hits = PRODUCTS.filter(function (p) { return p.name.indexOf(part) !== -1 && p.stock === 'in'; });
    return hits[0] || TRENDING[0];
  }
  var heroSlides = [
    { pid: toy('Turbo Tot'), kicker: 'NEW SEASON · AGES 1–3', title: 'The smartest first car in the driveway.', sub: 'A ride-on with a parental remote, soft-start wheels and a horn built for endless pressing. Safety-tested down to the smallest screw.' },
    { pid: toy('WonderBot'), kicker: 'PLAY THAT TEACHES', title: 'Coding they can hold in their hands.', sub: 'WonderBot turns sequences, logic and patience into a game — screen optional, giggles mandatory. For ages 5 to 8.' },
    { pid: toy('Dreamy'), kicker: 'BEDTIME, SOLVED', title: 'The bear that breathes with them.', sub: 'Dreamy fades a calm light in true slow-breath rhythm and hums six lullabies at a hearing-safe volume. Ages 0 to 2.' },
    { pid: toy('Atlas AR'), kicker: 'AGES 4–10', title: 'The whole world, one tap away.', sub: 'Atlas is the globe that answers back — music, animals and a thousand facts for every curious finger.' }
  ];

  /* ---------- blog ---------- */
  var BCATS = ['Play Trends', 'Reviews', 'Play Ideas', 'Buying Guides', 'Industry Trends'];
  var AUTHORS = [
    { name: 'Maya Chen', role: 'Senior Editor', bio: 'Ten years covering toys and play. Believes the best toy is the one that gets played with twice.' },
    { name: 'Diego Alvarez', role: 'Reviews Lead', bio: 'Crash-tests everything twice, owns more AA batteries than sense.' },
    { name: 'Aisha Okafor', role: 'Staff Writer', bio: 'Stories about how play shapes childhoods — and living rooms.' },
    { name: 'Tom Reinholt', role: 'Play Lab Manager', bio: 'If it lights up, rolls or roars, Tom has dropped it from table height. For science.' },
    { name: 'Priya Raman', role: 'Contributor', bio: 'Explains hard specs in plain language. Ask her about battery doors.' },
    { name: 'Leo Marchetti', role: 'Photography Editor', bio: 'Photographs toys mid-flight; apologizes to the chandeliers.' },
    { name: 'Sana Iqbal', role: 'How-To Editor', bio: 'Turns twelve-step cleanup tutorials into three.' },
    { name: 'Jonas Weber', role: 'Industry Analyst', bio: 'Reads toy-fair tea leaves so you do not have to.' }
  ];
  var BLOG_TITLES = {
    'Play Trends': ['Why Open-Ended Toys Are Winning 2026', 'Screen-Free Is the New Premium: What Changed', 'The Montessori Effect on Smart Toy Design', 'Sustainable Plastics Finally Hit the Toy Aisle', 'AR Toys Grow Up: The Mixed-Reality Playroom', 'The Durability Report Card: Which Toys Survive Siblings'],
    'Reviews': ['We Gave 12 Coding Robots to Real Kids — Here Is the Verdict', 'This $39 RC Car Outruns $150 Ones', 'Review: The Ride-On That Lasts Three Birthdays', 'Five Interactive Plush Toys, One Toddler Test Panel', 'Hands On With the Fastest-Charging Kids Drone', 'The Tiny Robot That Fits a Backpack — Full Test'],
    'Play Ideas': ['Turn a Cardboard Box Into a Racetrack in Ten Minutes', 'Make Any Plush Toy Talk for $15', 'End the Step-On Toy Era: A Living-Room Play Map', 'Make Toy Batteries Last: The Settings That Matter', 'Set Up a Screen-Free Sunday Tonight', 'Clean and Sanitize Smart Toys Like a Professional'],
    'Buying Guides': ['Every Kind of Ride-On, Ranked by Age', 'Which Coding Robot Tier Is Right for Your Kid?', 'Sensory Toy Cheat Sheet: Birth to Age 3', 'Home Play Corner Buying Guide: Safety First', 'Best Budget STEM Kits That Do Not Feel Cheap', 'Toy Storage Systems Explained in Five Minutes'],
    'Industry Trends': ['The Quiet Rise of Toy Subscriptions', 'Chipmakers Discover the Playroom', 'What the New Toy Safety Rules Change by 2027', 'Smart Toys Are Racing to Go Screen-Free — Why Now', 'Retail After Unboxing Videos: How We Shop Next', 'The Second Playroom Economy Comes to Collectibles']
  };
  var PARA_POOL = [
    'The short version: the gap between toy-box marketing and real playroom behavior keeps shrinking, but not evenly across brands — and the details are exactly where the value hides.',
    'We gave each toy to a real test family for two weeks, because a spec sheet never accounts for a four-year-old with opinions and a first-grader with ambitions.',
    'What surprised us was not the headline feature. It was consistency: doing the ordinary thing well, repeatedly, after the hundredth drop on the kitchen floor.',
    'There is a reason veteran parents wait for the second revision. Early units optimize demos; mature units optimize mornings.',
    'Battery results below assume mixed play rather than lab loops, which flatters nobody and matches everybody.',
    'If you only change one thing today, make it this — the difference shows up in minutes, not months.',
    'Competitors will match the features within two quarters. What they will not match as quickly is the fit-and-finish: hinge tension, seam quality, the way switches land where small fingers expect them.',
    'Our advice has not changed since last year, though we say it quieter now that more of you agree: buy for the play pattern, not the party trick.',
    'Under sustained enthusiasm the numbers tell a familiar story — impressive sprints, honest marathons, and one outlier that refuses both.',
    'Two features arrived in the same firmware update; one is delightful and the other feels like an apology for the first. Families, as ever, keep both toggles close.'
  ];
  var BLOG = [];
  (function genBlog() {
    var k = 0;
    BCATS.forEach(function (bc) {
      BLOG_TITLES[bc].forEach(function (title, i) {
        var r = rng('blog:' + bc + ':' + i);
        var author = AUTHORS[k % AUTHORS.length];
        var days = 3 + (k * 4) % 130;
        var date = new Date(Date.now() - days * 86400000);
        var paras = [];
        paras.push(PARA_POOL[(hash(title)) % PARA_POOL.length]);
        paras.push(PARA_POOL[(hash(title) >> 3) % PARA_POOL.length]);
        var tags = [];
        var tp = ['ride-ons', 'robots', 'plush', 'stem', 'sensory', 'screen-free', 'safety', 'batteries', 'ages-1-3', 'ages-8-10'];
        var tn = 2 + intR(r, 0, 2);
        for (var tI = 0; tI < tn; tI++) tags.push(tp[intR(r, 0, tp.length - 1)]);
        BLOG.push({
          id: k + 1,
          title: title, category: bc, tags: tags,
          author: author.name, authorRole: author.role, authorBio: author.bio,
          date: date.toISOString().slice(0, 10),
          readTime: intR(r, 4, 13),
          excerpt: paras[0].slice(0, 140) + '…',
          coverSeed: 'blogcover:' + (k + 1),
          body: buildArticle(paras, title)
        });
        k++;
      });
    });
    function buildArticle(paras, title) {
      var sections = ['The short answer', 'What changed under the hood', 'Real-world testing notes', 'Who should care'];
      var html = '<p class="lead">' + paras[0] + '</p>';
      sections.forEach(function (h, idx) {
        html += '<h2>' + h + '</h2><p>' + paras[(idx + 1) % paras.length] + '</p>';
        if (idx === 1) html += '<ul><li>Better drop protection on every panel</li><li>Double the offline play modes</li><li>Standby drain cut roughly in half</li><li>One genuinely useful new button</li></ul>';
        if (idx === 2) html += '<blockquote>"' + title + ' might read like a niche story. It is not — every playroom eventually inherits whatever wins here." — The FRONTIER Editorial Desk</blockquote><p>' + paras[idx % paras.length] + '</p>';
      });
      return html;
    }
  })();
  var POPULAR_POSTS = BLOG.slice().sort(function (a, b) { return hash(b.title) % 97 - hash(a.title) % 97; }).slice(0, 5);

  /* ---------- testimonials ---------- */
  var QUOTES = [
    'Ordered Tuesday, unboxed Wednesday, and by lunchtime it was the favorite toy in the house.',
    'Support walked my dad through pairing the robot for the twins over chat. Who does that anymore? These folks do.',
    'Exchanged the yellow ride-on for the pink one in four days door-to-door. Zero friction, one very happy toddler.',
    'The battery claims turned out conservative — we get a full week of playtimes from one charge.',
    'It is rare that a store curates instead of dumps. Three toys bought, zero regrets, zero clutter.',
    'Checkout took under a minute and tracking updates actually arrive before I think to check.',
    'The bundle pricing made building a play corner painless. Quality across every item is consistent.',
    'Got a personal note in the box asking if anything fell short. Nothing did — and the packaging was plastic-free.',
    'Their comparison tool saved me from buying the wrong coding robot twice. Genuinely smarter than me.',
    'Swapped a sensory kit size like trading cards as a kid — except faster, with free shipping labels.',
    'The smart globe paired with literally every tablet we own. Thank you, standards.',
    'Prices beat the big-box toy stores by enough that I double-checked they were official. They were.',
    'Customer service answered at 1am while I was packing for a flight and saved the birthday order. Superhuman.',
    'Warranty claim approved in an afternoon with prepaid pickup after our RC car took a stairs incident. This is confidence.',
    'Everything still survives two kids and a golden retriever. Turns out quality control is a feature you can feel.',
    'One newsletter heads-up about a flash sale paid for the whole STEM kit instantly.',
    'They remembered my daughter\'s favorite color from six months ago. The store felt human.',
    'Fourteen toys in this house now share one charging drawer. My sanity finally makes sense.',
    'Lost courier nightmare — support re-shipped the birthday gift before I finished filing the form.',
    'I test toys for a living and still buy here, because they get returns and safety documentation right.',
    'Gift-wrapped, message included, delivered on his birthday despite ordering at 11pm the night before.',
    'The chat bot escalated to a human exactly when it should. Modern retail, done respectfully.'
  ];
  var FIRST = ['Sarah', 'Marcus', 'Elena', 'James', 'Aiko', 'Noah', 'Fatima', 'Lucas', 'Grace', 'Andre', 'Yuki', 'Benjamin', 'Zara', 'Oliver', 'Mia', 'Carlos', 'Priya', 'Daniel', 'Nina', 'Victor', 'Leila', 'Sam'];
  var LAST = ['Whitfield', 'Grant', 'Petrova', 'Osei', 'Tanaka', 'Miller', 'Haddad', 'Silva', 'Novak', 'Laurent', 'Kim', 'Brooks', 'Aziz', 'Bennett', 'Costa', 'Reyes', 'Sharma', 'Wu', 'Kovacs', 'Duval', 'Amari', 'Taylor'];
  var TESTIMONIALS = QUOTES.map(function (q, i) {
    var r = rng('testi:' + i);
    var stars = r() < 0.75 ? 5 : 4;
    return { id: i + 1, name: FIRST[i] + ' ' + LAST[i], city: pick(r, ['Austin TX', 'Berlin', 'Toronto', 'Singapore', 'London', 'Sydney', 'Lisbon', 'Denver CO']), rating: stars, text: q, product: pick(r, PRODUCTS).id };
  });

  /* ---------- team ---------- */
  var TEAM_ROLES = ['Chief Executive Officer', 'Chief Play Officer', 'Head of Toy Design', 'VP Customer Experience', 'Logistics Director', 'Safety & Compliance Lead', 'Head of Partnerships', 'Senior Firmware Engineer', 'UX Research Manager', 'Community Manager', 'Sustainability Officer', 'Data Platform Architect'];
  var TEAM_FIRST = ['Amara', 'Kenji', 'Sofia', 'Malik', 'Ingrid', 'Rafael', 'Chloe', 'Devansh', 'Freya', 'Mateo', 'Ling', 'Gabriel'];
  var TEAM_LAST = ['Okonkwo', 'Sato', 'Mendez', 'Farah', 'Larsen', 'Cardoso', 'Dubois', 'Menon', 'Schmidt', 'Vega', 'Zhou', 'Moretti'];
  var TEAM = TEAM_ROLES.map(function (role, i) {
    var r = rng('team:' + i);
    return { name: TEAM_FIRST[i] + ' ' + TEAM_LAST[i], role: role, hue: (i * 31) % 360, quote: pick(r, ['Great toys begin with listening.', 'Details compound.', 'Ship less, polish more.', 'Kindness scales.', 'Play is serious work.', 'Reliability is a love language.', 'Curiosity is the job description.', 'Safety is non-negotiable.', 'Empathy beats personas.', 'Communities build brands.', 'Green is the default, not a feature.', 'Every kid is a tester.']), city: pick(r, ['Berlin HQ', 'San Francisco', 'Taipei', 'London', 'Stockholm', 'Singapore']) };
  });

  /* ---------- FAQ ---------- */
  var FAQ_GROUPS = [
    { name: 'Orders', slug: 'orders', items: [
      ['Can I change or cancel my order after placing it?', 'You can modify or cancel any order while its status is "Processing" from Account → Orders → Order Details. Once an order ships it can no longer be edited, but our standard 30-day return window always applies.'],
      ['Do I need an account to order?', 'No — guest checkout is fully supported. An account simply gives you order history, saved addresses, wishlist syncing and faster repeat purchases.'],
      ['How do promo codes work?', 'Enter the code in the Discount field on the cart page and press Apply. Codes cannot be combined, and some exclude already-discounted items — the cart always shows the best available combination automatically.'],
      ['Can I buy a gift card with a gift card?', 'Yes, gift card balances may be used toward additional gift cards. Balances never expire and apply across the entire catalogue.'],
      ['Where do I find my invoice?', 'Every confirmed order includes a downloadable invoice under Account → Orders → Order Details. Guests receive the same link by email.'],
      ['I received the wrong toy — what now?', 'Contact support within 48 hours via the Help Center ticket form or live chat. We ship the correct item immediately with a prepaid return label; no waiting on receipt.'],
      ['Can I reserve a toy that is out of stock?', 'Yes. Choose "Notify me at launch price" on any sold-out product page and you will get one email the moment inventory lands — no auto-charges, no obligation.'],
      ['Are prices shown including tax?', 'Prices are pre-tax by default. Estimated sales/VAT tax is calculated transparently at checkout based on your shipping address before payment.']
    ]},
    { name: 'Shipping', slug: 'shipping', items: [
      ['When does my order ship?', 'Orders placed before 2pm local warehouse time ship the same business day; after that, next business day. Weekends and public holidays add one day to handling.'],
      ['Is free shipping really free?', 'Yes — orders over $99 ship free on standard delivery in all domestic zones, tracked end-to-end. No membership, no minimum category mix.'],
      ['Which countries do you ship to?', 'We currently serve 42 countries across North America, Europe, Asia-Pacific and parts of South America. International duties and taxes are calculated and prepaid at checkout — no surprise invoices on delivery.'],
      ['Do you offer express delivery?', 'Express (1–2 business days) and Overnight options appear at checkout whenever your address supports them, with exact cutoff times shown live.'],
      ['Can I ship to a parcel locker?', 'Absolutely. Enter the locker address plus your locker ID at checkout; most lockers within supported carrier networks qualify for free standard shipping too.'],
      ['How is shipping cost calculated?', 'Standard rates start at $5.90 based on distance zone and package weight. The final figure is always quoted in full on the checkout page before you pay.'],
      ['My tracking has not updated in days — help?', 'Carrier scans occasionally batch late, especially through customs. If there is no movement for 72 hours, open a ticket from the Tracking page and we will investigate with the carrier within one business day.'],
      ['Do shipments require a signature?', 'Only high-value orders (over $500) require signature-on-delivery by default. You can opt into signature protection free of charge during checkout.'],
      ['What are your delivery guarantees?', 'Standard deliveries carry a 95%+ on-time record; express services are guaranteed by the carrier — missed guaranteed windows trigger automatic partial refunds of shipping costs, no forms needed.']
    ]},
    { name: 'Returns & Warranty', slug: 'returns', items: [
      ['What is your return window?', '30 days from delivery for nearly everything — opened boxes and tested toys included, provided the toy itself is undamaged beyond normal evaluation play.'],
      ['How do refunds work?', 'Refunds are issued to your original payment method within 1–2 business days of our warehouse receiving your return; banks post them in a further 2–5 days. Gift card purchases refund to store credit instantly on scan-in.'],
      ['Is the return label free?', 'Domestic returns use a prepaid label included in every box, or printable from the Returns page. International exchanges split label costs 50/50 unless the toy is faulty — then we cover everything.'],
      ['Do I need original packaging to return?', 'Not strictly. Include everything you reasonably can, especially chargers and small parts; missing core accessories may deduct a small restocking percentage, stated upfront before you confirm.'],
      ['What does the 2-year warranty cover?', 'Manufacturing defects, component failures, and rechargeable batteries dropping below 60% capacity within the period. Accident damage beyond rated limits, water intrusion, and unauthorized repairs sit outside coverage.'],
      ['How long do warranty repairs take?', 'Most repairs complete within 7–10 business days including transit. Express replacement ships instantly for in-stock items with a deposit-free hold on your card until the faulty unit arrives back.'],
      ['Does opening the box void the warranty?', 'Never — evaluating a toy is expected. Only physical disassembly or third-party repair marks affect coverage, and even then only for the affected part.'],
      ['Can I extend my warranty?', 'Yes — FRONTIER Care+ adds accident protection and battery service for 1, 2, or 3 extra years. Add it at product checkout or within 60 days of purchase from the Warranty page.'],
      ['How do I register a toy for warranty?', 'Registration is automatic when you order signed-in. For gifts, register a serial at Warranty → Register Product and warranty starts from delivery date regardless of who bought it.']
    ]},
    { name: 'Payments', slug: 'payments', items: [
      ['Which payment methods do you accept?', 'Major credit/debit cards (Visa, Mastercard, Amex), PayPal, Apple Pay, Google Pay, gift cards, and buy-now-pay-later partners where available.'],
      ['Is my payment information secure?', 'PCI-DSS Level 1 tokenized processing, TLS 1.3 everywhere, and zero card data stored on our servers. We see only issuer-approved tokens.'],
      ['When am I charged?', 'At order placement for in-stock items; authorization releases instantly for cancelled lines. Pre-orders charge at ship-out — you will be reminded 48 hours prior either way.'],
      ['Why was my card declined?', 'Issuer-side security rules cause most declines — many vanish on retry or after verifying with your bank. Alternative methods at checkout work immediately; contact us if issues persist.'],
      ['Do you support split payments?', 'Yes — combine gift card balance with any other method at checkout automatically; the remaining balance settles to whichever method you select first.'],
      ['Can I get a price adjustment after a sale starts?', 'Within 7 days of your purchase we will refund the difference to your original payment method if our own price drops. Chat "price match me" with your order number.'],
      ['Are installments interest free?', 'BNPL plans shown at checkout are 0% APR for standard 4-pay schedules; longer terms carry clearly displayed fixed fees before confirmation. Always.'],
      ['How do gift cards work?', 'Digital gift cards deliver by email in minutes with your message. At checkout enter the code; balances apply per-order and persist indefinitely for the remainder.']
    ]},
    { name: 'Toys & Safety', slug: 'products', items: [
      ['Are your toys safety certified?', 'Every toy is CPSIA-compliant and CE/UKCA marked, with independent lab testing for small parts, chemical safety and battery enclosures. Test certificates are linked on each product page.'],
      ['What does "Certified Refurbished" mean for toys?', 'Factory or authorized-lab refurbished units with new batteries, sanitized surfaces, published cosmetic grading, and the same 2-year warranty as new — priced 15–35% lower.'],
      ['Will this toy suit my child\'s age?', 'Each product lists a tested age range under the title and a detailed age row in Specifications. Age labels consider small parts, cognitive load and play patterns — not just marketing.'],
      ['How accurate are the age labels?', 'We follow CPSC age-grading guidance and verify with real kid test panels. Where a child develops faster or slower than the label, you can filter and shop across ranges freely.'],
      ['Are batteries included?', 'Rechargeable toys include USB-C cables; battery-tray toys include starter sets where the listing says so — the In the Box row always tells you exactly.'],
      ['Is stock information live?', 'Warehouse counts sync every 15 minutes. "Low stock" means fewer than eight units remain; reservations are honoured 90 minutes past add-to-cart time-outs during promotions.'],
      ['Can I request a toy you do not list?', 'Yes — the Support Center accepts sourcing requests. Popular ones graduate into our catalogue within weeks, with priority notification to everyone who asked.'],
      ['Do bundles save money?', 'Consistently 8–15% versus separate items. Builder tools on compatible categories construct valid bundles automatically and show savings live.'],
      ['What comes in the box?', 'Full contents list appears on each product page under Specifications → In the Box — always including the safety sheet and quick-start guide.']
    ]},
    { name: 'Account & Privacy', slug: 'account', items: [
      ['How do I delete my account?', 'Account → Settings → Delete Account requests permanent removal. We email a final confirmation link, then erase personal data within 30 days minus legally required records.'],
      ['What data do you collect?', 'Order fulfilment essentials, device/browser basics for site functionality, and optional preference signals. The full ledger lives in our Privacy Policy — written plainly, not lawyerly.'],
      ['Do you sell my data?', 'No. Analytics are aggregated and anonymized; marketing emails require explicit opt-in. Ad interactions are limited to contextual signals, never cross-site profiles.'],
      ['How do I enable two-factor authentication?', 'Settings → Security → Enable 2FA supports TOTP apps and hardware keys. Recovery codes print once — store them somewhere analog.'],
      ['I forgot my password — now what?', 'Use Forgot Password on the login page. Reset links expire in 60 minutes and invalidate once used; sessions on other devices optionally sign out simultaneously.'],
      ['Can I merge duplicate accounts?', 'Yes — Support handles merges preserving orders, wishlist items and loyalty status from both accounts onto whichever email you nominate.'],
      ['How do notification preferences sync?', 'Email/SMS/push switches in Settings → Notifications control marketing separately from transactional messages. Receipts and shipping alerts always remain opt-out-safe.'],
      ['Is my wishlist visible to others?', 'Private by default. Shared wishlists expose only titles and images — never your email, address, or purchase history.'],
      ['Are connected toys safe for privacy?', 'All app-connected toys we stock are verified against current children\'s privacy rules: no data resale, no always-on microphones, and clear data-retention limits from the manufacturer.']
    ]}
  ];
  var FAQ_COUNT = FAQ_GROUPS.reduce(function (n, g) { return n + g.items.length; }, 0);

  /* announcements */
  var ANNOUNCEMENTS = [
    ['truck', 'Free shipping on orders over $99'],
    ['tag', 'Code <b>FRONTIER10</b> — 10% off your first order'],
    ['sparkles', 'New: the TinyTorque spring ride-on line just landed'],
    ['shield', 'Every toy safety-tested · CPSIA & CE certified']
  ];

  return {
    cats: CATS, brands: BRANDS, colors: COLORS, connect: CONNECT,
    products: PRODUCTS, productById: byId, productBySlug: bySlug, img: img, money: money,
    ensurePseudo: ensurePseudo,
    trending: TRENDING, newArrivals: NEW_ARRIVALS, bestSellers: BEST_SELLERS,
    deal: dealProduct, heroSlides: heroSlides, subIcon: SUB_ICON,
    blogCats: BCATS, posts: BLOG, popularPosts: POPULAR_POSTS, authors: AUTHORS,
    testimonials: TESTIMONIALS, team: TEAM,
    faqGroups: FAQ_GROUPS, faqCount: FAQ_COUNT,
    announcements: ANNOUNCEMENTS, rng: rng
  };
})();
