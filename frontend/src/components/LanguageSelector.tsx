import {languages,setLanguage,t,useLanguage} from '../i18n';
import type {Language} from '../i18n/core';
export default function LanguageSelector() {
 const language = useLanguage();
 return <label style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}><span>{t('Language')}</span><select aria-label={t('Language')} value={language} onChange={e=>setLanguage(e.target.value as Language)} style={{padding:8,borderRadius:6,color:'#1a3c2e',background:'#fff',maxWidth:'100%'}}>{languages.map(l=><option key={l.code} value={l.code}>{l.name}</option>)}</select></label>;
}
