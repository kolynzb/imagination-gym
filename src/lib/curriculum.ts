// 8-week curriculum data — transcribed from the brokendraw roadmap source note.

export interface DayPart {
  k: 'A' | 'B' | 'C' | 'D';
  t: string; // Title
  m: number; // Duration in minutes (0 for rest/all day)
  p: string; // Purpose
  d: string; // Description
}

export interface Day {
  t: string; // Day title
  parts: DayPart[];
}

export interface WeekLink {
  l: string; // Label
  u: string; // URL
}

export interface Week {
  n: number;
  title: string;
  sub: string;
  objective: string;
  why: string;
  project: string;
  han: string;
  book: string;
  links: WeekLink[];
  milestones: string[];
  days: Day[];
}

export interface Exercise {
  n: string;
  name: string;
  p: number;
  lvl: number;
  purpose: string;
  reps: string;
  pit: string;
  fix: string;
}

export interface RubricItem {
  t: string;
  err: string;
  fix: string;
}

export interface PipelineStage {
  n: string;
  t: string;
  items: string[];
}

export interface PartDoc {
  k: string;
  t: string;
  m: string;
  h: string;
  d: string;
}

export interface KitItem {
  t: string;
  v: string;
  why: string;
}

export interface SourceItem {
  t: string;
  v: string;
  by: string;
  why: string;
  u: string;
}

export interface ScaffoldItem {
  d: string;
  low: string;
  mid: string;
  high: string;
  fix: string;
}

export interface VaultVideo {
  t: string;
  by: string;
  id: string;
}

export interface VaultGroup {
  g: string;
  v: VaultVideo[];
}

const A = (m: number, p: string, d: string): DayPart => ({ k: 'A', t: 'Warm-Up', m, p, d });
const B = (m: number, p: string, d: string): DayPart => ({ k: 'B', t: 'Drill', m, p, d });
const S = (m: number, p: string, d: string): DayPart => ({ k: 'B', t: 'Study', m, p, d });
const C = (m: number, p: string, d: string): DayPart => ({ k: 'C', t: 'Project', m, p, d });
const R = (p: string, d: string): DayPart => ({ k: 'D', t: 'Rest & Play', m: 0, p, d });
const REST = R('Psychological recovery & joy', 'Draw strictly for fun. Doodles, fan art, imagination sketches. Zero critique, zero drills.');

export const WEEKS: Week[] = [
  {
    n: 1,
    title: 'Measurements & Mechanics',
    sub: 'Eye–hand coordination',
    objective: 'Train your arm to make the mark your brain intends. Measure line slope 1:1, identify positive/negative silhouettes, master symmetrical mirroring.',
    why: 'You cannot draw 3D scenes if your hand cannot reliably gauge an angle or draw a straight line. Week 1 isolates pure neuromuscular control away from 3D space: shoulder replaces wrist, the eye learns to read 2D silhouettes undistorted, and you build the nerve to commit permanent ink.',
    project: '5 Household Objects — silhouettes & internal planes',
    han: 'pp. 4–14 — drawing from the shoulder, ghosting, line weight hierarchy',
    book: 'Level 1 Mechanics, pp. 6–26 — Ex 01 Straights & Curves (p.7), Ex 02 Point Coordination (p.8), Ex 03 Tilting Planes (p.9), Ex 04 Parallel Ellipses (p.10)',
    links: [
      { l: 'Drawabox Lesson 1: Lines & Ellipses', u: 'https://drawabox.com/lesson/1' },
      { l: 'Nathan Cooke — Visual Communication', u: 'https://www.youtube.com/watch?v=oK-4wUbBmJI' },
      { l: 'brokendraw — how to actually use boxes to draw better', u: 'https://www.youtube.com/watch?v=VBAJDepILYc' },
      { l: 'Roadmap video — Week 1 @ 08:38', u: 'https://www.youtube.com/watch?v=zYzgxUVSpUc&t=518s' }
    ],
    milestones: ['50 Silhouettes', '50 Symmetry Shapes'],
    days: [
      { t: 'Shoulder Calibration & Ghosting', parts: [
        A(10, 'Motor activation', 'Ex 01 (p.7) — 8× repetitions of straight lines and C/S curves from the shoulder. Wakes the shoulder joint, locks the wrist.'),
        B(50, 'Stroke trajectory & planning', 'Drawabox Ghosted Lines (2 pages) + Ghosted Planes (2 pages). Prepare the stroke in the air before committing ink.'),
        C(30, 'Workspace & baseline observation', 'Set up your physical workspace. Gather 5 household objects — mug, shoe, scissors, spray bottle, tool — for Project #1.')
      ] },
      { t: 'Ellipse Coordination & Coin Flips', parts: [
        A(10, 'Minor axis calibration', 'Dynamic Bible p.8 — parallel ellipses along a minor axis, drawn from the shoulder.'),
        B(50, 'Ellipse symmetry & degree control', 'Drawabox Tables of Ellipses (1 page) + Funnels (1 page). Ellipses stay packed tightly without pinching.'),
        B(30, 'Target landing accuracy', 'Ex 02 (p.8) — Point Coordination sheet. Connect random pairs of dots with no overshoot.')
      ] },
      { t: 'Angle Matching & Tilting Planes', parts: [
        A(10, 'Hatching spacing discipline', 'Ex 01 straight hatching lines at consistent spacing.'),
        B(50, 'Tilt angle estimation', 'Ex 03 (p.9) — 20 tilting planes in varied tilts and orientations.'),
        B(30, 'Silhouette isolation', 'Start 25 silhouettes from photo reference. Outline shapes only — ignore every interior line.')
      ] },
      { t: 'Symmetry & Positive/Negative Space', parts: [
        A(10, 'Ellipse fluidity', 'Ex 04 (p.10) — Parallel Ellipses.'),
        B(50, 'Shape readability', 'Finish the remaining 25 silhouettes. Running total: 50.'),
        B(30, 'Symmetrical mirroring', '50 symmetry shapes — vertical axis, ink a shape on the left, mirror it on the right.')
      ] },
      { t: 'Project #1 — Observation Block-In', parts: [
        A(10, 'Plane subdivision', 'Drawabox Ghosted Planes, 1 page.'),
        C(60, 'Direct observation block-in', 'Pick 3 of your 5 objects. Outer silhouette only, zero interior lines. Proportion and angle matching 1:1.'),
        C(10, 'Error diagnosis', 'Overlay a photo on your drawing. Did you match the angles, or did your brain flatten them?')
      ] },
      { t: 'Project #1 — Internal Plane Divisions', parts: [
        A(10, 'Overlapping continuity', 'Ex 05 (p.11) — flowing ribbons with twists.'),
        C(60, 'Internal plane definition', 'Draw the remaining 2 objects. For all 5, add primary internal plane-break lines. No shading — structural clarity only.'),
        C(15, 'Self-accountability', 'Log hours in the Progress tab. Note key blind spots.')
      ] },
      { t: 'The 50% Rule', parts: [REST] }
    ]
  },
  {
    n: 2,
    title: '3D Form Construction',
    sub: 'Boxes, cylinders & the Z-axis',
    objective: 'Shift from 2D flat shapes to true 3D volumetric space. Master line convergence toward vanishing points, ellipse minor axes, and rotating simple primitives.',
    why: 'Most people draw flat symbols of objects because they think in 2D. Week 2 forces your brain into the Z-axis. Boxes and cylinders from multiple vantage points are the Lego blocks every vehicle, figure and room is built from.',
    project: '4-Angle Compound Form Rotation',
    han: 'pp. 15–28 — 3D primitives, cylinders, cross-sections, minor axes',
    book: 'Level 2 Basic Forms, pp. 27–41 — Ex 06 Extrusion (p.28), Ex 07 Cube Grid (p.30), Ex 08 Cylinders (p.32), Ex 09 Rotating Form (p.35), Ex 10 Box Stacking (p.38)',
    links: [
      { l: 'Drawabox — The 250 Box Challenge', u: 'https://drawabox.com/lesson/250boxes' },
      { l: 'Drawabox — Rotated Boxes', u: 'https://drawabox.com/lesson/1/16' },
      { l: 'Athoro — Drawing The Box', u: 'https://www.youtube.com/watch?v=Jwti08d0jYk' },
      { l: 'Athoro — What to THINK of when drawing cylinders', u: 'https://www.youtube.com/watch?v=BHvXszH1fdI' },
      { l: 'Zeph Draws — Spatial Awareness 1: Form Rotation', u: 'https://www.youtube.com/watch?v=NijDzUGNVfQ' },
      { l: 'Roadmap video — Week 2 @ 12:52', u: 'https://www.youtube.com/watch?v=zYzgxUVSpUc&t=772s' }
    ],
    milestones: ['100 Boxes', '100 Cylinders'],
    days: [
      { t: 'Extrusions & The Y-Method Box', parts: [
        A(10, 'Ellipse fitting', 'Drawabox ghosted planes with internal ellipses, 1 page.'),
        S(15, 'Algorithmic perspective', 'Read Ex 06 (p.28) and the Drawabox Y-method guide.'),
        B(50, 'Vanishing point convergence', '25 freehand boxes by the Y-method. Extend vanishing lines in a colored pen to verify convergence.')
      ] },
      { t: 'Cylinder Minor Axes & Foreshortening', parts: [
        A(10, 'Ellipse alignment', 'Ex 04 — Parallel Ellipses.'),
        S(15, 'Minor axis geometry', 'Read Ex 08 (p.32) and Dynamic Bible pp. 20–22.'),
        B(50, 'Volumetric foreshortening', '30 cylinders in varied orientations. The minor axis must cut through the centre of both ellipses.'),
        B(20, 'Volume consistency', '15 boxes. Running total: 40.')
      ] },
      { t: 'Stacking & Queuing Primitives', parts: [
        A(10, 'Funnel tracking', 'Drawabox ellipses in funnels.'),
        B(60, 'Spatial grounding & overlap', 'Ex 10 (p.38) — one full page stacking and queuing boxes and cylinders together in perspective.'),
        B(30, 'Milestones', '25 boxes (total 65) + 25 cylinders (total 55).')
      ] },
      { t: '3D Alphabet Carving', parts: [
        A(10, 'Rapid projection', '10 quick Y-method boxes.'),
        B(50, 'Subtractive volumetric thinking', '8 rectangular 3D boxes. Carve the letters A, B, E, K, R, S out of them, holding strict perspective thickness.'),
        B(30, 'Milestones', '20 cylinders (total 75) + 20 boxes (total 85).')
      ] },
      { t: 'Project #2 Prep — Rotated Forms in Space', parts: [
        A(10, 'Rotational warm-up', 'Dynamic Bible p.18 box rotation warm-up.'),
        S(15, 'Form orbiting theory', 'Zeph Draws on cylinders + review Ex 09 (p.35).'),
        B(40, 'The 100-form milestone', 'Final 15 boxes (100 total) + final 25 cylinders (100 total).'),
        C(20, 'Form conception', 'Choose a compound form — e.g. a cylinder fused to a box — to rotate for Project #2.')
      ] },
      { t: 'Project #2 — 4-Angle Compound Rotation', parts: [
        A(10, 'Quick orbit', '5 quick rotated boxes.'),
        C(60, 'Mental 3D rotation synthesis', 'Draw your compound form at 4 distinct angles — front 3/4, high 3/4, low profile, rear 3/4 — purely from spatial intuition. Keep convergence consistent.'),
        C(15, 'Calibration', 'Log hours and a convergence self-critique in Progress.')
      ] },
      { t: 'The 50% Rule', parts: [R('Creative refresh', 'Draw anything you want. Try objects from memory, with no pressure.')] }
    ]
  },
  {
    n: 3,
    title: 'Form Manipulation & Prop Design',
    sub: 'Bending, slicing, intuitive space',
    objective: 'Move beyond rigid static forms. Bend, slice, intersect and sculpt primitives. Deconstruct everyday objects into Lego-like volumes and rebuild them as original vehicles.',
    why: 'The real world is not made of rigid cardboard boxes. Week 3 treats primitives like digital clay — bending, slicing, fusing. That unlocks prop and vehicle design.',
    project: 'Everyday Prop → Original Sci-Fi Vehicle',
    han: 'pp. 29–45 — intersecting solids, carving forms, object deconstruction',
    book: 'Level 3 Form Control, pp. 42–56 — Ex 11 Addition (p.43), Ex 12 Stacking & Queueing (p.45), Ex 13 Bending Form (p.48), Ex 14 Organic Volumes (p.51), Ex 20 Deconstruction (p.70)',
    links: [
      { l: 'Drawabox Lesson 2 — Form Intersections', u: 'https://drawabox.com/lesson/2/8' },
      { l: 'Drawabox Lesson 6 — Everyday Objects', u: 'https://drawabox.com/lesson/6' },
      { l: 'Drawabox Lesson 7 — Vehicles', u: 'https://drawabox.com/lesson/7' },
      { l: 'brokendraw — how the horizon line ACTUALLY works', u: 'https://www.youtube.com/watch?v=6xUqTKQrMr0' },
      { l: 'brokendraw — visual library memorization technique', u: 'https://www.youtube.com/watch?v=w3ROXZLZZ_k' },
      { l: 'Zeph Draws — Spatial Awareness 2: Perspective Intuition', u: 'https://www.youtube.com/watch?v=f5Bq-ugRv3E' },
      { l: 'Roadmap video — Week 3 @ 16:13', u: 'https://www.youtube.com/watch?v=zYzgxUVSpUc&t=973s' }
    ],
    milestones: ['20 Bent Forms', '20 Organic Volumes', '2 Deconstructions'],
    days: [
      { t: 'Form Intersections & Boolean Addition', parts: [
        A(10, 'Volume recall', '5 Y-method boxes + 5 cylinders from Week 2.'),
        S(15, 'Boolean collision theory', 'Read Ex 11 (p.43) and Drawabox Form Intersections.'),
        B(50, 'Intersection seam mapping', '10 pairs of intersecting solids — box through cylinder, cylinder through sphere. Draw the seam where surfaces collide.')
      ] },
      { t: 'Bending Forms & Organic Noodles', parts: [
        A(10, 'Ribbon continuity', 'Flowing S-ribbons with thickness.'),
        S(15, 'Dynamic flexion mechanics', 'Read Ex 13 Bending Form (p.48).'),
        B(60, 'Preserving volume through bends', '20 bent forms — curving rectangular tubes, bent macaroni, twisted prisms — with cross-contour rings showing the bend direction.')
      ] },
      { t: 'Organic Volumes & Contour Slices', parts: [
        A(10, 'Degree variation', 'Ellipse degree variations.'),
        S(15, 'Non-geometric massing', 'Read Ex 14 (p.51) and Dynamic Bible p.34.'),
        B(60, 'Cross-contour wrapping', '20 organic volumes — potatoes, bean shapes — with contour slices wrapped around them.')
      ] },
      { t: 'Form Clusters & Reference Deconstruction', parts: [
        A(10, 'Intersection recall', '5 intersecting forms.'),
        B(40, 'Spatial grouping', '20 form clusters — interlocking groups of 3+ primitives stacked in space.'),
        B(40, 'Real-world reverse engineering', 'Ex 20 (p.70) — photograph 2 complex machines (camera, power drill) and break them into wireframe boxes and cylinders.')
      ] },
      { t: 'Project #3 — Phases 1 & 2', parts: [
        A(10, 'Tube flexion', 'Bent cylinders.'),
        C(30, 'Functional analysis', 'Pick an everyday prop in your room — shaver, toaster, spray can. Sketch its primitive breakdown.'),
        C(45, 'Imaginative transformation', 'Re-imagine the prop as a sci-fi or fantasy vehicle. Main body becomes the chassis; add cockpit and wheels.')
      ] },
      { t: 'Project #3 — Phase 3: Detailing', parts: [
        A(10, 'Line weight calibration', 'Peter Han line weight warm-up.'),
        C(60, 'Surface articulation', 'Add panel cuts, seams, intakes and structural detail following the perspective contours.'),
        C(15, 'Checkpoint', 'Log hours. Do not move to Week 4 until form feels comfortable.')
      ] },
      { t: 'The 50% Rule', parts: [R('Creative play', 'Sketch vehicles, robots or wild creature designs with zero rules.')] }
    ]
  },
  {
    n: 4,
    title: 'Mannequinization',
    sub: 'The human figure in space',
    objective: 'Translate the body into 3 major volumetric masses — head, ribcage, pelvis. Exaggerate gesture to offset box stiffness, and stage low-res figures inside a 3D environment.',
    why: 'Anatomy is terrifying from the surface muscles inward. Week 4 strips the noise: 3 core masses connected by gestural lines of action, so you can pose characters believably in space before worrying about anatomy.',
    project: 'PS2 Blocky Character in 3D Space',
    han: 'pp. 46–58 — applying primitives to organic life & animals',
    book: 'Ex 18 Box Figures (p.64), Ex 21 Mannequinization (p.72), Ex 23 POV Drawing (p.74)',
    links: [
      { l: 'Drawabox Lesson 5 — Animals', u: 'https://drawabox.com/lesson/5' },
      { l: 'Pinterest — mannequinization references', u: 'https://pin.it/7rhff9lkO' },
      { l: 'Jae-Gwang Park (Proko) — This Curve Will Change How You Draw Figures', u: 'https://www.youtube.com/watch?v=RDPVo6TPPbk' },
      { l: 'brokendraw — drawing anatomy is easier than you think', u: 'https://www.youtube.com/watch?v=WkmZLi8bNBM' },
      { l: 'brokendraw — how to draw like Kim Jung Gi (for free)', u: 'https://www.youtube.com/watch?v=EL5kn_GLq40' },
      { l: 'Roadmap video — Week 4 @ 19:35', u: 'https://www.youtube.com/watch?v=zYzgxUVSpUc&t=1175s' }
    ],
    milestones: ['50 Reference Mannequins', '20 Imagination Mannequins'],
    days: [
      { t: 'The 3 Major Masses', parts: [
        A(10, 'Kinetic action lines', 'Flowing gesture lines of action from the shoulder.'),
        S(20, 'The kinetic curve', "Watch Jae-Gwang Park's video and read Ex 18 (p.64)."),
        B(50, 'Torso & pelvis opposition', '15 box figures — head, ribcage and pelvis only. Note how the ribcage tilts opposite the pelvis. Zero limbs.')
      ] },
      { t: 'Connecting Limbs via Cylinders', parts: [
        A(10, 'Torso gestures', '5 quick 3-mass torso gestures.'),
        S(15, 'Pose analysis', 'Review the mannequin Pinterest board.'),
        B(60, 'Limb projection & foreshortening', '25 full mannequins from photo reference. Exaggerate the gesture line before blocking in box/cylinder limbs.')
      ] },
      { t: 'Mannequins from Reference', parts: [
        A(10, 'Speed & rhythm', '5 one-minute gesture sketches.'),
        B(60, 'Extreme angles & overlap', '25 full mannequins in dramatic foreshortening. Running total: 50 reference mannequins.'),
        B(15, 'Flattening detection', 'Draw cross-contour rings on thighs and forearms to verify the 3D camera angle.')
      ] },
      { t: 'Mannequins from Pure Imagination', parts: [
        A(10, 'Box recall', 'Ex 18 box figures.'),
        S(15, 'Imaginative posing theory', 'Read Ex 21 (p.72).'),
        B(60, 'Internal gravity & action', '10 mannequins from pure imagination in action poses — jumping, running, throwing, crouching.')
      ] },
      { t: 'Project #4 Prep — Low-Res Spatial Architecture', parts: [
        A(10, 'Imagination check', '5 imaginative mannequins. Total: 15.'),
        S(15, 'Spatial immersion', 'Read Ex 23 POV Drawing (p.74).'),
        B(30, 'Milestone', 'Final 5 imagination mannequins. Total: 20.'),
        C(25, 'Narrative premise', 'Write a one-sentence premise — e.g. "Two scavengers duck behind an overturned crate while a guard patrols above."')
      ] },
      { t: 'Project #4 — The PS2 Low-Res Scene', parts: [
        A(10, 'Ground setup', 'Quick horizon line and perspective grid.'),
        C(60, 'Low-res scene synthesis', 'Establish ground plane and camera horizon. Place 2–3 volumetric mannequins interacting with props — crates, bench, doorway. Keep them PS2 low-res: perspective depth, not faces.'),
        C(15, 'Log', 'Log hours in Progress.')
      ] },
      { t: 'The 50% Rule', parts: [R('Freedom', 'Sketch favourite comic, anime or game characters as mannequins in wild poses.')] }
    ]
  },
  {
    n: 5,
    title: 'Softening & Head Carving',
    sub: 'From puppet to human',
    objective: 'Bridge geometric mannequin boxes into organic anatomy. Carve facial features out of box skulls, locate bony landmarks against soft tissue, master character turnarounds.',
    why: 'A boxy mannequin looks robotic. Week 5 carves skull planes from boxes and softens hard edges into fleshy curves, so turnarounds hold consistent volume from any camera angle.',
    project: 'Full Character Turnaround from Imagination',
    han: 'pp. 48–54 / 59–68 — planar head construction, anatomical landmarks, anatomy masses',
    book: 'Ex 16 Subtraction (p.58), Ex 18 Box Figures (p.64), Ex 21 Mannequinization (p.72)',
    links: [
      { l: 'Pinterest — mannequin variation board', u: 'https://pin.it/uxOH7GQJO' },
      { l: 'brokendraw — how to turn mannequins into real anatomy (JUST SOFTEN)', u: 'https://www.youtube.com/watch?v=J9MYR-BLzNg' },
      { l: 'Zeph Draws — draw the head from any angle', u: 'https://www.youtube.com/watch?v=KjgSYqr77C0' },
      { l: 'brokendraw — draw faces from ANY angle', u: 'https://www.youtube.com/watch?v=gvro2NslMfA' },
      { l: 'Roadmap video — Week 5 @ 22:45', u: 'https://www.youtube.com/watch?v=zYzgxUVSpUc&t=1365s' }
    ],
    milestones: ['8 Box Skulls', '30 Interacting Mannequins'],
    days: [
      { t: 'Head Carving & Facial Planes', parts: [
        A(10, 'Skull spatial alignment', '5 box skulls in perspective.'),
        S(20, 'Subtractive facial anatomy', 'Watch Zeph Draws on carving the head; review Ex 16 Subtraction (p.58).'),
        B(50, 'Facial plane architecture', '8 box skulls. Carve the eye socket shelf, brow ridge, zygomatic arch and dental muzzle out of each box.')
      ] },
      { t: 'Bony Landmarks vs. Soft Tissue', parts: [
        A(10, '3/4 head angles', '3 carved heads from 3/4 angles.'),
        S(15, 'Softening mechanics', 'Watch brokendraw Just Soften.'),
        B(60, 'Organic anatomical transitions', '10 mannequins. Soften transitions with the deltoid cap, pectoral drape, patella and ribcage arches.')
      ] },
      { t: 'Mannequins & Environment', parts: [
        A(10, 'Gesture warming', 'Three-minute gesture warm-up.'),
        B(60, 'Environmental grounding', '15 mannequins interacting with scale-accurate furniture — sitting, leaning, climbing steps.')
      ] },
      { t: 'Proportional Archetypes', parts: [
        A(10, 'Facial recall', '3 quick carved heads.'),
        S(15, 'Archetype exploration', 'Review the mannequin variation board.'),
        B(40, 'Interaction milestone', 'Remaining 15 interacting mannequins. Total: 30.'),
        B(30, 'Body shape distortion', '10 varied mannequins from imagination — 5 top-heavy/muscular, 5 pear-shaped/slender.')
      ] },
      { t: 'Project #5 Prep — Character Archetype', parts: [
        A(10, 'Facial expression', '3 expressive face sketches.'),
        C(45, 'Character identity design', 'Brainstorm an original character: silhouette, exaggeration points, personality — grizzled brawler, cybernetic thief, bulky knight.'),
        C(30, 'Height & proportion anchoring', 'Set proportions on a front-facing master mannequin with horizontal guides: head top, chin, shoulders, hips, knees, feet.')
      ] },
      { t: 'Project #5 — Turnaround Sheet', parts: [
        A(10, 'Rotation memory', 'Quick rotation warm-up (Ex 09).'),
        C(60, 'Turnaround volumetric consistency', 'Draw the character in a clean 3- or 4-point turnaround — front, 3/4 front, profile, rear 3/4. Hold volume, height and feature alignment across all views.'),
        C(15, 'Log', 'Log hours in Progress.')
      ] },
      { t: 'The 50% Rule', parts: [R('Pure art', 'Draw character designs, faces, expressions and poses purely for fun.')] }
    ]
  },
  {
    n: 6,
    title: 'Costume, Clothing & Drapes',
    sub: 'Layered construction',
    objective: 'Treat clothing as layered volumetric wraps governed by gravity and tension points, not random wrinkles. Construct from the inside out: bones → flesh → garment.',
    why: 'Naked mannequins cannot tell a story. Week 6 treats clothing as volumetric sheets suspended between tension and gravity, which is what gives a character identity, class and narrative weight.',
    project: 'Fully Costumed Character with Distinct Fabric Tension',
    han: 'pp. 69–74 — folds & draping',
    book: 'Ex 13 Bending Form (p.48), Ex 14 Organic Volumes (p.51), Ex 19 Volume Mapping (p.67), Ex 21 (p.72)',
    links: [
      { l: 'Tom Fox Draws — Why Studying Folds Won\u2019t Help You Draw Clothing', u: 'https://www.youtube.com/watch?v=1qIy7LyYLnI' },
      { l: 'Michael Hampton (Proko) — Understanding Every Type Of Clothing Fold', u: 'https://www.youtube.com/watch?v=d07NanfYT8U' },
      { l: 'brokendraw — how I design characters in 5 easy steps', u: 'https://www.youtube.com/watch?v=FBXb8woYQn0' },
      { l: 'Roadmap video — Week 6 @ 25:45', u: 'https://www.youtube.com/watch?v=zYzgxUVSpUc&t=1545s' }
    ],
    milestones: ['10 Pants', '10 Tops', '10 Hats', 'Dressing Sheet'],
    days: [
      { t: 'The 3 Layers & Tension Points', parts: [
        A(10, 'Flexion cylinders', '5 cylinder bends (Ex 13).'),
        S(20, 'The 3 layers of costuming', 'Watch Tom Fox Draws; study the mannequin → skin → clothing wrap sequence.'),
        B(50, 'Tension point wrapping', '5 naked cylinder limbs. Wrap thin clothing volumes over them with pinch points at elbows and knees.')
      ] },
      { t: 'Pants Studies', parts: [
        A(10, 'Overlapping fabric tubes', 'Overlapping tube folds.'),
        S(15, 'Fold taxonomy', "Study Hampton's fold types: pipe, zig-zag, spiral."),
        B(60, 'Lower body tension', '10 pant studies from reference — jeans, sweatpants, cargos. Identify the tension points folds radiate from.')
      ] },
      { t: 'Top & Shirt Studies', parts: [
        A(10, 'Torso cylinders', '5 cylindrical torso wraps.'),
        B(60, 'Upper body compression', '10 top studies from reference — tees, hoodies, leather jackets. Map sleeve wraps and collar openings as cylinders.')
      ] },
      { t: 'Headwear & Footwear', parts: [
        A(10, 'Head mass recall', '3 carved heads from Week 5.'),
        B(40, 'Headgear volume', '10 hat studies — caps, beanies, helmets, hoods. Hollow volumes fitted over the skull box.'),
        B(30, 'Footwear prisms', '5 shoe studies. Block the sole as a wedge prism, wrap leather over the foot mass.')
      ] },
      { t: 'The Dressing Worksheet', parts: [
        A(10, 'Clothed gesture', 'Gesture drawing of a clothed figure.'),
        B(60, 'Complete dressing synthesis', '4 blank mannequins. Dress each by combining 1 headwear, 1 top, 1 bottom and 1 accessory from reference.'),
        C(20, 'Archetype conception', 'Select an archetype for Project #6 — 1940s noir detective, heavyweight boxer, post-apocalyptic nomad.')
      ] },
      { t: 'Project #6 — Costumed Character in Action', parts: [
        A(10, 'Dynamic action', '1 dynamic clothed gesture.'),
        C(60, '3-layer execution', 'Stage 1: line of action & gesture. Stage 2: volumetric mannequin understructure. Stage 3: layered clothing and costume props — belts, holsters, coats, folds.'),
        C(15, 'Log', 'Log hours in Progress.')
      ] },
      { t: 'The 50% Rule', parts: [R('Dopamine', 'Draw costumed characters from films, anime or games you love.')] }
    ]
  },
  {
    n: 7,
    title: 'Rendering, Texture & Style',
    sub: 'Surface indication',
    objective: 'Master how light reveals surface. Wrap 2D textures around 3D cross-contour wireframes. Study master mark-making and start building a personal style.',
    why: 'Until now the drawings are wireframes. Week 7 translates the tactile feel of metal, rock, scale and cloth into disciplined ink marks, and introduces master studies so a signature style can start forming.',
    project: 'Stylized Master Fusion',
    han: 'pp. 59–78 — texture indication & surface reaction to light',
    book: 'Ex 15 Texture Bar (p.54), Ex 19 Volume Mapping (p.67), Ex 22–23 (pp.73–74)',
    links: [
      { l: 'Drawabox Lesson 2 — Texture Analysis', u: 'https://drawabox.com/lesson/2/4' },
      { l: 'Drawabox — Dissections', u: 'https://drawabox.com/lesson/2/5' },
      { l: 'Pinterest — texture & rendering board', u: 'https://pin.it/1E1KOFvOr' },
      { l: 'Modern Day James — Texture Drawing in Shape and Light', u: 'https://www.youtube.com/watch?v=4Y0XVPprbYY' },
      { l: 'Tyler Edlin — Learn to draw texture and materials', u: 'https://www.youtube.com/watch?v=-2xhmKLsPO8' },
      { l: 'Roadmap video — Week 7 @ 29:34', u: 'https://www.youtube.com/watch?v=zYzgxUVSpUc&t=1774s' }
    ],
    milestones: ['5 Texture Bars', '10 Textured Blobs', '3 Reference Studies'],
    days: [
      { t: 'Texture as Cross-Contour Wrapping', parts: [
        A(10, 'Cross-contour flow', '5 organic bean volumes with cross-contour rings (Ex 14).'),
        S(20, 'Texture as depth', 'Watch Modern Day James; review Ex 19 Volume Mapping (p.67).'),
        B(50, 'Non-flattening patterns', '4 organic sausage forms. Wrap stripes, checkerboards and stitch lines around the contours without letting them flatten.')
      ] },
      { t: 'The Texture Bar Exercise', parts: [
        A(10, 'Gradient control', 'Graduated hatching gradients.'),
        S(15, 'Tactile translation', 'Read Ex 15 Texture Bar (p.54) and Dynamic Bible pp. 60–64.'),
        B(60, 'Material swatch encoding', '5 texture bars: polished chrome, cracked stone, tree bark, reptile scales, knitted fabric.')
      ] },
      { t: 'Textured Blobs', parts: [
        A(10, 'Texture speed', '2 quick texture bars.'),
        S(15, 'Organic volume dissection', 'Review the Drawabox dissections exercise.'),
        B(60, 'Volumetric dissections', '5 textured blobs — build an organic volume in wireframe, then wrap material texture around it: pineapple skin, dragon scale, braided rope.')
      ] },
      { t: 'Textured Blobs II & Master Style Study', parts: [
        A(10, 'Hatching discipline', 'Peter Han hatching warm-up.'),
        B(45, 'Material fluency', '5 more textured blobs with varied textures. Total: 10.'),
        S(30, 'Graphic ink economy', 'Collect 5 drawings by a master ink stylist — Samnee, Mignola, Moebius. Study how shadow becomes graphic black shape.')
      ] },
      { t: 'Full Reference Study Deconstruction', parts: [
        A(10, 'Surface recall', '1 quick textured blob.'),
        B(60, 'Complex material deconstruction', '3 reference studies — an animal, an armoured boot, a motorcycle engine. Deconstruct into volumes, mannequinize, apply surface indication.'),
        C(20, 'Style fusion selection', 'Select the reference photo and artist style for Project #7.')
      ] },
      { t: 'Project #7 — Stylized Master Fusion', parts: [
        A(10, 'Mark economy', 'Quick ink economy mark-making.'),
        C(60, 'Stylized master fusion', 'Construct the volumetric understructure of your reference, then render the whole piece strictly through your chosen master\u2019s mark-making.'),
        C(15, 'Log', 'Log hours in Progress.')
      ] },
      { t: 'The 50% Rule', parts: [R('Celebration', 'Render a fun fan-art sketch using your favourite texture and inking techniques.')] }
    ]
  },
  {
    n: 8,
    title: 'Scene Building & Capstone',
    sub: 'Drawing from imagination',
    objective: 'Synthesize all 7 weeks into one narrative illustration drawn from imagination. Manage cognitive load with the 4-Phase Pipeline and lock in the Daily Highlight habit.',
    why: 'This is the culmination. Week 8 proves that drawing complex multi-character scenes from pure imagination is not talent — it is idea → research → wireframe → finish.',
    project: 'Original 4-Phase Capstone Scene',
    han: 'pp. 70–79 — final scene staging and storytelling',
    book: 'Level 5 Imagination, pp. 72–76 — Ex 22 Magical Observation, Ex 23 POV Drawing, Ex 24 Daily Highlight, Ex 25 Comic Book',
    links: [
      { l: 'Rembert Montald (Proko) — How to Invent Scenes From Imagination', u: 'https://www.youtube.com/watch?v=fSCz8akhJzw' },
      { l: 'brokendraw — 5 levels of drawing from imagination', u: 'https://www.youtube.com/watch?v=_YuSTSfl-7s' },
      { l: 'brokendraw — How I draw believable scenes from imagination', u: 'https://www.youtube.com/watch?v=dWrT-MakDIc' },
      { l: 'Roadmap video — Week 8 @ 38:45', u: 'https://www.youtube.com/watch?v=zYzgxUVSpUc&t=2325s' }
    ],
    milestones: ['POV / Scene Rotation', 'Daily Highlights'],
    days: [
      { t: 'Cognitive Stacking & POV Drawing', parts: [
        A(10, 'Spatial geometry', '5 quick Y-method boxes.'),
        S(20, 'Camera elevation theory', 'Watch Rembert Montald; read Ex 23 POV Drawing (p.74).'),
        B(50, 'Camera angle re-projection', 'Arrange 3 boxes on a table. Draw the same arrangement from 3 camera heights: eye-level, bird\u2019s-eye, frog\u2019s-eye.')
      ] },
      { t: 'Scene Rotation & Master Copy', parts: [
        A(10, 'Figure projection', '3 quick box figures in perspective.'),
        B(45, 'Mental scene orbit', 'Draw a simple scene cluster — character sitting on a crate beside a lamp post. Redraw it rotated 90°.'),
        B(35, 'Master composition deconstruction', 'Pick a Kim Jung Gi or Moebius scene. Deconstruct camera angle, horizon line and mannequin placement.')
      ] },
      { t: 'Daily Highlight Habit (AMRAP)', parts: [
        A(10, 'Memory calibration', 'Ex 24 Daily Highlight (p.75).'),
        B(60, 'AMRAP visual journaling', 'Sketch 2 scenes from your own day entirely from imagination — a coffee shop, your desk, traffic. Space first, figures second.')
      ] },
      { t: 'Capstone — Phase 1 Idea & Phase 2 Research', parts: [
        A(10, 'Perspective warm-up', 'Quick perspective warm-up.'),
        C(30, 'Narrative premise definition', 'Write the idea statement — e.g. "A tense moment on a creaky harbour dock as friends struggle to land an oversized thrashing fish."'),
        C(50, 'Targeted visual library ingestion', 'Gather 10–15 specific references for unfamiliar props, lighting, structures and costume. Sketch thumbnail breakdowns of what you don\u2019t know.')
      ] },
      { t: 'Capstone — Phase 3 Thumbnails', parts: [
        A(10, 'Thumbnail framing', '3 quick thumbnail boxes.'),
        C(70, 'Spatial architecture & camera locking', 'Draw 4 composition thumbnails: lock horizon and focal height, establish convergence, block all mannequins (head–ribcage–pelvis), check hierarchy, negative space and readability. Pick the strongest.')
      ] },
      { t: 'Capstone — Phase 4 Refinement & Inking', parts: [
        A(10, 'Inking line hierarchy', 'Inking mark-making calibration.'),
        C(105, 'Final imaginative illustration', 'Scale the winning thumbnail to full page: overlay anatomy on the mannequins, add clothing and drape, apply surface texture, finalise line weight hierarchy — bold silhouettes, medium contours, fine texture.'),
        C(20, 'Completion reflection', 'Fill the final row in Progress. Celebrate the transformation.')
      ] },
      { t: 'The 50% Rule & Forever Habit', parts: [R('Lifelong creative engine', 'Lock in the Daily Highlight habit (Ex 24). Keep drawing from imagination every day.')] }
    ]
  }
];

export const EXERCISES = [
  { n: '01', name: 'Straights & Curves', p: 7, lvl: 1, purpose: 'Motor calibration; engages shoulder and elbow; establishes steady line pressure.', reps: '8× repetitions', pit: 'Wrist flicking.', fix: 'Lock the wrist; pivot the whole arm from the shoulder.' },
  { n: '02', name: 'Point Coordination', p: 8, lvl: 1, purpose: 'Precision targeting; lands the pen tip on exact target dots with no overshoot.', reps: '25–30 points', pit: 'Hesitating before contact.', fix: 'Ghost the stroke 3× in the air before touching paper.' },
  { n: '03', name: 'Tilting Planes', p: 9, lvl: 1, purpose: 'Angle estimation; trains the brain to see flat 2D planes tilting in 3D space.', reps: '20 planes', pit: 'Drawing identical rectangles.', fix: 'Exaggerate acute angles and perspective tilt.' },
  { n: '04', name: 'Parallel Ellipses', p: 10, lvl: 1, purpose: 'Minor axis alignment; smooth symmetrical ellipse execution.', reps: '15–20 sets', pit: 'Egg-shaped ends.', fix: 'Draw a centre minor axis; make both halves mirror.' },
  { n: '05', name: 'Ribbons', p: 11, lvl: 1, purpose: 'Fluid spatial continuity; overlapping curves and twisting planes in space.', reps: '10–15 ribbons', pit: 'Flat ribbon edges.', fix: 'Darken overlapping fold lines to push rear planes back.' },
  { n: '06', name: 'Extrusion', p: 28, lvl: 2, purpose: 'Projects flat 2D silhouettes into 3D volumetric depth along the Z-axis.', reps: '20 extrusions', pit: 'Inconsistent extrusion depth.', fix: 'Draw parallel extrusion rails with a ruler first.' },
  { n: '07', name: 'Cube Grid', p: 30, lvl: 2, purpose: 'Perspective grid subdivision; intuitive spatial division without ruler math.', reps: '2–3 grids', pit: 'Equal spacing in perspective.', fix: 'Remember foreshortening — spaces shrink with distance.' },
  { n: '08', name: 'Cylinders', p: 32, lvl: 2, purpose: 'Cylinder minor axes; understanding ellipse degree shift across depth.', reps: '30 cylinders', pit: 'Flat circle ends.', fix: 'The minor axis must be perpendicular to the widest diameter.' },
  { n: '09', name: 'Rotating Form', p: 35, lvl: 2, purpose: 'Mental 3D orbit; keeps volumetric proportion while rotating an object.', reps: '4–8 angles', pit: 'Form shrinking as it turns.', fix: 'Draw a bounding box around all rotations.' },
  { n: '10', name: 'Box Stacking', p: 38, lvl: 2, purpose: 'Ground plane anchoring; stacks primitives without conflicting vanishing points.', reps: '1 full page', pit: 'Floating boxes.', fix: 'Draw through the bottom plane so boxes sit on the surface.' },
  { n: '11', name: 'Addition', p: 43, lvl: 3, purpose: 'Boolean unions; fuses compound primitives and calculates intersection seams.', reps: '15 compounds', pit: 'Unclear seam lines.', fix: 'Draw the exact collision slice where forms penetrate.' },
  { n: '12', name: 'Stacking & Queueing', p: 45, lvl: 3, purpose: 'Rhythmic repetition in space; systematic diminution of forms across depth.', reps: '10 queues', pit: 'Uniform sizes.', fix: 'Establish top and bottom convergence rails toward the horizon.' },
  { n: '13', name: 'Bending Form', p: 48, lvl: 3, purpose: 'Flexes rigid primitives; preserves volume under bending and compression.', reps: '20 bent tubes', pit: 'Pinched, collapsing tubes.', fix: 'Draw cross-contour rings showing consistent diameter.' },
  { n: '14', name: 'Organic Volumes', p: 51, lvl: 3, purpose: 'Non-geometric volumetric construction; bean masses wrapped with contour slices.', reps: '20 volumes', pit: 'Blobs looking 2D.', fix: 'Add wrapping contour rings that curve around the surface belly.' },
  { n: '15', name: 'Texture Bar', p: 54, lvl: 3, purpose: 'Material translation; encodes tactile surface properties into graphic ink marks.', reps: '5 swatches', pit: 'Uniform cross-hatching.', fix: 'Change mark shape — stippling, jagged cracks, bark grain.' },
  { n: '16', name: 'Subtraction', p: 58, lvl: 4, purpose: 'Boolean carving; chisels volumetric negative space out of solid primitives.', reps: '10 carved boxes', pit: 'Losing perspective alignment.', fix: 'Project carving lines back to the master vanishing points.' },
  { n: '17', name: 'Perspective Clusters', p: 61, lvl: 4, purpose: 'Multi-form spatial hierarchy; several primitives in one unified perspective space.', reps: '15 clusters', pit: 'Disjointed scales.', fix: 'Establish a shared ground plane and horizon line first.' },
  { n: '18', name: 'Box Figures', p: 64, lvl: 4, purpose: 'Mannequin foundation; human anatomy as 3 core masses — head, ribcage, pelvis.', reps: '15–20 figures', pit: 'Stiff wooden poses.', fix: 'Draw the dynamic line of action BEFORE placing any boxes.' },
  { n: '19', name: 'Volume Mapping', p: 67, lvl: 4, purpose: 'Surface contour wrapping; projects flat patterns onto 3D undulating volumes.', reps: '10 volumes', pit: 'Pattern staying flat.', fix: 'Distort the pattern grid to follow surface cross-contours.' },
  { n: '20', name: 'Deconstruction', p: 70, lvl: 4, purpose: 'Reverse-engineering; breaks complex machinery and props into primitive blocks.', reps: '2–3 appliances', pit: 'Drawing surface details first.', fix: 'Block the outer silhouette as a simple box envelope.' },
  { n: '21', name: 'Mannequinization', p: 72, lvl: 5, purpose: 'Imaginative figure construction; believable human poses from imagination.', reps: '10–20 poses', pit: 'Disjointed limbs.', fix: 'Anchor joints with spherical hinges and volumetric cylinders.' },
  { n: '22', name: 'Magical Observation', p: 73, lvl: 5, purpose: 'Memory engine calibration; study a real object, hide it, redraw from memory.', reps: '3–5 objects', pit: 'Guessing details.', fix: 'Spend 3 solid minutes analysing structure before drawing.' },
  { n: '23', name: 'POV Drawing', p: 74, lvl: 5, purpose: 'First-person immersion; puts the viewer\u2019s camera inside the environment.', reps: '2–3 spaces', pit: 'Inconsistent eye level.', fix: 'Mark your eye level on the wall as the horizon line.' },
  { n: '24', name: 'Daily Highlight', p: 75, lvl: 5, purpose: 'Lifelong visual diary; one memorable daily scene or prop, from memory.', reps: '1 sketch / day', pit: 'Overcomplicating.', fix: 'Cap it at 10 minutes; chase essence, volume and gesture.' },
  { n: '25', name: 'Comic Book', p: 76, lvl: 5, purpose: 'Capstone synthesis; consistent characters and scenes across sequential panels.', reps: '1 multi-panel', pit: 'Preciousness and burnout.', fix: 'Use simplified PS2 mannequins; prioritise storytelling.' }
];

export const RUBRIC = [
  { t: 'Perspective & box convergence', err: 'Diverging lines that spread apart as they recede — reverse perspective.', fix: 'With a ruler and coloured pen, extend box edges backward. They must converge toward distant vanishing points, not fan outward.' },
  { t: 'Ellipses & minor axes', err: 'Tilted, lopsided ellipses that do not align with the cylindrical shaft.', fix: 'Draw the minor axis first. Both halves must mirror. The far ellipse should be rounder than the near one.' },
  { t: 'Mannequins & spatial overlap', err: 'Flat paper-cutout figures with stiff stick limbs.', fix: 'Wrap cross-contour bracelets around forearms, thighs and torso. Overlap joints so depth is forced.' },
  { t: 'Clothing & drapery', err: 'Random decorative squiggles and floating wrinkles.', fix: 'Circle the tension points first — pinch at inner elbow/knee, hang at shoulder/crotch. Every fold radiates from a tension point.' }
];

export const PIPELINE = [
  { n: '01', t: 'Idea', items: ['One-sentence premise', 'Tone, emotion, context', 'Avoid vague goals'] },
  { n: '02', t: 'Research', items: ['Targeted photo board', 'Break down unfamiliar props', 'Memory engine calibration'] },
  { n: '03', t: 'Thumbnails', items: ['Solve camera & horizon early', 'Block in PS2 wireframe', 'Hierarchy & focal points'] },
  { n: '04', t: 'Details', items: ['Overlay anatomy & clothing', 'Cross-contour textures', 'Line weight hierarchy'] }
];

export const PARTS_DOC = [
  { k: 'A', t: 'Warm-Up', m: '10 min', h: 'Motor calibration & line conviction', d: 'Cold hands draw from the wrist and produce timid, scratchy lines. The warm-up activates the kinetic chain from core to shoulder, calibrating stroke speed, momentum and pressure before you touch complex form.' },
  { k: 'B', t: 'The Drill', m: '45–60 min', h: 'Geometric encoding — the medicine', d: 'You cannot draw from imagination what your brain cannot construct mechanically. The drill isolates one technical variable and removes the pressure of making a finished artwork, building automaticity.' },
  { k: 'C', t: 'Projecting', m: '30–45 min', h: 'Creative synthesis — the meal', d: 'Drills without application produce exercise technicians who can draw 250 perfect cubes and still freeze at a blank page. Projecting stress-tests the day\u2019s drill inside a real creative problem.' },
  { k: 'D', t: 'Day 7', m: 'Full day', h: 'The 50% rule', d: 'If 100% of your drawing is rigorous practice and critique, the sketchbook becomes associated with stress. Exactly half your artistic life belongs to play — zero drills, zero self-critique.' }
];

export const KIT = [
  { t: 'Primary line pen', v: '0.5mm black fineliner', why: 'Micron 05, Staedtler Pigment Liner or Uni Pin. Ink is permanent — it denies you the eraser, forces you to plan the stroke, and exposes chicken-scratching.' },
  { t: 'Secondary tone pen', v: 'Standard ballpoint', why: 'Bic Cristal. Responds to hand pressure, so you get soft volumetric under-drawing and smooth cross-hatch gradients.' },
  { t: 'Paper', v: '80gsm unruled copy paper', why: 'Bound sketchbooks trigger performance anxiety. Loose paper has zero preciousness — burn 10 pages without flinching.' },
  { t: 'Shoulder pad', v: 'A3 / 11×17 newsprint', why: 'You physically cannot draw from the wrist across 17 inches. Large paper forces shoulder and elbow rotation.' }
];

export const DIGITAL = [
  { t: 'Brush', v: 'Hard round or 6B pencil', why: 'Size dynamics ON for pressure-sensitive width. Opacity jitter OFF — muddy semi-transparent overlaps hide structural errors, and clean form drawing needs crisp decisive edges.' },
  { t: 'Stabilization', v: '0–15% for drills', why: 'Heavy smoothing fakes line confidence for you, and it is your real motor control that has to develop. Raise to 40–60% only for final project inking.' },
  { t: 'Canvas', v: '3000 × 4000 px @ 300 DPI', why: 'Large enough that the whole drawing stays visible at 100%.' },
  { t: 'The golden rule', v: 'Never zoom past 100%', why: 'Zooming in during construction destroys your perception of overall proportion and spatial relationships. That is what causes bobblehead figures and distorted perspective.' }
];

export const SOURCES = [
  { t: 'The companion book', v: '25 Drawing Exercises to Draw From Your Imagination', by: 'brokendraw · 76 pages', why: 'The source of all 25 exercises, their page references, rep counts and pitfalls. You need this one.', u: 'https://brokendraw.com/book' },
  { t: 'The roadmap video', v: 'Giving away my entire drawing class', by: 'brokendraw · 43 min', why: 'The walkthrough this whole plan is built from, with homework and examples. Each week links to its own timestamp.', u: 'https://www.youtube.com/watch?v=zYzgxUVSpUc' },
  { t: 'Linework & ink discipline', v: 'The Dynamic Bible', by: 'Peter Han · 79 pages', why: 'ArtCenter shoulder linework, ghosting, form cuts. Referenced by page range every week.', u: '' },
  { t: 'The mechanical gym', v: 'Drawabox.com', by: 'Free, online', why: 'Progressive drills, the 250 Box Challenge and the original 50% rule. Weeks 1–3 and 7 link directly into lessons.', u: 'https://drawabox.com/' },
  { t: 'The curriculum map', v: 'The Entire Drawing Curriculum', by: 'Infographic', why: 'One-page visual of all eight weeks, useful pinned above your desk.', u: 'https://drive.google.com/file/d/1VQOblDjUMb5K72TLC6R20N8ow-dooLeN/view' }
];

export const SCAFFOLD = [
  { d: 'Information', low: 'Ruler perspective grid', mid: 'Horizon line + vanishing points', high: 'Horizon only → pure freehand intuition', fix: 'If perspective looks wild, rule a horizon and 2 VPs. Remove them as confidence grows.' },
  { d: 'Mechanical', low: 'Ruler + pencil + eraser', mid: 'Pencil only → ballpoint', high: 'Fineliner → brush pen', fix: 'If the fineliner freezes you, drop to pencil and draw through. Then return with zero guide marks.' },
  { d: 'Conceptual', low: 'Static perspective primitives', mid: 'Form rotations & boolean cuts', high: 'Anatomy → textures → sequential scenes', fix: 'If rotating a costumed character fails, scale back to rotating basic box mannequins.' }
];

export const VAULT = [
  { g: 'Core methodology & mindset', v: [
    { t: 'Giving away my entire drawing class', by: 'brokendraw', id: 'zYzgxUVSpUc' },
    { t: 'Improve your art in three steps (the learning loop)', by: 'brokendraw', id: 'A9YhcZIwH3c' },
    { t: 'How I wish I learned art (the Goldilocks zone)', by: 'brokendraw', id: 'tYanSuLS2i4' },
    { t: '25 essential drawing exercises: unlock your imagination', by: 'brokendraw', id: 'BKiopm83L8c' }
  ] },
  { g: 'Weeks 1–2 · Fundamentals & perspective primitives', v: [
    { t: 'Dynamic sketching & line weight fundamentals', by: 'Peter Han', id: '1L1bQo4W81U' },
    { t: 'Lines, ellipses, and ghosting method', by: 'Drawabox', id: 'd0e3rFpS04o' },
    { t: 'Visual communication with Nathan Cooke', by: 'Kazone Art', id: 'oK-4wUbBmJI' },
    { t: 'How to actually use boxes to draw better', by: 'brokendraw', id: 'VBAJDepILYc' },
    { t: 'Drawing the box', by: 'Athoro', id: 'Jwti08d0jYk' },
    { t: 'What to THINK of when drawing your cylinders', by: 'Athoro', id: 'BHvXszH1fdI' },
    { t: 'Drawing with form', by: 'Zeph Draws', id: 'AabFcueorqg' },
    { t: 'Spatial awareness 1 — form rotation', by: 'Zeph Draws', id: 'NijDzUGNVfQ' }
  ] },
  { g: 'Week 3 · Form manipulation & visual library', v: [
    { t: 'How the horizon line ACTUALLY works', by: 'brokendraw', id: '6xUqTKQrMr0' },
    { t: 'Expand your visual library with this memorization technique', by: 'brokendraw', id: 'w3ROXZLZZ_k' },
    { t: 'Spatial awareness 2 — perspective intuition', by: 'Zeph Draws', id: 'f5Bq-ugRv3E' },
    { t: 'Developing a visual library', by: 'Zeph Draws', id: 'YY5jVOwz4Pg' }
  ] },
  { g: 'Weeks 4–5 · Figures, anatomy & head carving', v: [
    { t: 'This curve will change how you draw figures', by: 'Jae-Gwang Park · Proko', id: 'RDPVo6TPPbk' },
    { t: 'Drawing anatomy is easier than you think', by: 'brokendraw', id: 'WkmZLi8bNBM' },
    { t: 'How to draw like Kim Jung Gi (for free)', by: 'brokendraw', id: 'EL5kn_GLq40' },
    { t: 'How to turn mannequins into real anatomy', by: 'brokendraw', id: 'J9MYR-BLzNg' },
    { t: 'Draw the head from any angle', by: 'Zeph Draws', id: 'KjgSYqr77C0' },
    { t: 'Draw faces from ANY angle — a complete guide', by: 'brokendraw', id: 'gvro2NslMfA' }
  ] },
  { g: 'Weeks 6–7 · Clothing, textures & style', v: [
    { t: 'Why studying folds won\u2019t help you draw clothing', by: 'Tom Fox Draws', id: '1qIy7LyYLnI' },
    { t: 'Understanding every type of clothing fold', by: 'Michael Hampton · Proko', id: 'd07NanfYT8U' },
    { t: 'How I design characters in 5 easy steps', by: 'brokendraw', id: 'FBXb8woYQn0' },
    { t: 'Texture drawing in shape and light', by: 'Modern Day James', id: '4Y0XVPprbYY' },
    { t: 'Learn to draw texture and materials', by: 'Tyler Edlin', id: '-2xhmKLsPO8' }
  ] },
  { g: 'Week 8 · Scene building & imagination', v: [
    { t: 'How to invent scenes from imagination', by: 'Rembert Montald · Proko', id: 'fSCz8akhJzw' },
    { t: '5 levels of drawing from imagination', by: 'brokendraw', id: '_YuSTSfl-7s' },
    { t: 'How I draw believable scenes from imagination', by: 'brokendraw', id: 'dWrT-MakDIc' }
  ] }
];
