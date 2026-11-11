// Öffentliche Supabase-Zugangsdaten (der Publishable Key darf im Browser stehen)
export const SUPABASE_URL = 'https://fkqsjcschvgvbofrpnco.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_Mw2MJX6DfElzzg2ef5Qvsw_EpcHsPUN';

// Öffentlicher Schlüssel für Push-Benachrichtigungen („Du bist dran“) – darf öffentlich sein.
// Der passende geheime Schlüssel liegt NUR als Secret VAPID_PRIVATE_JWK im Cloudflare Worker.
export const PUSH_PUBLIC_KEY = 'BKDUwl7g03bOWwxB6-fztWTRHLLCcLIswpaklvB7HguV545BRxQUHdAdHfbhQ61slzb1ezzaDnoRqETXt2d-Kjc';
