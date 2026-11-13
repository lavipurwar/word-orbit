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
    {name:'T shape',cells:[[0,0],[0,1],[0,2],[1,1]]}
  ];
  const create=()=>({board:Array(64).fill(0),pieces:[],score:0,best:0,sound:true});
  function restore(value){
    if(!value)return create();
    if(!Array.isArray(value.board)||value.board.length!==64||!value.board.every(v=>v===0||v===1)||!Array.isArray(value.pieces)||!value.pieces.every(p=>Number.isInteger(p)&&p>=0&&p<shapes.length)||![value.score,value.best].every(n=>Number.isSafeInteger(n)&&n>=0))return create();
    return {board:[...value.board],pieces:[...value.pieces],score:value.score,best:Math.max(value.best,value.score),sound:value.sound!==false};
  }
  function fits(g,p,index){
    const r=Math.floor(index/8),c=index%8;
    return Number.isInteger(index)&&index>=0&&index<64&&shapes[p]&&shapes[p].cells.every(([y,x])=>r+y<8&&c+x<8&&!g.board[(r+y)*8+c+x]);
  }
  const canFit=(g,p)=>g.board.some((_,i)=>fits(g,p,i));
  function earn(g){g.pieces.push(Math.floor(Math.random()*shapes.length));}
  function place(g,selection,index){
    const p=g.pieces[selection];if(p===undefined||!fits(g,p,index))return null;
    const row=Math.floor(index/8),col=index%8;
    const placedCells=shapes[p].cells.map(([y,x])=>(row+y)*8+col+x);
    placedCells.forEach(i=>g.board[i]=1);
    const clear=new Set();let lines=0;
    for(let i=0;i<8;i++){
      const r=Array.from({length:8},(_,j)=>i*8+j),c=Array.from({length:8},(_,j)=>j*8+i);
      for(const line of [r,c])if(line.every(j=>g.board[j])){lines++;line.forEach(j=>clear.add(j));}
    }
    clear.forEach(i=>g.board[i]=0);
    const points=shapes[p].cells.length*10+lines*100;
    g.score+=points;g.best=Math.max(g.best,g.score);g.pieces.splice(selection,1);
    return {points,lines,placedCells,clearedCells:[...clear],boardEmpty:g.board.every(v=>!v)};
  }
  function preview(p){
    const cells=shapes[p].cells,width=Math.max(...cells.map(c=>c[1]))+1,height=Math.max(...cells.map(c=>c[0]))+1;
    return Array.from({length:width*height},(_,i)=>`<i class="${cells.some(([r,c])=>r===Math.floor(i/width)&&c===i%width)?'solid':''}"></i>`).join('');
  }
  return {shapes,create,restore,fits,canFit,earn,place,preview};
})();
