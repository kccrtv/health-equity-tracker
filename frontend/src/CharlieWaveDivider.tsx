// The one deliberate graphic flourish in the Charlie shell — a thin wave-line
// divider under the top bar. `text-alt-green` pulls the real HET brand green
// token (see styles/tokens/colors.ts) via `currentColor`; no hardcoded hex.
export default function CharlieWaveDivider() {
  return (
    <svg
      viewBox='0 0 400 12'
      preserveAspectRatio='none'
      className='block h-3 w-full text-alt-green'
      aria-hidden='true'
    >
      <path
        d='M0,6 Q25,0 50,6 T100,6 T150,6 T200,6 T250,6 T300,6 T350,6 T400,6'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
      />
    </svg>
  )
}
