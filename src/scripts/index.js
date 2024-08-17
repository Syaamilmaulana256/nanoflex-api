function rtc() {
  const d = new Date() // this one required 
  const mo = d.toLocaleDateString('id-ID', { month: 'long' });   // for Indonesian month name
  const da = d.toLocaleDateString('id-ID', { weekday: 'long' });  // for Indonesian days name
  const h = d.getHours()    // for adding zero behind it
  const m = d.getMinutes()  // ^^
  const s = d.getSeconds()  // ^^
  h = (h < 10 ? "0" : "") + h;       // if hours, minutes and seconds are less than 10 then it will be given 0 behind it 
  m = (m < 10 ? "0" : "") + m;       // ^^
  s = (s < 10 ? "0" : "") + s;       // ^^
  const r = days + ", " + d.getDate() + " " + months + " " + d.getFullYear() + " " + h + "." + m + "." + s // stacked var to be result
  return r; // to throw the result
}
