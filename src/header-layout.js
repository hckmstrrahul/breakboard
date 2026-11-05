// Keep all header items on one row while their intrinsic widths fit. When
// they do not, only navigation moves down; the brand and actions stay apart.
export function createHeaderLayout(header){
 const brand=header.querySelector('.brand-cluster'),navigation=header.querySelector('.board-segments'),actions=header.querySelector('.header-actions'),toggle=header.querySelector('.collection-toggle');
 const compact=matchMedia('(max-width:800px), (max-width:1000px) and (max-height:500px)');
 let raf=0;
 function update(){
  raf=0;if(compact.matches){header.classList.remove('navigation-wrapped');return;}
  const style=getComputedStyle(navigation),buttons=[...navigation.children],gap=parseFloat(style.columnGap)||0;
  const tabs=buttons.reduce((sum,button)=>sum+button.getBoundingClientRect().width,0)+Math.max(0,buttons.length-1)*gap+(parseFloat(style.paddingLeft)||0)+(parseFloat(style.paddingRight)||0)+2;
  const needed=brand.getBoundingClientRect().width+actions.getBoundingClientRect().width+tabs+toggle.getBoundingClientRect().width+10+40;
  header.classList.toggle('navigation-wrapped',needed>header.clientWidth);
 }
 const schedule=()=>{if(!raf)raf=requestAnimationFrame(update);};
 const resize=new ResizeObserver(schedule);for(const node of [header,brand,actions,navigation])resize.observe(node);
 new MutationObserver(schedule).observe(navigation,{childList:true,subtree:true,characterData:true});
 compact.addEventListener('change',schedule);document.fonts.ready.then(schedule);document.fonts.addEventListener('loadingdone',schedule);schedule();
}
