#!/usr/bin/env python3
import math, wave, struct, random
from pathlib import Path

SR=22050
BPM=116.0
BEAT=60.0/BPM
BARS=8
DUR=BARS*4*BEAT
N=int(DUR*SR)
mix=[0.0]*N
random.seed(864)

def hz(note):
    return 440.0*(2.0**((note-69)/12.0))

def add_tone(start,dur,note,amp=0.15,kind='sine',attack=0.015,release=0.18):
    s0=max(0,int(start*SR)); s1=min(N,int((start+dur)*SR)); f=hz(note)
    for i in range(s0,s1):
        t=(i-s0)/SR
        a=min(1.0,t/max(attack,1e-4))*min(1.0,(dur-t)/max(release,1e-4))
        if a<0:a=0
        ph=2*math.pi*f*t
        if kind=='bell':
            v=(math.sin(ph)+0.42*math.sin(2.01*ph)+0.19*math.sin(3.98*ph))*math.exp(-2.9*t)
        elif kind=='pad':
            v=0.62*math.sin(ph)+0.26*math.sin(ph*0.5)+0.12*math.sin(ph*2.0)
        elif kind=='pluck':
            v=(math.sin(ph)+0.30*math.sin(2*ph))*math.exp(-4.5*t)
        else:
            v=math.sin(ph)
        mix[i]+=v*amp*a

def add_noise(start,dur,amp=0.03,bright=False):
    s0=max(0,int(start*SR)); s1=min(N,int((start+dur)*SR))
    last=0.0
    for i in range(s0,s1):
        t=(i-s0)/SR
        env=math.exp(-10*t)
        x=random.uniform(-1,1)
        if bright:
            y=x-last; last=x
        else:
            last=0.85*last+0.15*x; y=last
        mix[i]+=y*amp*env

def add_kick(start,amp=0.18):
    s0=int(start*SR); dur=0.22; s1=min(N,int((start+dur)*SR))
    for i in range(s0,s1):
        t=(i-s0)/SR
        f=90-55*(t/dur)
        v=math.sin(2*math.pi*f*t)*math.exp(-14*t)
        mix[i]+=v*amp

# D major palette
chords=[
    [50,54,57,61,64], # Dmaj9
    [47,50,54,57,61], # Bm7/9
    [43,47,50,54,57], # Gmaj9
    [45,50,52,57,62], # Asus4/add9
]
# two passes for 8 bars
for bar in range(BARS):
    t0=bar*4*BEAT
    chord=chords[bar%4]
    # pad bed
    for n in chord:
        add_tone(t0,4*BEAT,n,0.035,'pad',0.28,0.45)
    # soft bass pulses
    root=chord[0]-12
    for b in (0,2):
        add_tone(t0+b*BEAT,0.9*BEAT,root,0.08,'sine',0.02,0.18)
    # percussion
    for b in range(4):
        add_kick(t0+b*BEAT,0.12 if b in (0,2) else 0.075)
        add_noise(t0+(b+0.5)*BEAT,0.06,0.018,True)
    add_noise(t0+1*BEAT,0.11,0.024,False)
    add_noise(t0+3*BEAT,0.11,0.024,False)

# arpeggio sparkle
arp=[62,66,69,73,69,66,64,69,73,76,73,69,67,71,74,78,74,71,69,74,76,81,76,74]
for k in range(BARS*8):
    t=k*(BEAT/2)
    n=arp[k%len(arp)]
    add_tone(t,0.34*BEAT,n,0.034,'pluck',0.003,0.08)

# simple memorable bell melody, 2-bar phrase x4 with variation
melody=[
    (0.0,74,0.75),(1.0,76,0.5),(1.75,78,0.5),(2.5,76,0.75),(3.5,73,0.5),
    (4.0,71,0.75),(5.0,73,0.5),(5.75,74,0.5),(6.5,69,1.0),
]
for phrase in range(4):
    base=phrase*8*BEAT
    trans=0 if phrase<2 else 12 if phrase==3 else 0
    for beat,n,d in melody:
        nn=n+trans if (phrase==3 and beat>=5.0) else n
        add_tone(base+beat*BEAT,d*BEAT,nn,0.075,'bell',0.005,0.22)

# gentle rise into loop seam
for j,n in enumerate([69,73,76,78,81]):
    add_tone(DUR-(2.5-j*0.35)*BEAT,0.45*BEAT,n,0.045,'bell',0.004,0.16)

# soft limiter + tiny fade only first/last 12ms to avoid click
peak=max(abs(x) for x in mix) or 1.0
gain=0.82/peak
out=[]
fade=int(SR*0.012)
for i,x in enumerate(mix):
    y=math.tanh(x*gain*1.25)/math.tanh(1.25)
    if i<fade:y*=i/fade
    if i>N-fade:y*=(N-i)/fade
    out.append(max(-32767,min(32767,int(y*32767))))

dest=Path('assets/audio')
dest.mkdir(parents=True,exist_ok=True)
path=dest/'gacha-starry-loop-v0864.wav'
with wave.open(str(path),'wb') as w:
    w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR)
    w.writeframes(struct.pack('<'+'h'*len(out),*out))
print(path, path.stat().st_size, DUR)
