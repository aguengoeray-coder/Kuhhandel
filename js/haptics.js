// Spürbare Rückmeldung: eigene Muster je Moment.
// Android: Vibration. iPhone (Safari kann nicht vibrieren): Trick über einen versteckten Schalter,
// der auf neueren iPhones (iOS 18+) ein kurzes Tippen auslöst – dort gibt es nur einen kurzen Impuls, kein Muster.

const PATTERNS = {
  tap: [12],                       // Gebot, Schein antippen
  buzz: [70],                      // Buzzer
  outbid: [40, 60, 40],            // überboten: kurz-kurz
  won: [180],                      // Zuschlag erhalten: ein langer Stoß
  challenge: [60, 70, 60, 70, 60], // Kuhhandel-Herausforderung an dich
  quartet: [40, 50, 40, 50, 140],  // kleiner Jubel
  heavy: [260],                    // kann nicht zahlen
  turn: [120, 70, 120],            // du bist dran
};

let iosSwitch = null;
function iosTick() {
  try {
    if (!iosSwitch) {
      const label = document.createElement('label');
      label.setAttribute('aria-hidden', 'true');
      label.style.cssText = 'position:fixed;left:-100px;top:-100px;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('switch', '');
      input.tabIndex = -1;
      label.appendChild(input);
      document.body.appendChild(label);
      iosSwitch = label;
    }
    iosSwitch.click();
  } catch { /* egal */ }
}

export function haptic(kind, on = true) {
  if (!on) return;
  const p = PATTERNS[kind] || PATTERNS.tap;
  try {
    if (navigator.vibrate) { navigator.vibrate(p); return; }
  } catch { /* egal */ }
  // iPhone: nur ein Impuls je Moment (bei Mustern mit mehreren Stößen zwei kurz hintereinander)
  iosTick();
  if (p.length > 1) setTimeout(iosTick, 140);
}
