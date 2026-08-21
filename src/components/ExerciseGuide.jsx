// Consistent infographic-style SVG illustrations for every exercise.
// Shared palette + primitives keep the visual style uniform: neutral
// gray equipment, a simplified neutral figure, blue movement arrows,
// and small highlight dots on important contact/adjustment points.

const C = {
  equip: '#b9c2cf',
  equipDark: '#8f99a8',
  figure: '#57606f',
  skin: '#57606f',
  accent: '#2563eb',
  accentSoft: '#93c5fd',
  floor: '#dde3ea',
  weight: '#6b7480'
}

const LIMB = { stroke: C.figure, strokeWidth: 9, strokeLinecap: 'round', fill: 'none' }
const LIMB_GHOST = {
  stroke: C.accentSoft,
  strokeWidth: 9,
  strokeLinecap: 'round',
  fill: 'none',
  opacity: 0.75
}

function Head({ x, y, r = 11, ghost = false }) {
  return <circle cx={x} cy={y} r={r} fill={ghost ? C.accentSoft : C.figure} opacity={ghost ? 0.75 : 1} />
}

function Arrow({ d, curved = false }) {
  return (
    <g stroke={C.accent} strokeWidth="4" fill="none" strokeLinecap="round">
      <path d={d} markerEnd="url(#ff-arrow)" />
    </g>
  )
}

function Dot({ x, y }) {
  return (
    <g>
      <circle cx={x} cy={y} r="8" fill={C.accent} opacity="0.18" />
      <circle cx={x} cy={y} r="3.5" fill={C.accent} />
    </g>
  )
}

function Floor({ y = 178 }) {
  return <rect x="12" y={y} width="296" height="6" rx="3" fill={C.floor} />
}

function Dumbbell({ x, y, angle = 0, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      <rect x="-14" y="-2.5" width="28" height="5" rx="2.5" fill={C.weight} />
      <rect x="-19" y="-8" width="7" height="16" rx="3" fill={C.weight} />
      <rect x="12" y="-8" width="7" height="16" rx="3" fill={C.weight} />
    </g>
  )
}

/* ---------- Scenes ---------- */

function LatPulldown() {
  return (
    <>
      <rect x="228" y="24" width="10" height="150" rx="4" fill={C.equip} />
      <rect x="196" y="24" width="76" height="10" rx="5" fill={C.equip} />
      <line x1="160" y1="30" x2="160" y2="58" stroke={C.equipDark} strokeWidth="3" />
      <path d="M118 60 Q160 74 202 60" stroke={C.equipDark} strokeWidth="7" fill="none" strokeLinecap="round" />
      <rect x="132" y="128" width="60" height="10" rx="5" fill={C.equip} />
      <rect x="138" y="138" width="10" height="40" rx="4" fill={C.equip} />
      <rect x="120" y="112" width="26" height="9" rx="4.5" fill={C.equipDark} />
      <Head x={160} y={84} />
      <path d="M160 95 L160 128" {...LIMB} />
      <path d="M160 100 L128 66" {...LIMB} />
      <path d="M160 100 L192 66" {...LIMB} />
      <path d="M160 128 L146 152 L146 172" {...LIMB} />
      <path d="M160 128 L176 152 L176 172" {...LIMB} />
      <Arrow d="M236 70 L236 108" />
      <Dot x={128} y={116} />
      <Floor />
    </>
  )
}

function InclinePress() {
  return (
    <>
      <path d="M76 160 L156 160 L216 106" stroke={C.equip} strokeWidth="16" fill="none" strokeLinecap="round" />
      <rect x="96" y="160" width="10" height="20" fill={C.equipDark} />
      <rect x="188" y="140" width="10" height="40" fill={C.equipDark} />
      <Head x={212} y={92} />
      <path d="M203 102 L150 148" {...LIMB} />
      <path d="M150 148 L108 148 L96 172" {...LIMB} />
      <path d="M188 116 L196 84" {...LIMB} />
      <path d="M172 130 L180 96" {...LIMB} />
      <Dumbbell x={198} y={78} angle={-20} />
      <Dumbbell x={182} y={90} angle={-20} scale={0.9} />
      <Arrow d="M222 74 L238 52" />
      <Dot x={216} y={106} />
      <Floor />
    </>
  )
}

function CableRow() {
  return (
    <>
      <rect x="34" y="60" width="12" height="114" rx="5" fill={C.equip} />
      <line x1="46" y1="120" x2="118" y2="120" stroke={C.equipDark} strokeWidth="3" />
      <rect x="60" y="146" width="26" height="20" rx="5" fill={C.equip} />
      <rect x="178" y="150" width="52" height="12" rx="6" fill={C.equip} />
      <Head x={200} y={78} />
      <path d="M200 89 L196 148" {...LIMB} />
      <path d="M198 106 L128 118" {...LIMB} />
      <path d="M196 148 L128 150 L120 166" {...LIMB} />
      <Arrow d="M150 100 L196 96" />
      <Dot x={122} y={120} />
      <Dot x={116} y={162} />
      <Floor />
    </>
  )
}

function LateralRaise() {
  return (
    <>
      <Head x={160} y={54} />
      <path d="M160 65 L160 122" {...LIMB} />
      <path d="M160 78 L118 96" {...LIMB_GHOST} />
      <path d="M160 78 L202 96" {...LIMB_GHOST} />
      <path d="M160 78 L104 74" {...LIMB} />
      <path d="M160 78 L216 74" {...LIMB} />
      <Dumbbell x={98} y={72} angle={90} scale={0.85} />
      <Dumbbell x={222} y={72} angle={90} scale={0.85} />
      <path d="M160 122 L148 150 L148 174" {...LIMB} />
      <path d="M160 122 L172 150 L172 174" {...LIMB} />
      <Arrow d="M104 100 Q88 88 96 66" />
      <Arrow d="M216 100 Q232 88 224 66" />
      <Floor />
    </>
  )
}

function TricepPushdown() {
  return (
    <>
      <rect x="196" y="20" width="12" height="154" rx="5" fill={C.equip} />
      <line x1="176" y1="26" x2="176" y2="66" stroke={C.equipDark} strokeWidth="3" />
      <path d="M168 66 L184 66 L188 84 L164 84 Z" fill={C.equipDark} />
      <Head x={140} y={58} />
      <path d="M140 69 L140 128" {...LIMB} />
      <path d="M140 84 L166 96 L172 78" {...LIMB_GHOST} />
      <path d="M140 84 L166 96 L176 122" {...LIMB} />
      <path d="M140 128 L130 154 L130 176" {...LIMB} />
      <path d="M140 128 L152 154 L152 176" {...LIMB} />
      <Arrow d="M188 92 Q196 108 188 124" />
      <Dot x={166} y={96} />
      <Floor />
    </>
  )
}

function LegPress() {
  return (
    <>
      <path d="M60 170 L120 170 L96 128 L48 148 Z" fill={C.equip} />
      <path d="M118 116 L84 96" stroke={C.equip} strokeWidth="16" strokeLinecap="round" />
      <rect x="196" y="84" width="16" height="72" rx="6" fill={C.equipDark} transform="rotate(18 204 120)" />
      <Head x={92} y={74} />
      <path d="M96 84 L112 128" {...LIMB} />
      <path d="M112 128 L156 140 L192 116" {...LIMB} />
      <path d="M112 128 L152 120 L188 102" {...LIMB} />
      <path d="M100 96 L124 110" {...LIMB} />
      <Arrow d="M216 128 L248 142" />
      <Dot x={200} y={112} />
      <Dot x={92} y={130} />
      <Floor />
    </>
  )
}

function HamstringCurl() {
  return (
    <>
      <rect x="60" y="120" width="150" height="14" rx="7" fill={C.equip} />
      <rect x="80" y="134" width="12" height="42" rx="5" fill={C.equipDark} />
      <rect x="180" y="134" width="12" height="42" rx="5" fill={C.equipDark} />
      <Head x={78} y={102} />
      <path d="M89 108 L170 112" {...LIMB} />
      <path d="M170 112 L216 118" {...LIMB_GHOST} />
      <path d="M170 112 L210 88" {...LIMB} />
      <circle cx="216" cy="84" r="9" fill={C.equipDark} />
      <path d="M100 112 L128 124" {...LIMB} />
      <Arrow d="M234 110 Q238 92 224 78" />
      <Dot x={216} y={84} />
      <Floor />
    </>
  )
}

function LegExtension() {
  return (
    <>
      <rect x="108" y="94" width="70" height="14" rx="7" fill={C.equip} />
      <rect x="100" y="52" width="14" height="52" rx="6" fill={C.equip} />
      <rect x="120" y="108" width="14" height="68" rx="6" fill={C.equipDark} />
      <Head x={116} y={44} />
      <path d="M118 55 L128 96" {...LIMB} />
      <path d="M128 96 L172 100" {...LIMB} />
      <path d="M172 100 L184 148" {...LIMB_GHOST} />
      <path d="M172 100 L216 92" {...LIMB} />
      <circle cx="222" cy="90" r="9" fill={C.equipDark} />
      <path d="M122 66 L146 84" {...LIMB} />
      <Arrow d="M196 142 Q226 130 232 104" />
      <Dot x={222} y={90} />
      <Dot x={172} y={100} />
      <Floor />
    </>
  )
}

function CalfRaise() {
  return (
    <>
      <rect x="120" y="164" width="90" height="14" rx="4" fill={C.equip} />
      <Head x={158} y={40} />
      <path d="M158 51 L158 110" {...LIMB} />
      <path d="M158 66 L184 82" {...LIMB} />
      <path d="M158 110 L150 138 L150 160" {...LIMB} />
      <path d="M158 110 L168 138 L168 160" {...LIMB} />
      <path d="M146 162 L158 156" stroke={C.figure} strokeWidth="7" strokeLinecap="round" />
      <path d="M164 162 L176 156" stroke={C.figure} strokeWidth="7" strokeLinecap="round" />
      <rect x="196" y="60" width="10" height="118" rx="4" fill={C.equip} />
      <Arrow d="M120 140 L120 108" />
      <Dot x={158} y={160} />
      <Floor />
    </>
  )
}

function Plank() {
  return (
    <>
      <rect x="52" y="158" width="120" height="8" rx="4" fill={C.floor} />
      <Head x={82} y={112} />
      <path d="M93 118 L188 138" {...LIMB} />
      <path d="M96 124 L84 152 L60 152" {...LIMB} />
      <path d="M188 138 L226 156" {...LIMB} />
      <path d="M118 122 L162 132" stroke={C.accent} strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round" fill="none" />
      <Dot x={82} y={152} />
      <Dot x={226} y={156} />
      <Floor />
    </>
  )
}

function SupportedRow() {
  return (
    <>
      <path d="M92 158 L172 106" stroke={C.equip} strokeWidth="16" strokeLinecap="round" />
      <rect x="118" y="140" width="10" height="38" fill={C.equipDark} />
      <rect x="152" y="120" width="10" height="58" fill={C.equipDark} />
      <Head x={186} y={88} />
      <path d="M178 96 L120 136" {...LIMB} />
      <path d="M162 108 L164 146" {...LIMB_GHOST} />
      <path d="M162 108 L150 128 L166 138" {...LIMB} />
      <Dumbbell x={168} y={144} angle={0} scale={0.85} />
      <path d="M120 136 L96 158 L96 176" {...LIMB} />
      <Arrow d="M196 140 Q192 122 180 114" />
      <Dot x={166} y={104} />
      <Floor />
    </>
  )
}

function ChestPress() {
  return (
    <>
      <rect x="112" y="70" width="16" height="106" rx="7" fill={C.equip} />
      <rect x="96" y="120" width="48" height="14" rx="7" fill={C.equip} />
      <Head x={132} y={62} />
      <path d="M132 73 L132 126" {...LIMB} />
      <path d="M132 88 L164 96 L164 82" {...LIMB_GHOST} />
      <path d="M132 88 L188 88" {...LIMB} />
      <rect x="188" y="76" width="10" height="24" rx="5" fill={C.equipDark} />
      <path d="M132 126 L160 140 L160 172" {...LIMB} />
      <Arrow d="M176 64 L212 64" />
      <Dot x={193} y={88} />
      <Floor />
    </>
  )
}

function OverheadPress() {
  return (
    <>
      <rect x="112" y="66" width="14" height="110" rx="6" fill={C.equip} />
      <rect x="128" y="128" width="52" height="12" rx="6" fill={C.equip} />
      <Head x={148} y={62} />
      <path d="M146 73 L146 130" {...LIMB} />
      <path d="M146 88 L176 98 L188 76" {...LIMB_GHOST} />
      <path d="M146 88 L172 68 L172 40" {...LIMB} />
      <Dumbbell x={172} y={32} scale={0.9} />
      <path d="M146 130 L172 142 L172 174" {...LIMB} />
      <Arrow d="M204 84 L204 44" />
      <Dot x={146} y={92} />
      <Floor />
    </>
  )
}

function FacePull() {
  return (
    <>
      <rect x="236" y="24" width="12" height="150" rx="5" fill={C.equip} />
      <line x1="216" y1="66" x2="176" y2="72" stroke={C.equipDark} strokeWidth="3" />
      <path d="M216 58 L224 66 L216 74" fill={C.equipDark} />
      <Head x={124} y={64} />
      <path d="M124 75 L124 132" {...LIMB} />
      <path d="M124 84 L168 92" {...LIMB_GHOST} />
      <path d="M124 84 L156 68 L176 72" {...LIMB} />
      <path d="M124 132 L114 158 L114 178" {...LIMB} />
      <path d="M124 132 L136 158 L136 178" {...LIMB} />
      <Arrow d="M196 92 Q176 96 158 88" />
      <Dot x={176} y={72} />
      <Floor />
    </>
  )
}

function BicepCurl() {
  return (
    <>
      <Head x={150} y={50} />
      <path d="M150 61 L150 122" {...LIMB} />
      <path d="M150 76 L172 100 L182 128" {...LIMB_GHOST} />
      <path d="M150 76 L172 100 L186 76" {...LIMB} />
      <Dumbbell x={192} y={70} angle={-24} scale={0.9} />
      <path d="M150 122 L140 150 L140 174" {...LIMB} />
      <path d="M150 122 L162 150 L162 174" {...LIMB} />
      <Arrow d="M204 118 Q216 96 202 74" />
      <Dot x={172} y={100} />
      <Floor />
    </>
  )
}

function RDL() {
  return (
    <>
      <Head x={120} y={56} />
      <path d="M128 64 L176 96" {...LIMB} />
      <path d="M176 96 L176 140 L176 174" {...LIMB} />
      <path d="M170 118 L152 148 L156 174" {...LIMB} />
      <path d="M134 72 L138 120" {...LIMB} />
      <Dumbbell x={140} y={128} scale={0.9} />
      <path d="M96 44 L150 80" stroke={C.accent} strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round" fill="none" />
      <Arrow d="M216 96 Q222 72 204 58" />
      <Dot x={176} y={96} />
      <Dot x={140} y={128} />
      <Floor />
    </>
  )
}

function AbCrunch() {
  return (
    <>
      <rect x="120" y="98" width="72" height="14" rx="7" fill={C.equip} />
      <rect x="112" y="50" width="14" height="56" rx="6" fill={C.equip} />
      <rect x="132" y="112" width="14" height="64" rx="6" fill={C.equipDark} />
      <Head x={132} y={44} ghost />
      <path d="M134 55 L142 98" {...LIMB_GHOST} />
      <Head x={142} y={58} />
      <path d="M144 68 L148 100" {...LIMB} />
      <path d="M146 74 L172 62" {...LIMB} />
      <path d="M148 100 L184 104" {...LIMB} />
      <path d="M184 104 L196 148" {...LIMB} />
      <Arrow d="M176 36 Q194 48 192 70" />
      <Dot x={148} y={100} />
      <Floor />
    </>
  )
}

function Walk() {
  return (
    <>
      <path d="M40 168 L280 128" stroke={C.equip} strokeWidth="10" strokeLinecap="round" />
      <Head x={158} y={62} />
      <path d="M158 73 L154 116" {...LIMB} />
      <path d="M156 84 L176 102" {...LIMB} />
      <path d="M156 84 L136 100" {...LIMB} />
      <path d="M154 116 L178 132 L182 148" {...LIMB} />
      <path d="M154 116 L134 140 L128 158" {...LIMB} />
      <Arrow d="M210 108 L246 100" />
    </>
  )
}

function Bike() {
  return (
    <>
      <circle cx="120" cy="146" r="26" fill="none" stroke={C.equip} strokeWidth="8" />
      <rect x="150" y="98" width="12" height="56" rx="5" fill={C.equip} transform="rotate(14 156 126)" />
      <rect x="106" y="88" width="42" height="10" rx="5" fill={C.equip} />
      <rect x="176" y="102" width="30" height="10" rx="5" fill={C.equipDark} />
      <Head x={196} y={62} />
      <path d="M194 73 L182 108" {...LIMB} />
      <path d="M192 84 L156 92" {...LIMB} />
      <path d="M182 108 L156 128 L146 146" {...LIMB} />
      <circle cx="146" cy="148" r="7" fill={C.equipDark} />
      <Arrow d="M110 120 A28 28 0 0 1 148 138" />
      <Dot x={182} y={108} />
      <Floor />
    </>
  )
}

const SCENES = {
  latPulldown: LatPulldown,
  inclinePress: InclinePress,
  cableRow: CableRow,
  lateralRaise: LateralRaise,
  tricepPushdown: TricepPushdown,
  legPress: LegPress,
  hamstringCurl: HamstringCurl,
  legExtension: LegExtension,
  calfRaise: CalfRaise,
  plank: Plank,
  supportedRow: SupportedRow,
  chestPress: ChestPress,
  overheadPress: OverheadPress,
  facePull: FacePull,
  bicepCurl: BicepCurl,
  rdl: RDL,
  abCrunch: AbCrunch,
  walk: Walk,
  bike: Bike
}

export default function ExerciseGuide({ illustration, label }) {
  const Scene = SCENES[illustration]
  return (
    <div className="guide-figure" role="img" aria-label={label ? `Illustration: ${label}` : 'Exercise illustration'}>
      <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker
            id="ff-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={C.accent} />
          </marker>
        </defs>
        {Scene ? (
          <Scene />
        ) : (
          <g>
            <Floor />
            <Head x={160} y={70} />
            <path d="M160 81 L160 140" {...LIMB} />
          </g>
        )}
      </svg>
    </div>
  )
}
