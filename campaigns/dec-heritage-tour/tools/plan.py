"""Single source of truth for the edit: clip registry, grade params, scene plan.
build_timeline.py turns this + the VO timeline + music onsets into src/timeline.json (read by prep + Remotion)."""
V = '../../videos for tour/'
AI_SUITCASE = V + 'Woman_walking_with_suitcase_at_8597bc26_1080p.mp4'
# Each clip: file, crop=(x,y,w,h) in source px (None = already 9:16), src_matrix, flag (licence/source status), grade dict.
# grade: bp/wp = input black/white point (0-255 luma-ish, applied per channel), gamma, sat, contrast, rgb_mult/mid shifts via colorbalance
# (rs..bh = -1..1 shadow/mid/high balance), mood: 'heritage'|'coast'|None
CLIPS = {
 'suitcase':  dict(file=AI_SUITCASE, flag='AI-generated (Dexterity-provided) – OK internal', grade=dict(bp=10, wp=235, gamma=1.18, sat=1.0, cb=dict(rm=-0.02, bm=0.02), mood=None)),
 'terminal':  dict(file=V+'Woman_walking_through_airport_te…_66bbda25_1080p.mp4', flag='AI-generated – OK internal', grade=dict(bp=40, wp=225, gamma=1.0, sat=0.95, cb=dict(bm=0.015), mood=None)),
 'suv':       dict(file=V+'SUV_driving_along_coastal_road_0c4c6b94_1080p.mp4', flag='AI-generated – OK internal', grade=dict(bp=6, wp=225, gamma=1.28, sat=0.98, cb=dict(bm=0.03), mood=None)),
 'guide':     dict(file=V+'Tour_guide_speaking_at_fortress_d8b8e221_1080p.mp4', flag='AI-generated – OK internal (location unverified, not named)', grade=dict(bp=22, wp=232, gamma=1.0, sat=0.9, cb=dict(rm=0.03, bm=-0.03, gm=0.0, rh=0.0), mood='heritage')),
 'restaurant':dict(file=V+'Woman_relaxing_at_beach_restaurant_656dedd1_1080p.mp4', flag='AI-generated – OK internal', grade=dict(bp=30, wp=240, gamma=1.0, sat=0.92, cb=dict(bm=0.01), mood='coast')),
 'ocean':     dict(file=V+'Recording 2026-10-30 003245.mp4', crop=(250,0,549,976), matrix='bt709', flag='UNVERIFIED screen-recording of third-party footage', grade=dict(bp=85, wp=225, gamma=1.0, sat=0.62, cb=dict(rm=0.07, gm=0.0, bm=-0.08, rs=0.02, bs=-0.03), mood='coast')),
 'aerial_a':  dict(file=V+'Recording 2026-10-30 003533.mp4', crop=(330,25,647,1150), matrix='bt709', flag='UNVERIFIED screen-recording; location not confirmed', grade=dict(bp=70, wp=200, gamma=1.0, sat=0.95, cb=dict(rm=0.02, bm=-0.01), mood='heritage')),
 'aerial_b':  dict(file=V+'Recording 2026-10-30 003419.mp4', crop=(450,95,607,1080), matrix='bt709', flag='UNVERIFIED screen-recording; location not confirmed', grade=dict(bp=50, wp=190, gamma=1.0, sat=1.0, cb=dict(rm=0.02, bm=-0.01), mood='heritage')),
 'drummer':   dict(file=V+'Recording 2026-10-30 003821.mp4', crop=(700,40,675,1200), matrix='bt709', flag='UNVERIFIED screen-recording; identifiable people, no release', grade=dict(bp=34, wp=225, gamma=1.30, sat=0.62, cb=dict(rm=-0.02, bm=0.05, rs=-0.02, bs=0.03), mood='heritage')),
 'palms':     dict(file=V+'Recording 2026-10-30 003912.mp4', crop=(300,15,697,1240), matrix='bt709', flag='UNVERIFIED screen-recording of third-party footage', grade=dict(bp=25, wp=225, gamma=1.0, sat=0.85, cb=dict(rm=0.02, bm=-0.02), mood='coast')),
 'tuktuk':    dict(file=V+'Recording 2026-10-30 004023.mp4', crop=(500,20,697,1240), matrix='bt709', flag='UNVERIFIED screen-recording; identifiable people, no release', grade=dict(bp=30, wp=250, gamma=1.05, sat=0.88, cb=dict(rm=0.01, bm=-0.01), mood=None)),
 'coconut':   dict(file=V+'18102810-uhd_3840_2160_30fps.mp4', crop=(800,0,1215,2160), flag='Stock (source/licence UNVERIFIED); identifiable person', grade=dict(bp=28, wp=215, gamma=1.0, sat=0.95, cb=dict(rm=0.03, bm=-0.03), mood=None)),
 'fishing':   dict(file=V+'9694500-hd_1920_1080_24fps.mp4', crop=(60,0,608,1080), flag='Stock (source/licence UNVERIFIED)', grade=dict(bp=95, wp=210, gamma=1.0, sat=0.9, cb=dict(rm=0.02, bm=-0.02), mood=None)),
 'dance_a':   dict(file=V+'6193112-hd_1080_1920_30fps.mp4', flag='Stock (source/licence UNVERIFIED); identifiable people, no release', grade=dict(bp=14, wp=150, gamma=1.55, sat=0.88, cb=dict(rm=-0.03, bm=0.04), mood=None)),
 'dance_b':   dict(file=V+'6193113-hd_1080_1920_30fps.mp4', flag='Stock (source/licence UNVERIFIED); identifiable people, no release', grade=dict(bp=14, wp=125, gamma=1.6, sat=0.88, cb=dict(rm=-0.03, bm=0.04), mood=None)),
 'dancer':    dict(file=V+'6174521-hd_1080_1920_30fps.mp4', flag='Stock (source/licence UNVERIFIED); 720p source, identifiable person', grade=dict(bp=14, wp=72, gamma=1.7, sat=0.8, cb=dict(rm=-0.07, gm=0.02), mood=None)),
}
# Scene plan: ordered shots (clip, src_in, dur, transition-in). Last shot in each scene absorbs rounding so the scene fills its window.
# transition-in types: cut | dissolve | leak | push.  dur seconds (centred on the cut).
SCENES = [
 dict(id='1-homecoming', shots=[('suitcase',0.0,5.9,'cut',0),('terminal',0.5,6.5,'dissolve',0.4)]),
 dict(id='2-journey', shots=[('suv',0.0,6.2,'leak',0.8),('aerial_a',0.5,5.7,'push',0.5)]),
 dict(id='3-heritage', shots=[('guide',0.0,5.4,'leak',0.8),('aerial_b',0.5,5.0,'dissolve',0.5)]),
 dict(id='4-relaxation', shots=[('restaurant',0.0,5.7,'leak',0.8),('palms',0.3,4.4,'dissolve',0.5)]),
 dict(id='5-memories', shots=[('dance_a',0.5,5.0,'leak',0.8),('dancer',3.0,2.6,'cut',0),('dance_b',0.3,4.5,'dissolve',0.4)]),
 dict(id='6-invitation', shots=[('restaurant',5.5,2.4,'leak',0.8),('dance_b',5.0,4.2,'cut',0),('aerial_a',5.0,3.6,'dissolve',0.4),('dance_a',6.0,4.5,'cut',0),('palms',4.0,13.2,'leak',0.8)]),
]
LEAD = 1.3          # seconds before VO starts
TAIL = 4.6          # seconds after VO ends (end card hold)
