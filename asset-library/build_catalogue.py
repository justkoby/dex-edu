#!/usr/bin/env python3
"""Indexes repository media (no copies) -> asset-library/catalogue.json + CATALOGUE.md. Re-run after adding files.
Edit META below for categories / suggested use / licence notes; technical fields come from ffprobe."""
import json, os, subprocess
root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
UNV = 'Source/licence UNVERIFIED – do not use in public/paid campaigns until confirmed.'
AI = 'AI-generated for Dexterity (generation-tool terms not recorded) – confirm usage terms with the generation provider.'
SR = 'Screen recording of third-party footage (player UI visible) – ' + UNV
META = {
 'videos for tour/Woman_walking_with_suitcase_at_8597bc26_1080p.mp4': ('Airports & travel', 'Hero arrival shot, Accra airport at night', AI),
 'videos for tour/Woman_walking_through_airport_te…_66bbda25_1080p.mp4': ('Airports & travel', 'Terminal/suitcase B-roll (signage is AI text – keep tight)', AI),
 'videos for tour/SUV_driving_along_coastal_road_0c4c6b94_1080p.mp4': ('Airports & travel', 'Road-trip, window reaction. Check driver/interior at 100%', AI),
 'videos for tour/Tour_guide_speaking_at_fortress_d8b8e221_1080p.mp4': ('Heritage & culture', 'Generic illustrative heritage tour – NOT a verified location', AI),
 'videos for tour/Woman_relaxing_at_beach_restaurant_656dedd1_1080p.mp4': ('Beaches & resorts', 'Beachfront dining / relaxation hero', AI),
 'videos for tour/Recording 2026-10-30 003245.mp4': ('Ghana destinations', 'Ocean/boats. EXCLUDED from draft v1: over-processed after 9:16 crop', SR),
 'videos for tour/Recording 2026-10-30 003419.mp4': ('Heritage & culture', 'Aerial coastal fort (location unconfirmed). Used in draft v1', SR),
 'videos for tour/Recording 2026-10-30 003533.mp4': ('Heritage & culture', 'Aerial coastal fort + town (location unconfirmed). Used in draft v1', SR),
 'videos for tour/Recording 2026-10-30 003655.mp4': ('Ghana destinations', 'Street from car; blown-out sky. Unused', SR),
 'videos for tour/Recording 2026-10-30 003821.mp4': ('Heritage & culture', 'Drummers; stylised/crushed after crop. EXCLUDED from v1; get a clean original', SR + ' Identifiable people.'),
 'videos for tour/Recording 2026-10-30 003912.mp4': ('Beaches & resorts', 'Palms, umbrella, loungers. Used in draft v1', SR),
 'videos for tour/Recording 2026-10-30 004023.mp4': ('Ghana destinations', 'Tuk-tuk street scene; blown sky after crop. EXCLUDED from v1', SR + ' Identifiable people.'),
 'videos for tour/18102810-uhd_3840_2160_30fps.mp4': ('Ghana destinations', 'Roadside coconut seller (4K). Excluded: head cropped at 9:16 + visible phone number on sign', 'Stock, ID suggests Pexels – ' + UNV + ' Identifiable person.'),
 'videos for tour/12716487_2560_1440_24fps.mp4': ('Ghana destinations', 'Accra interchange, overcast. Unused (flat grey sky)', 'Stock, ID suggests Pexels – ' + UNV),
 'videos for tour/9694500-hd_1920_1080_24fps.mp4': ('Beaches & resorts', 'Fishing beach with canoes. EXCLUDED from v1 (hazy sky, poor after crop)', 'Stock, ID suggests Pexels – ' + UNV),
 'videos for tour/6174521-hd_1080_1920_30fps.mp4': ('Student & lifestyle', 'Dancer in patterned top. Dark source (720p). Used briefly in v1', 'Stock, ID suggests Pexels – ' + UNV + ' Identifiable people.'),
 'videos for tour/6193112-hd_1080_1920_30fps.mp4': ('Student & lifestyle', 'Friends dancing, African prints. Dark; needs lift', 'Stock, ID suggests Pexels – ' + UNV + ' Identifiable people.'),
 'videos for tour/6193113-hd_1080_1920_30fps.mp4': ('Student & lifestyle', 'Friends dancing, African prints. Dark; needs lift', 'Stock, ID suggests Pexels – ' + UNV + ' Identifiable people.'),
 'audio/(Audio) Upbeat Background Music For Videos (No Copyright).m4a': ('Background music', 'Temporary placeholder only. Clipped source (+2 dBTP). Not Afro-cinematic', 'Licence UNVERIFIED ("No Copyright" label, no source/artist). Internal preview only.'),
 'Logo.svg': ('Brand assets', 'Dexterity logo (orange #f37a20 / navy #283c8d)', 'Owned brand asset.'),
}
def cat_for(p):
    if p.startswith('audio files for tour/'): return ('Narration (tour)', 'December tour voiceover, scenes 1–6B in filename order', 'Client-recorded narration (WhatsApp voice notes).')
    if p.startswith('BUDAPEST-VID/speech'): return ('Narration (Budapest)', 'Budapest study campaign speech notes', 'Client-recorded.')
    if p.startswith('BUDAPEST-VID/') : return ('Budapest campaign', 'Separate Budapest study-abroad campaign material', 'Mixed/unknown – confirm per file.')
    if p.startswith('Woman_answering'): return ('Budapest campaign', 'Budapest campaign AI clip', AI)
    if p.startswith('videos for tour/') and p.endswith('.png'): return ('Stills (AI keyframes)', 'Likely keyframe for matching AI clip; end-card/poster reference', AI)
    return ('Uncategorised', '', 'Unknown')
ext = ('.mp4', '.m4a', '.ogg', '.png', '.jpg', '.jpeg', '.avif', '.webp', '.svg')
items = []
for dp, dn, fn in os.walk(root):
    dn[:] = [d for d in dn if d not in ('.git', 'node_modules', 'work', 'out', 'campaigns', 'asset-library', 'production')]
    for f in fn:
        if not f.lower().endswith(ext): continue
        p = os.path.relpath(os.path.join(dp, f), root); full = os.path.join(root, p)
        c, use, lic = META.get(p) or cat_for(p)
        e = dict(path=p, category=c, suggested_use=use, licence_note=lic, size_mb=round(os.path.getsize(full)/1e6, 2))
        if not p.lower().endswith(('.png', '.jpg', '.jpeg', '.avif', '.webp', '.svg')):
            r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=codec_type,width,height,r_frame_rate', '-of', 'json', full], capture_output=True, text=True)
            j = json.loads(r.stdout or '{}'); v = [s for s in j.get('streams', []) if s['codec_type'] == 'video']
            e['duration_s'] = round(float(j.get('format', {}).get('duration', 0)), 2); e['has_audio'] = any(s['codec_type'] == 'audio' for s in j.get('streams', []))
            if v: e.update(resolution=f"{v[0]['width']}x{v[0]['height']}", fps=v[0]['r_frame_rate'])
        items.append(e)
items.sort(key=lambda x: (x['category'], x['path']))
json.dump(items, open(f'{root}/asset-library/catalogue.json', 'w'), indent=1, ensure_ascii=False)
with open(f'{root}/asset-library/CATALOGUE.md', 'w') as f:
    f.write('# Dexterity asset catalogue\n\nIndex only – files stay in place under their original names (no duplicates). Regenerate with `python3 asset-library/build_catalogue.py`.\n**Licence notes are conservative: nothing marked UNVERIFIED may be assumed reusable.**\n')
    cur = None
    for e in items:
        if e['category'] != cur: cur = e['category']; f.write(f'\n## {cur}\n\n| File | Tech | Suggested use | Licence / status |\n|---|---|---|---|\n')
        tech = ' · '.join(x for x in [e.get('resolution'), e.get('fps'), f"{e['duration_s']}s" if 'duration_s' in e else None, f"{e['size_mb']} MB"] if x)
        f.write(f"| `{e['path']}` | {tech} | {e['suggested_use']} | {e['licence_note']} |\n")
print(len(items), 'assets indexed')
