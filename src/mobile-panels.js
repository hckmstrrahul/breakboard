// Move the existing controls at the breakpoint so desktop and mobile share state,
// keyboard handlers and IDs. Comment markers restore their original positions.
export function createMobilePanels(boards,onBoardChange){
 const media=matchMedia('(max-width: 800px), (max-width: 1000px) and (max-height: 500px)');
 const header=document.querySelector('.topbar'),workspace=document.querySelector('.workspace');
 const picker=document.createElement('label');picker.className='mobile-board-picker';
 const name=document.createElement('span');name.className='sr-only';name.textContent='Board';
 const select=document.createElement('select');select.id='mobile-board';
 for(const board of boards)select.add(new Option(board.tab,board.id));
 select.addEventListener('change',()=>onBoardChange(select.value));picker.append(name,select);header.append(picker);
 const panel=(id,title)=>{
  const element=document.createElement('details');element.id=id;element.className='mobile-panel';
  const summary=document.createElement('summary');summary.textContent=title;
  const content=document.createElement('div');content.className='mobile-panel-content';element.append(summary,content);
  return{element,summary,content};
 };
 const controls=panel('mobile-controls','Controls'),components=panel('mobile-components','Components & details');
 workspace.append(controls.element);workspace.after(components.element);
 const moves=[
  ['.assembly-controls',controls],['.tools',controls],['.header-actions',controls],
  ['.sidebar',components],['.inspector',components]
 ].map(([selector,destination])=>{
  const element=document.querySelector(selector),marker=document.createComment(selector);element.before(marker);
  return{element,marker,destination};
 });
 let compact=false;
 const apply=()=>{
  if(compact===media.matches)return;compact=media.matches;
  for(const {element,marker,destination}of moves){if(compact)destination.content.append(element);else marker.after(element);}
  document.querySelector('#component-browser').open=true;
  controls.element.open=false;components.element.open=false;
 };
 for(const [current,other]of [[controls,components],[components,controls]])current.element.addEventListener('toggle',()=>{
  if(compact&&current.element.open)other.element.open=false;
 });
 media.addEventListener('change',apply);apply();
 return{
  setBoard:id=>{select.value=id;},
  closeComponents:()=>{if(compact&&components.element.open){components.element.open=false;components.summary.focus({preventScroll:true});workspace.scrollIntoView({block:'nearest'});}}
 };
}
