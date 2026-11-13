'use strict';
let puzzleOpen=false,puzzleSelection=0,puzzleMessage='';
let puzzleDrag=null,puzzleSuppressClickUntil=0;
let puzzleAudio=null;
function playPuzzleSound(kind){
  if(!state.puzzle.sound)return;
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
  try{
    if(!puzzleAudio){
      const context=new Audio(),gain=context.createGain();gain.gain.value=.12;gain.connect(context.destination);puzzleAudio={context,gain};
    }
    const {context,gain}=puzzleAudio;
    gain.gain.value=.12;
    const play=()=>{
      if(!state.puzzle.sound)return;
      const notes=kind==='invalid'?[180,130]:kind==='clear'?[523,659,784,1047]:[440,660];
      notes.forEach((frequency,i)=>{
        const start=context.currentTime+i*.075,osc=context.createOscillator(),envelope=context.createGain();
        osc.type=kind==='invalid'?'triangle':'sine';osc.frequency.value=frequency;
        envelope.gain.setValueAtTime(0,start);envelope.gain.linearRampToValueAtTime(.65,start+.008);envelope.gain.exponentialRampToValueAtTime(.001,start+.16);
        osc.connect(envelope);envelope.connect(gain);osc.start(start);osc.stop(start+.18);
        osc.onended=()=>{osc.disconnect();envelope.disconnect();};
      });
    };
    if(context.state==='suspended')context.resume().then(play).catch(()=>{});else play();
  }catch(e){/* Gameplay remains available when browser audio is unavailable. */}
}
function puzzlePlacementFeedback(placed){
  playPuzzleSound(!placed?'invalid':placed.lines?'clear':'snap');
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
  const board=document.querySelector?.('.puzzle-board');if(!board)return;
  if(!placed){board.animate?.([{transform:'translateX(0)'},{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'translateX(0)'}],{duration:200});return;}
  for(const i of placed.placedCells){
    document.querySelector(`[data-puzzle-cell="${i}"]`)?.animate?.([{transform:'scale(.72)',filter:'brightness(1.8)'},{transform:'scale(1)',filter:'brightness(1)'}],{duration:230});
  }
  for(const [n,i] of placed.clearedCells.entries()){
    document.querySelector(`[data-puzzle-cell="${i}"]`)?.animate?.([{background:'#d7f4bc',transform:'scale(1)',boxShadow:'0 0 14px #b7e18c'},{background:'#a58afa',transform:'scale(.4)',opacity:.3},{transform:'scale(1)',opacity:1}],{duration:500,delay:n*7});
  }
  document.querySelector('.puzzle-stats')?.animate?.([{transform:'scale(1)'},{transform:'scale(1.05)'},{transform:'scale(1)'}],{duration:350});
  if(placed.lines){
    const celebration=document.createElement('div');celebration.className='puzzle-celebration';celebration.setAttribute('aria-hidden','true');
    celebration.textContent=placed.boardEmpty?'✦ All clear!':placed.lines>1?`✦ ${placed.lines}-line blast!`:'✦ Line cleared!';board.appendChild(celebration);
    const animation=celebration.animate?.([{opacity:0,transform:'translate(-50%,-20%) scale(.6)'},{opacity:1,transform:'translate(-50%,-50%) scale(1)',offset:.2},{opacity:1,transform:'translate(-50%,-65%) scale(1)',offset:.75},{opacity:0,transform:'translate(-50%,-100%) scale(1.1)'}],{duration:1100});
    if(animation)animation.onfinish=()=>celebration.remove();else celebration.remove();
  }
}
state.puzzle=BlockyPuzzle.restore(state.puzzle);
function puzzlePanel(){
  const g=state.puzzle;
  puzzleSelection=Math.min(puzzleSelection,Math.max(0,g.pieces.length-1));
  const stuck=g.pieces.length&&!g.pieces.some(p=>BlockyPuzzle.canFit(g,p));
  return `<section class="puzzle-panel panel" aria-labelledby="puzzle-title"><div class="puzzle-heading"><div><div class="eyebrow">LEARN · EARN · BUILD</div><h2 id="puzzle-title" tabindex="-1">Blocky Blast Puzzle</h2></div><button class="btn secondary" data-action="closePuzzle">Back to learning ↓</button></div><p class="sub">Each correct quiz answer earns one piece. Select a piece, then choose its top-left square on the board. Complete rows or columns to clear them.</p><div class="puzzle-stats"><span><strong>${g.score}</strong> points</span><span><strong>${g.best}</strong> best</span><span><strong>${g.pieces.length}</strong> pieces ready</span></div><div class="puzzle-layout"><div class="puzzle-board" role="group" aria-label="8 by 8 puzzle board">${g.board.map((v,i)=>`<button class="puzzle-cell ${v?'filled':''}" data-puzzle-cell="${i}" aria-label="Row ${Math.floor(i/8)+1}, column ${i%8+1}, ${v?'occupied':'empty'}" ${v||!g.pieces.length?'disabled':''}></button>`).join('')}</div><div class="puzzle-inventory"><h3>Your earned pieces</h3><p class="sub">10 points per square + 100 per cleared line. Pieces keep their shown orientation.</p><div class="puzzle-pieces">${g.pieces.map((p,i)=>`<button class="puzzle-piece ${i===puzzleSelection?'selected':''}" data-puzzle-piece="${i}" aria-pressed="${i===puzzleSelection}" aria-label="Piece ${i+1}: ${BlockyPuzzle.shapes[p].name}"><span class="piece-preview" aria-hidden="true" style="--piece-width:${Math.max(...BlockyPuzzle.shapes[p].cells.map(c=>c[1]))+1}">${BlockyPuzzle.preview(p)}</span><small>${BlockyPuzzle.shapes[p].name}</small></button>`).join('')}</div>${!g.pieces.length?'<p class="focus-tip">Your next piece starts with a word. Answer a quiz question correctly, then come back to build!</p>':''}${stuck?'<p class="focus-tip">None of your pieces fit. Start a fresh board to keep building with your earned pieces.</p>':''}<button class="shortcut" data-action="resetPuzzle">Start a fresh board</button><p class="sub">A fresh board resets this round’s points. Your best score and unused pieces stay saved.</p></div></div><p class="puzzle-message" role="status" aria-live="polite">${E(puzzleMessage)}</p></section>`;
}
// Extend rendering and answers without changing the vocabulary session or hash route.
const learningRender=render;
render=function(){
  cancelPuzzleDrag();
  state.puzzle=BlockyPuzzle.restore(state.puzzle);
  learningRender();
  if(!data)return;
  const g=state.puzzle;
  document.querySelector('main').insertAdjacentHTML('afterbegin',`<div class="puzzle-launch"><button class="btn secondary" data-action="puzzle">▦ Blocky Blast · ${g.score} points · ${g.pieces.length} pieces</button></div>${puzzleOpen?puzzlePanel():''}`);
  const instructions=document.querySelector('.puzzle-panel > .sub');
  if(instructions)instructions.textContent='Each correct quiz answer earns one piece. Drag a piece onto the board, or tap a piece then its top-left square. Green means it fits; red means try another space. Complete rows or columns to clear them.';
  document.querySelector('.puzzle-heading')?.insertAdjacentHTML('beforeend',`<button class="btn secondary" data-action="puzzleSound" aria-pressed="${g.sound}" aria-label="Puzzle sound effects">Sound ${g.sound?'on ♫':'off'}</button>`);
  const q=view==='quiz'&&quiz?.questions[quiz.index];
  if(q&&q.answer===q.w.id)document.querySelector('.feedback')?.insertAdjacentHTML('beforeend',`<p class="puzzle-reward">✦ Correct! One puzzle piece earned.</p><button class="btn secondary" data-action="puzzle">Play Blocky Blast · ${g.pieces.length} pieces ready</button>`);
};
const learningAnswer=answer;
answer=function(id){
  const q=quiz?.questions[quiz.index];
  if(q&&q.answer===null&&Number(id)===q.w.id){
    state.puzzle=BlockyPuzzle.restore(state.puzzle);
    BlockyPuzzle.earn(state.puzzle);
    puzzleMessage='Correct answer! You earned one puzzle piece.';
  }
  learningAnswer(id);
};
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.action==='puzzleSound'){
    state.puzzle.sound=!state.puzzle.sound;if(puzzleAudio&&!state.puzzle.sound)puzzleAudio.gain.gain.value=0;
    save();render();if(state.puzzle.sound)playPuzzleSound('snap');document.querySelector('[data-action="puzzleSound"]')?.focus();return;
  }
  if(b.dataset.action==='puzzle'){
    puzzleOpen=true;render();const title=document.getElementById('puzzle-title');title.focus();title.scrollIntoView({block:'start'});
  }
  if(b.dataset.action==='closePuzzle'){
    puzzleOpen=false;render();document.querySelector('[data-action="nextQuestion"], main [data-action="puzzle"]')?.focus();
  }
  if(b.dataset.puzzlePiece!==undefined){
    puzzleSelection=Number(b.dataset.puzzlePiece);puzzleMessage='Piece selected. Choose its top-left square.';render();document.querySelector(`[data-puzzle-piece="${puzzleSelection}"]`)?.focus();
  }
  if(b.dataset.puzzleCell!==undefined){
    const placed=BlockyPuzzle.place(state.puzzle,puzzleSelection,Number(b.dataset.puzzleCell));
    puzzleMessage=placed?`+${placed.points} points! ${placed.lines?placed.lines+' line'+(placed.lines===1?'':'s')+' cleared.':'Keep building!'}`:'That piece does not fit there. Try another square or piece.';
    if(placed)save();render();puzzlePlacementFeedback(placed);document.querySelector(`[data-puzzle-cell="${b.dataset.puzzleCell}"]:not(:disabled), [data-puzzle-piece]`)?.focus();
  }
  if(b.dataset.action==='resetPuzzle'&&confirm('Start a fresh board? This round’s points reset; your best score and unused pieces stay.')){
    state.puzzle.board.fill(0);state.puzzle.score=0;puzzleMessage='Fresh board ready.';save();render();document.getElementById('puzzle-title').focus();
  }
});

// Pointer Events support fingers, pens, and mice with the same placement rules.
function cancelPuzzleDrag(){
  if(!puzzleDrag)return;
  const d=puzzleDrag;puzzleDrag=null;
  cancelAnimationFrame(d.frame);
  d.ghost?.remove();
  document.querySelectorAll('.puzzle-cell.drop-valid,.puzzle-cell.drop-invalid').forEach(c=>c.classList.remove('drop-valid','drop-invalid'));
  d.source.classList.remove('dragging');
  if(d.source.hasPointerCapture(d.id))d.source.releasePointerCapture(d.id);
}
function updatePuzzleDrag(){
  const d=puzzleDrag;if(!d?.active)return;
  const cells=[...document.querySelectorAll('[data-puzzle-cell]')];
  if(cells.length!==64){cancelPuzzleDrag();return;}
  const first=cells[0].getBoundingClientRect(),second=cells[1].getBoundingClientRect();
  const pitch=second.left-first.left,offset=d.touch?52:0;
  // The first block follows the pointer, lifted above a finger for visibility.
  const x=d.x,y=d.y-offset;
  d.ghost.style.left=(x-first.width/2)+'px';d.ghost.style.top=(y-first.height/2)+'px';
  d.ghost.style.setProperty('--drag-cell',first.width+'px');
  d.ghost.style.setProperty('--drag-gap',(pitch-first.width)+'px');
  const col=Math.round((x-first.left-first.width/2)/pitch),row=Math.round((y-first.top-first.height/2)/pitch);
  d.index=row>=0&&row<8&&col>=0&&col<8?row*8+col:null;
  const shape=BlockyPuzzle.shapes[state.puzzle.pieces[d.selection]];
  d.valid=d.index!==null&&!!BlockyPuzzle.fits(state.puzzle,state.puzzle.pieces[d.selection],d.index);
  d.ghost.classList.toggle('invalid',!d.valid);
  cells.forEach(c=>c.classList.remove('drop-valid','drop-invalid'));
  if(d.index!==null)for(const [r,c] of shape.cells){
    if(row+r<8&&col+c<8)cells[(row+r)*8+col+c].classList.add(d.valid?'drop-valid':'drop-invalid');
  }
}
function scrollPuzzleDrag(){
  const d=puzzleDrag;if(!d?.active)return;
  const amount=d.y<80?-8:d.y>window.innerHeight-80?8:0;
  if(amount)window.scrollBy(0,amount);
  updatePuzzleDrag();d.frame=requestAnimationFrame(scrollPuzzleDrag);
}
document.addEventListener('pointerdown',e=>{
  const source=e.target.closest('[data-puzzle-piece]');
  if(!source||e.isPrimary===false||e.button!==0||puzzleDrag)return;
  puzzleDrag={source,id:e.pointerId,selection:Number(source.dataset.puzzlePiece),startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,touch:e.pointerType==='touch',active:false,frame:0};
  source.setPointerCapture(e.pointerId);
});
document.addEventListener('pointermove',e=>{
  const d=puzzleDrag;if(!d||d.id!==e.pointerId)return;
  d.x=e.clientX;d.y=e.clientY;
  if(!d.active&&Math.hypot(d.x-d.startX,d.y-d.startY)<8)return;
  e.preventDefault();
  if(!d.active){
    d.active=true;puzzleSelection=d.selection;d.source.classList.add('dragging');
    d.ghost=document.createElement('div');d.ghost.className='puzzle-drag-ghost piece-preview';d.ghost.setAttribute('aria-hidden','true');
    const p=state.puzzle.pieces[d.selection];
    d.ghost.style.setProperty('--piece-width',Math.max(...BlockyPuzzle.shapes[p].cells.map(c=>c[1]))+1);
    d.ghost.innerHTML=BlockyPuzzle.preview(p);document.body.appendChild(d.ghost);
    d.frame=requestAnimationFrame(scrollPuzzleDrag);
  }
  updatePuzzleDrag();
},{passive:false});
document.addEventListener('pointerup',e=>{
  const d=puzzleDrag;if(!d||d.id!==e.pointerId)return;
  if(!d.active){cancelPuzzleDrag();return;}
  d.x=e.clientX;d.y=e.clientY;updatePuzzleDrag();
  const placed=d.valid?BlockyPuzzle.place(state.puzzle,d.selection,d.index):null;
  puzzleSuppressClickUntil=performance.now()+500;
  puzzleMessage=placed?`+${placed.points} points! ${placed.lines?placed.lines+' lines cleared.':'Keep building!'}`:'Piece returned to your tray. Drop it on an empty space where it fits.';
  cancelPuzzleDrag();if(placed)save();render();puzzlePlacementFeedback(placed);
});
document.addEventListener('pointercancel',e=>{
  if(puzzleDrag?.id===e.pointerId){if(puzzleDrag.active)puzzleSuppressClickUntil=performance.now()+500;cancelPuzzleDrag();}
});
document.addEventListener('lostpointercapture',e=>{
  if(puzzleDrag?.id===e.pointerId)cancelPuzzleDrag();
});
document.addEventListener('click',e=>{
  if(performance.now()<puzzleSuppressClickUntil&&e.target.closest('.puzzle-panel')){e.preventDefault();e.stopImmediatePropagation();}
},true);
