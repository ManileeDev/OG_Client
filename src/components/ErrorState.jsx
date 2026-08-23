import { RotateCcw } from 'lucide-react'

/* Doodles are stroke-based so they inherit theme colors: main lines follow
   text-ink-dim, highlights use text-primary — both adapt to light/dark. */
function Doodle({ label, children }) {
  return (
    <svg
      viewBox="0 0 140 140"
      role="img"
      aria-label={label}
      className="h-36 w-36 text-ink-dim"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

function LostSock() {
  return (
    <Doodle label="A lost sock looking around">
      {/* sock */}
      <path d="M78 22 H112 V76 C113 93 103 106 87 108 L64 110 C50 112 42 99 48 89 C53 81 62 79 69 74 C75 70 77 65 77 57 Z" />
      <path d="M78 36 H112" />
      <path d="M86 24 v8 M95 24 v8 M104 24 v8" strokeWidth="2.5" />
      {/* toe stripes */}
      <path d="M55 93 C62 99 71 101 79 99" strokeWidth="2.5" />
      <path d="M60 86 C66 91 73 93 80 92" strokeWidth="2.5" />
      {/* face */}
      <circle cx="90" cy="52" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="103" cy="52" r="2.5" fill="currentColor" stroke="none" />
      <path d="M91 60 Q96.5 66 102 60" />
      {/* question marks + sparkle */}
      <g className="text-primary">
        <path d="M26 44 C26 36 38 36 38 44 C38 50 32 50 32 56 M32 64 v.5" />
        <path d="M50 24 C50 19 58 19 58 24 C58 28 54 28 54 32 M54 38 v.5" strokeWidth="2.5" />
        <path d="M30 92 l6 6 M36 92 l-6 6" strokeWidth="2.5" />
      </g>
    </Doodle>
  )
}

function DizzyServer() {
  return (
    <Doodle label="A dizzy server with a bandage">
      {/* box + feet */}
      <rect x="42" y="34" width="56" height="74" rx="10" />
      <path d="M58 108 v8 h7 M82 108 v8 h7" strokeWidth="2.5" />
      {/* vents + LED */}
      <path d="M52 46 h12 M52 52 h7" strokeWidth="2.5" />
      <circle cx="88" cy="48" r="2.5" fill="currentColor" stroke="none" className="text-primary" />
      {/* dizzy eyes + wobbly mouth */}
      <path d="M56 70 l9 9 M65 70 l-9 9" />
      <path d="M75 70 l9 9 M84 70 l-9 9" />
      <path d="M59 94 Q64.5 89 70 94 Q75.5 99 81 94" />
      {/* bandage + smoke */}
      <g className="text-primary">
        <path d="M96 22 l13 13 M109 22 l-13 13" />
        <circle cx="115" cy="46" r="3.5" strokeWidth="2.5" />
        <circle cx="122" cy="36" r="2.5" strokeWidth="2.5" />
      </g>
    </Doodle>
  )
}

function ShyLock() {
  return (
    <Doodle label="A shy padlock and a key">
      {/* shackle + body */}
      <path d="M55 60 V44 a15 15 0 0 1 30 0 V60" />
      <rect x="44" y="60" width="52" height="44" rx="10" />
      {/* face */}
      <circle cx="60" cy="78" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="80" cy="78" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="70" cy="89" r="3.5" strokeWidth="2.5" />
      {/* blush */}
      <path d="M52 84 h5 M83 84 h5" strokeWidth="2.5" className="text-primary" />
      {/* floating key */}
      <g className="text-primary" transform="rotate(-25 114 44)">
        <circle cx="114" cy="32" r="6.5" />
        <path d="M114 39 V58 M114 50 h6 M114 57 h5" strokeWidth="2.5" />
      </g>
      <path d="M26 48 v10 M21 53 h10" strokeWidth="2.5" className="text-primary" />
    </Doodle>
  )
}

function TangledTag() {
  return (
    <Doodle label="A confused price tag with a tangled string">
      <g transform="rotate(-10 74 74)">
        {/* tag + hole */}
        <path d="M56 58 h44 a8 8 0 0 1 8 8 v20 a8 8 0 0 1 -8 8 h-44 l-12 -18 Z" />
        <circle cx="56" cy="76" r="3" />
        {/* confused face: one raised brow */}
        <path d="M72 66 q4 -3 8 0" strokeWidth="2.5" />
        <circle cx="76" cy="73" r="2.5" fill="currentColor" stroke="none" />
        <circle cx="92" cy="73" r="2.5" fill="currentColor" stroke="none" />
        <path d="M74 84 q4 3 8 0 q4 -3 8 0" strokeWidth="2.5" />
      </g>
      {/* tangled string */}
      <path
        d="M46 62 C38 50 52 44 44 34 C38 26 50 20 60 26 C68 31 60 38 68 40"
        strokeWidth="2.5"
        className="text-primary"
      />
      {/* confusion scribble */}
      <path d="M94 30 c6 -10 18 -4 11 3 c-7 7 4 12 11 5" strokeWidth="2.5" className="text-primary" />
    </Doodle>
  )
}

function UnpluggedCable() {
  return (
    <Doodle label="An unplugged cable and a sad socket">
      {/* plug on a cable */}
      <path d="M8 88 C22 88 18 72 32 72" />
      <rect x="32" y="63" width="18" height="18" rx="5" />
      <path d="M50 68 h9 M50 76 h9" strokeWidth="2.5" />
      {/* gap */}
      <path d="M64 72 h18" strokeWidth="2.5" strokeDasharray="2 6" className="text-primary" />
      {/* socket with a sad face */}
      <circle cx="102" cy="72" r="17" />
      <path d="M119 72 C130 72 126 88 136 88" />
      <circle cx="96" cy="68" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="108" cy="68" r="2.5" fill="currentColor" stroke="none" />
      <path d="M96 81 q6 -6 12 0" />
      {/* sweat drop + spark */}
      <g className="text-primary">
        <path d="M88 46 q-4 7 0 9 q4 -2 0 -9" strokeWidth="2.5" />
        <path d="M56 40 l4 4 M60 40 l-4 4" strokeWidth="2.5" />
      </g>
    </Doodle>
  )
}

const ERRORS = {
  0: {
    doodle: UnpluggedCable,
    kicker: 'Connection lost',
    title: "Can't reach the server",
    message: 'The connection came unplugged. Make sure the backend is running, then try again.',
  },
  400: {
    doodle: TangledTag,
    kicker: 'Error 400',
    title: 'That request got tangled',
    message: "Something about that request didn't make sense to the server. Adjust it and try again.",
  },
  401: {
    doodle: ShyLock,
    kicker: 'Error 401',
    title: 'You need a key for this',
    message: "You're not signed in, or your session has expired. Sign in and try again.",
  },
  403: {
    doodle: ShyLock,
    kicker: 'Error 403',
    title: 'Access restricted',
    message: 'Your account is signed in, but it does not have permission to view this area.',
  },
  404: {
    doodle: LostSock,
    kicker: 'Error 404',
    title: "This one's gone missing",
    message: "Like a sock in the laundry, whatever you're looking for can't be found.",
  },
  500: {
    doodle: DizzyServer,
    kicker: 'Error 500',
    title: 'Our server needs a moment',
    message: "Something broke on our side — it's not you. Give it a moment and try again.",
  },
}

function resolveStatus(status, error) {
  const code = status ?? error?.status
  if (code === undefined || code === null) return 500
  if (code >= 502 && code <= 504) return 0 // gateway down ≈ unreachable
  return ERRORS[code] ? code : 500
}

export default function ErrorState({ error, status, onRetry, action, className = '' }) {
  const { doodle: DoodleArt, kicker, title, message } = ERRORS[resolveStatus(status, error)]

  return (
    <div
      className={`flex flex-col items-center rounded-xl border border-edge bg-panel px-6 py-12 text-center ${className}`}
    >
      <DoodleArt />
      <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-accent">{kicker}</div>
      <h2 className="mt-1 font-display text-2xl text-ink">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-ink-dim">{message}</p>
      <div className="mt-6 flex items-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-btn-ink hover:opacity-90"
          >
            <RotateCcw size={15} /> Try again
          </button>
        )}
        {action}
      </div>
    </div>
  )
}
