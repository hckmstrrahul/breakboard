export const wrap=(value,length)=>(value%length+length)%length;
export function collectionOrder(boards){
 const first=['esp32','hdd','nixie','prime50','stepper','epyc','pi5','corememory','pmt','neopixel','hqcamera','intel4004','uno','lidar','zoomlens','jetson'];
 const hash=id=>[...id].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,19);
 return [...first.map(id=>boards.find(b=>b.id===id)).filter(Boolean),...boards.filter(b=>!first.includes(b.id)).sort((a,b)=>hash(a.id)-hash(b.id))];
}
export function gridColumns(width){return width<600?2:width<1000?3:width<1500?4:5;}
export function gridDeviceIndex(row,column,columns,count,origin=0,offset=0){return wrap((row-origin)*columns+column+offset,count);}
// A whole count of rows preserves every device's position, whatever the column count.
export function rebaseScroll(top,rowHeight,count,origin){
 const period=rowHeight*count;
 return origin*rowHeight+wrap(top-origin*rowHeight,period);
}
