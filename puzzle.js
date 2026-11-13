'use strict';
// Pure puzzle rules; learning rewards and UI live in app.js.
const BlockyPuzzle = (() => {
  const shapes = [
    {name:'Single',cells:[[0,0]]},
    {name:'Pair',cells:[[0,0],[0,1]]},
    {name:'Column',cells:[[0,0],[1,0],[2,0]]},
    {name:'Line',cells:[[0,0],[0,1],[0,2]]},
    {name:'Square',cells:[[0,0],[0,1],[1,0],[1,1]]},
    {name:'Corner',cells:[[0,0],[1,0],[1,1]]},
    {name:'T shape',cells:[[0,0],[0,1],[0,2],[1,1]]},
    {name:'Tall pair',cells:[[0,0],[1,0]]},
    {name:'Long line',cells:[[0,0],[0,1],[0,2],[0,3]]},
    {name:'Tall line',cells:[[0,0],[1,0],[2,0],[3,0]]},
    {name:'Five across',cells:[[0,0],[0,1],[0,2],[0,3],[0,4]]},
    {name:'Five down',cells:[[0,0],[1,0],[2,0],[3,0],[4,0]]},
    {name:'Big square',cells:[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]]},
    {name:'Wide rectangle',cells:[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2]]},
    {name:'Tall rectangle',cells:[[0,0],[0,1],[1,0],[1,1],[2,0],[2,1]]},
    {name:'L shape',cells:[[0,0],[1,0],[2,0],[2,1]]},
    {name:'Reverse L',cells:[[0,1],[1,1],[2,0],[2,1]]},
    {name:'Top corner',cells:[[0,0],[0,1],[1,0]]},
    {name:'Right corner',cells:[[0,0],[0,1],[1,1]]},
    {name:'Zigzag',cells:[[0,0],[0,1],[1,1],[1,2]]},
    {name:'Reverse zigzag',cells:[[0,1],[0,2],[1,0],[1,1]]},
    {name:'Sideways T',cells:[[0,0],[1,0],[1,1],[2,0]]},
    {name:'Upward T',cells:[[0,1],[1,0],[1,1],[1,2]]},
    {name:'Wide corner',cells:[[0,0],[0,1],[0,2],[1,0],[2,0]]}
  ];
  const palette=['#ffb43b','#45c8f5','#af7bff','#ff698c','#5cdb9b','#5d8aff','#f18b4c','#e57ae5'];
  shapes.forEach((s,i)=>s.color=palette[i%palette.length]);
  const create=()=>({board:Array(64).fill(0),colors:Array(64).fill(null),pieces:[],score:0,best:0,sound:true,combo:0,movesSinceClear:0});
  function restore(value){
    if(!value)return create();
    if(!Array.isArray(value.board)||value.board.length!==64||!value.board.every(v=>v===0||v===1)||!Array.isArray(value.pieces)||!value.pieces.every(p=>Number.isInteger(p)&&p>=0&&p<shapes.length)||![value.score,value.best].every(n=>Number.isSafeInteger(n)&&n>=0))return create();
    const colors=Array.from({length:64},(_,i)=>value.board[i]?(palette.includes(value.colors?.[i])?value.colors[i]:palette[2]):null);
    return {board:[...value.board],colors,pieces:[...value.pieces],score:value.score,best:Math.max(value.best,value.score),sound:value.sound!==false,combo:Number.isSafeInteger(value.combo)&&value.combo>=0?value.combo:0,movesSinceClear:Number.isInteger(value.movesSinceClear)&&value.movesSinceClear>=0&&value.movesSinceClear<3?value.movesSinceClear:0};
  }
  function fits(g,p,index){
    const r=Math.floor(index/8),c=index%8;
    return Number.isInteger(index)&&index>=0&&index<64&&shapes[p]&&shapes[p].cells.every(([y,x])=>r+y<8&&c+x<8&&!g.board[(r+y)*8+c+x]);
  }
  const canFit=(g,p)=>g.board.some((_,i)=>fits(g,p,i));
  function earn(g){
    let pool=shapes.map((_,i)=>i).filter(i=>canFit(g,i));
    if(!pool.length)pool=shapes.map((_,i)=>i);
    const varied=pool.filter(i=>!g.pieces.slice(-2).includes(i));
    if(varied.length)pool=varied;
    g.pieces.push(pool[Math.floor(Math.random()*pool.length)]);
  }
  function inspect(g,p,index){
    if(!fits(g,p,index))return null;
    const placedCells=shapes[p].cells.map(([y,x])=>(Math.floor(index/8)+y)*8+index%8+x);
    const occupied=new Set(placedCells),clear=new Set();let lines=0;
    for(let i=0;i<8;i++)for(const line of [Array.from({length:8},(_,j)=>i*8+j),Array.from({length:8},(_,j)=>j*8+i)]){
      if(line.every(j=>g.board[j]||occupied.has(j))){lines++;line.forEach(j=>clear.add(j));}
    }
    return {placedCells,clearedCells:[...clear],lines};
  }
  function hint(g,selection){
    let best=null;
    for(let i=0;i<64;i++){const move=inspect(g,g.pieces[selection],i);if(move&&(!best||move.lines>best.lines))best={index:i,...move};}
    return best;
  }
  function reset(g){g.board.fill(0);g.colors=Array(64).fill(null);g.score=0;g.combo=0;g.movesSinceClear=0;}
  function place(g,selection,index){
    const p=g.pieces[selection];if(p===undefined||!fits(g,p,index))return null;
    const {placedCells,clearedCells,lines}=inspect(g,p,index);
    g.colors??=Array(64).fill(null);
    placedCells.forEach(i=>{g.board[i]=1;g.colors[i]=shapes[p].color;});
    clearedCells.forEach(i=>{g.board[i]=0;g.colors[i]=null;});
    if(lines){g.combo=(g.combo||0)+1;g.movesSinceClear=0;}
    else{g.movesSinceClear=(g.movesSinceClear||0)+1;if(g.movesSinceClear>=3){g.combo=0;g.movesSinceClear=0;}}
    const points=shapes[p].cells.length*10+lines*100*(g.combo||1);
    g.score+=points;g.best=Math.max(g.best,g.score);g.pieces.splice(selection,1);
    return {points,lines,combo:g.combo,placedCells,clearedCells,boardEmpty:g.board.every(v=>!v)};
  }
  function preview(p){
    const cells=shapes[p].cells,width=Math.max(...cells.map(c=>c[1]))+1,height=Math.max(...cells.map(c=>c[0]))+1;
    return Array.from({length:width*height},(_,i)=>`<i class="${cells.some(([r,c])=>r===Math.floor(i/width)&&c===i%width)?'solid':''}"></i>`).join('');
  }
  return {shapes,palette,create,restore,fits,canFit,earn,inspect,hint,reset,place,preview};
})();
