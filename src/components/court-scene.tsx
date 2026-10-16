import type { Node } from '@/lib/types';
export function CourtScene({nodes = [], active = false}: {nodes?: Node[]; active?: boolean}) {
  return <svg viewBox="0 0 680 390" className="court-scene" role="img" aria-label="Architectural view of the CHAMBER HOUSE courtroom">
    <defs><linearGradient id="wall" x2="0" y2="1"><stop stopColor="#f3ebde"/><stop offset="1" stopColor="#d7c9b6"/></linearGradient><linearGradient id="floor" x2="1" y2="1"><stop stopColor="#e9dfce"/><stop offset="1" stopColor="#fbf7ee"/></linearGradient><linearGradient id="desk" x2="0" y2="1"><stop stopColor="#75565b"/><stop offset="1" stopColor="#402830"/></linearGradient><filter id="shadow"><feGaussianBlur stdDeviation="11"/></filter><pattern id="tiles" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="matrix(1 .35 -1 .35 340 150)"><rect width="40" height="40" fill="none" stroke="#b8a88f" strokeWidth=".6"/></pattern></defs>
    <ellipse cx="350" cy="327" rx="260" ry="36" opacity=".15" filter="url(#shadow)" fill="#634737"/>
    <path d="M65 225 341 104 622 224 350 364Z" fill="#b8a58e"/>
    <path d="M65 215 341 94 622 214 350 354Z" fill="url(#floor)" stroke="#c4b39c"/>
    <path d="M65 215 341 94 622 214 350 354Z" fill="url(#tiles)" opacity=".7"/>
    <path d="M65 215V102L341 1V94Z" fill="url(#wall)" stroke="#cfbfa8"/>
    <path d="M341 1 622 104V214L341 94Z" fill="#e6dccc" stroke="#cfbfa8"/>
    {[0,1,2,3,4].map(i=><g key={i} transform={`translate(${91+i*48},${91-i*18})`}><path d="M0 100V16Q0-6 18-9Q36-11 36 4V86" fill="#d8cbb8" stroke="#bba78c" strokeWidth="1"/><path d="M6 95V20Q6 3 18 0Q30-2 30 10V87" fill="#eee6d8" stroke="#c5b296"/></g>)}
    {[0,1,2,3,4].map(i=><g key={i} transform={`translate(${367+i*48},${20+i*18})`}><path d="M0 90V5Q0-12 16-8Q34-4 34 18V101" fill="#dacdbb" stroke="#c1ae94"/><path d="M6 92V12Q6-1 17 2Q28 5 28 20V98" fill="#f4eddf"/></g>)}
    <path d="m235 170 103-45 116 44-106 49Z" fill="#c3ae92" stroke="#a99275"/><path d="m235 170v14l113 49v-15Z" fill="#b59c7f"/><path d="m348 218 106-49v14l-106 50Z" fill="#aa8f73"/>
    <path d="m255 143 83-34 96 37-86 39Z" fill="#8e7074" stroke="#62414b"/><path d="m255 143v25l93 40v-23Z" fill="url(#desk)"/><path d="m348 185 86-39v25l-86 37Z" fill="#55333d"/>
    <path d="m325 117V82q12-16 25 0v37" fill="#593b45" stroke="#a78b82" strokeWidth="3"/>
    <g stroke="#cdb694" strokeWidth="1" fill="none"><path d="M337 86v15m-4 0h8m-11-11 14-3m-12 3-3 6h6Zm10-2-3 6h6Z"/></g>
    <path d="m317 252 34-16 35 15-35 18Z" fill="#a99170"/><path d="m317 252v24l34 16v-23Zm34 17 35-18v24l-35 17Z" fill="#7a6248"/>
    <path d="m303 265 48 22 48-23v7l-48 24-48-23Z" fill="#c8bba5"/>
    {[[146,232],[211,205],[465,208],[528,235]].map(([x,y],i)=><g key={i} transform={`translate(${x},${y})`}><path d="m-30 0 28-13 61 27-27 14Z" fill="#a08771"/><path d="m-30 0v12l62 28V28Zm62 28 27-14v12l-27 14Z" fill="#6d5147"/>
      {nodes[i] && <g><circle cx="13" cy="-14" r="9" fill={nodes[i].state==='ACCEPTED'?'#647a63':'#bcaa8b'}/><path d="m3-4q10-7 20 4v16L3 8Z" fill="#4c3740"/><circle cx="14" cy="-14" r="15" fill="none" stroke="#7a9274" strokeDasharray="2 4" opacity=".7"/></g>}
    </g>)}
    <path d="m232 301 28-13 60 27-27 14Z" fill="#a08771"/><path d="m232 301v12l61 28v-12Zm61 28 27-14v12l-27 14Z" fill="#6d5147"/>
    <path d="m395 312 28-13 60 27-27 14Z" fill="#a08771"/><path d="m395 312v12l61 28v-12Zm61 28 27-14v12l-27 14Z" fill="#6d5147"/>
    <path d="M340 13v42" stroke="#8d7554"/><path d="m324 44 16-7 16 7-16 8Z" fill="#c8b086"/><path d="m324 44v9l16 8 16-8v-9l-16 8Z" fill="#d4bf9c" opacity=".8"/>
    <circle cx="350" cy="252" r="5" fill={active?'#6b8b6c':'#b9a88d'} className={active?'scene-pulse':''}/>
  </svg>;
}
