const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const ctx=vm.createContext({});
vm.runInContext(fs.readFileSync('puzzle.js','utf8')+'\nglobalThis.rules=BlockyPuzzle;',ctx);
const p=ctx.rules;
let g=p.create();g.pieces=[4];
assert.equal(p.place(g,0,7),null,'Reject pieces crossing board edge');
assert.equal(g.pieces.length,1,'Invalid placement keeps earned piece');
assert.equal(p.place(g,0,0).points,40);
g.pieces=[0];assert.equal(p.place(g,0,0),null,'Reject overlap');
g=p.create();g.board.fill(1);g.board[0]=0;g.pieces=[0];
assert.equal(p.place(g,0,0).lines,16,'Clear rows and columns simultaneously');
assert.ok(g.board.every(v=>v===0));assert.equal(g.score,1610);assert.equal(g.best,1610);
g=p.create();g.board.fill(1);assert.equal(p.canFit(g,0),false);
g=p.create();for(let i=0;i<50;i++)p.earn(g);assert.equal(g.pieces.length,50);
assert.equal(p.restore(JSON.parse(JSON.stringify(g))).pieces.length,50,'Backup round trip');
assert.equal(p.restore({board:[]}).board.length,64,'Invalid backup resets puzzle safely');
assert.equal(p.restore(undefined).score,0,'Old progress remains compatible');
assert.equal(p.shapes.length,24,'Expanded shape library');
assert.ok(new Set(p.shapes.map(s=>s.color)).size>=8,'Distinct block colors');
for(let i=0;i<p.shapes.length;i++){
  const game=p.create();game.pieces=[i];const move=p.place(game,0,0);
  assert.ok(move,'Every shape fits an empty board');
  assert.equal(game.board.filter(Boolean).length,p.shapes[i].cells.length);
  assert.ok(move.placedCells.every(j=>game.colors[j]===p.shapes[i].color),'Placed blocks retain their shape color');
  const restored=p.restore(JSON.parse(JSON.stringify(game)));
  assert.deepEqual([...restored.colors],[...game.colors],'Colors survive backup round trip');
}
let comboGame=p.create();
function clearRow(game){for(let i=0;i<7;i++)game.board[i]=1;game.pieces=[0];return p.place(game,0,7);}
assert.equal(clearRow(comboGame).points,110);
assert.equal(clearRow(comboGame).points,210,'Second clear doubles line bonus');
comboGame.pieces=[0,0];p.place(comboGame,0,16);p.place(comboGame,0,18);
assert.equal(clearRow(comboGame).combo,3,'Two non-clearing moves preserve combo');
comboGame.pieces=[0,0,0];p.place(comboGame,0,24);p.place(comboGame,0,26);p.place(comboGame,0,28);
assert.equal(comboGame.combo,0,'Three non-clearing moves reset combo');
assert.equal(clearRow(comboGame).combo,1);
const oldBest=comboGame.best;p.reset(comboGame);assert.equal(comboGame.best,oldBest);assert.equal(comboGame.combo,0);assert.ok(comboGame.colors.every(c=>c===null));
const hintGame=p.create();hintGame.board.fill(1,0,7);hintGame.pieces=[0];
const beforeHint=JSON.stringify(hintGame),suggestion=p.hint(hintGame,0);
assert.equal(suggestion.index,7);assert.equal(suggestion.lines,1);
assert.equal(JSON.stringify(hintGame),beforeHint,'Preview and hint never mutate gameplay');
const tight=p.create();tight.board.fill(1);tight.board[63]=0;
for(let i=0;i<30;i++){p.earn(tight);assert.equal(tight.pieces.at(-1),0,'Only a fitting shape is earned when space is tight');}
assert.equal(p.restore({...tight,colors:Array(64).fill('url(evil)')}).colors[0],p.palette[2],'Unrecognized saved colors are replaced');

// Exercise reward integration with the real answer handler and vocabulary data.
const app=fs.readFileSync('app.js','utf8'),ui=fs.readFileSync('puzzle-ui.js','utf8');
const vocab=JSON.parse(fs.readFileSync('vocab.json','utf8'));
const c=vm.createContext({localStorage:{getItem:()=>null,setItem:()=>{}},document:{addEventListener:()=>{}},window:{addEventListener:()=>{}},fetch:()=>new Promise(()=>{}),console});
vm.runInContext(fs.readFileSync('puzzle.js','utf8')+app+ui,c);
c.fixture=vocab.days[0].batches[0].words;
vm.runInContext(`render=()=>{};burst=()=>{};words=fixture;examples={};quiz={questions:[{w:words[0],answer:null,choices:words.slice(0,4)}],index:0,correct:0};answer(words[0].id);`,c);
assert.equal(vm.runInContext('state.puzzle.pieces.length',c),1,'Correct answer earns one piece');
vm.runInContext('answer(words[0].id)',c);
assert.equal(vm.runInContext('state.puzzle.pieces.length',c),1,'Repeated answer earns nothing');
vm.runInContext('quiz.questions[0].answer=null;answer(words[1].id)',c);
assert.equal(vm.runInContext('state.puzzle.pieces.length',c),1,'Wrong answer earns nothing');
// Drive the actual pointer handlers with deterministic board geometry.
const handlers={};
function element(){return {classList:{add(){},remove(){},toggle(){}},style:{setProperty(){}},setAttribute(){},remove(){},innerHTML:''};}
const boardCells=Array.from({length:64},(_,i)=>({...element(),getBoundingClientRect:()=>({left:100+(i%8)*40,top:100+Math.floor(i/8)*40,width:35,height:35})}));
const source={...element(),dataset:{puzzlePiece:'0'},setPointerCapture(){this.captured=true;},hasPointerCapture(){return !!this.captured;},releasePointerCapture(){this.captured=false;}};
const doc={addEventListener:(name,fn)=>{(handlers[name]??=[]).push(fn);},querySelectorAll:s=>s==='[data-puzzle-cell]'?boardCells:[],createElement:element,body:{appendChild(){}}};
const dragCtx=vm.createContext({localStorage:{getItem:()=>null,setItem:()=>{}},document:doc,window:{addEventListener(){},innerHeight:900,scrollBy(){}},fetch:()=>new Promise(()=>{}),performance:{now:()=>100},requestAnimationFrame:()=>1,cancelAnimationFrame(){},console});
vm.runInContext(fs.readFileSync('puzzle.js','utf8')+app+ui,dragCtx);
vm.runInContext('render=()=>{};save=()=>{};state.puzzle.pieces=[4];',dragCtx);
function pointer(type,x,y,extra={}){
  const e={target:{closest:()=>source},pointerId:1,pointerType:'touch',button:0,clientX:x,clientY:y,preventDefault(){},...extra};
  handlers[type].forEach(fn=>fn(e));
}
pointer('pointerdown',450,500);pointer('pointermove',117.5,169.5);
assert.equal(vm.runInContext('puzzleDrag.valid',dragCtx),true,'Touch preview accounts for finger lift');
pointer('pointerup',117.5,169.5);
assert.equal(vm.runInContext('state.puzzle.score',dragCtx),40,'Touch drop places square once');
assert.equal(vm.runInContext('state.puzzle.pieces.length',dragCtx),0);
let blockedClick=false;
handlers.click.at(-1)({target:{closest:()=>source},preventDefault(){},stopImmediatePropagation(){blockedClick=true;}});
assert.ok(blockedClick,'Drag suppresses synthesized click');
vm.runInContext('state.puzzle.pieces=[4]',dragCtx);
pointer('pointerdown',450,500);pointer('pointermove',397.5,169.5);pointer('pointerup',397.5,169.5);
assert.equal(vm.runInContext('state.puzzle.pieces.length',dragCtx),1,'Out-of-bounds touch drop keeps piece');
assert.equal(vm.runInContext('state.puzzle.score',dragCtx),40,'Invalid drop awards nothing');
pointer('pointerdown',450,500);pointer('pointermove',197.5,169.5);pointer('pointercancel',197.5,169.5);
assert.equal(vm.runInContext('puzzleDrag',dragCtx),null,'Cancelled drag cleans up');
assert.equal(vm.runInContext('state.puzzle.pieces.length',dragCtx),1,'Cancelled drag keeps piece');
pointer('pointerdown',450,500);pointer('pointerup',450,500);
assert.equal(vm.runInContext('puzzleDrag',dragCtx),null,'Tap remains available without starting a drag');
pointer('pointerdown',450,500,{pointerType:'mouse'});pointer('pointermove',197.5,117.5,{pointerType:'mouse'});pointer('pointerup',197.5,117.5,{pointerType:'mouse'});
assert.equal(vm.runInContext('state.puzzle.score',dragCtx),80,'Mouse dragging uses the same placement rules');
assert.equal(p.restore({...g,sound:false}).sound,false,'Muted setting survives restore');
assert.equal(p.restore({...g,sound:undefined}).sound,true,'Existing progress gets the default sound setting');
let tones=0,animations=0,celebrations=0;
const gain=()=>({gain:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}});
class TestAudio{
  constructor(){this.state='running';this.currentTime=0;this.destination={};}
  createGain(){return gain();}
  createOscillator(){return {frequency:{value:0},connect(){},disconnect(){},start(){tones++;},stop(){}};}
}
dragCtx.window.AudioContext=TestAudio;
dragCtx.window.matchMedia=()=>({matches:false});
doc.querySelector=()=>({animate(){animations++;return {};},appendChild(){celebrations++;},focus(){}});
doc.createElement=()=>({...element(),animate(){animations++;return {};}});
vm.runInContext("playPuzzleSound('snap');playPuzzleSound('invalid');playPuzzleSound('clear')",dragCtx);
assert.equal(tones,8,'Success, failure, and blast each use their own tone pattern');
vm.runInContext("state.puzzle.sound=false;playPuzzleSound('snap')",dragCtx);
assert.equal(tones,8,'Mute prevents sound');
dragCtx.effect={placedCells:[0],clearedCells:[0,1,2,3,4,5,6,7],lines:1,boardEmpty:true};
vm.runInContext('puzzlePlacementFeedback(effect)',dragCtx);
assert.equal(celebrations,1,'Completed line shows a celebration');
assert.ok(animations>=10,'Placement, clear, score, and celebration animate');
const before=animations;
dragCtx.window.matchMedia=()=>({matches:true});
vm.runInContext('puzzlePlacementFeedback(effect)',dragCtx);
assert.equal(animations,before,'Reduced motion skips animations');
delete dragCtx.window.AudioContext;
vm.runInContext("puzzleAudio=null;state.puzzle.sound=true;playPuzzleSound('snap')",dragCtx);
assert.equal(tones,8,'Missing browser audio does not break gameplay');
console.log('Puzzle rules, persistence, quiz rewards, dragging, sound/mute, celebration, and reduced-motion checks passed.');
