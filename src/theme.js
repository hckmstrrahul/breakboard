export const THEME_KEY='breakboard-appearance';
export const validPreference=value=>['light','dark','system'].includes(value)?value:'dark';
export const resolveTheme=(preference,darkSystem)=>preference==='system'?(darkSystem?'dark':'light'):preference;
export function createThemeController({root,media,storage,onChange}){
 let preference='dark';
 try{preference=validPreference(storage?.getItem(THEME_KEY)??storage?.getItem('teardown-appearance'));}catch{}
 const apply=()=>{const resolved=resolveTheme(preference,media.matches);root.dataset.theme=resolved;root.dataset.appearance=preference;onChange(preference,resolved);};
 media.addEventListener('change',apply);
 apply();
 return{
  get preference(){return preference;},
  set(value){preference=validPreference(value);try{storage?.setItem(THEME_KEY,preference);}catch{}apply();},
  destroy(){media.removeEventListener('change',apply);}
 };
}
