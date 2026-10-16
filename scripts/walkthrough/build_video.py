"""Assemble actual timed browser captures and offline narration into a walkthrough.

Capture PNGs and timing.json files are recorded through cua_repl, not generated
mockups. Raw browser frames stay in ignored artifacts/private/walkthrough.
"""
from pathlib import Path
import json, wave, subprocess, textwrap, html, shutil
import imageio_ffmpeg
ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'artifacts/private/walkthrough'
PUBLIC=ROOT/'public/walkthrough'
FFMPEG=imageio_ffmpeg.get_ffmpeg_exe()
scenes=json.loads((WORK/'manifest.json').read_text(encoding='utf-8'))
PUBLIC.mkdir(parents=True,exist_ok=True)
def run(args):
 p=subprocess.run([FFMPEG,'-hide_banner','-loglevel','error','-y',*map(str,args)],capture_output=True,text=True)
 if p.returncode:raise RuntimeError(p.stderr[-5000:])
def stamp(t):
 ms=round(t*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}.{ms%1000:03}'
chapters=[];cues=['WEBVTT',''];offset=0
for scene in scenes:
 ident=scene['id'];directory=WORK/'captures'/ident
 timing=json.loads((directory/'timing.json').read_text(encoding='utf-8'))
 assert timing['duration']>=scene['duration']-0.5,(ident,'incomplete real-time capture')
 frames=[f for f in timing['frames'] if f['at']<scene['duration']]
 assert len(frames)>30,(ident,'insufficient recorded browser frames')
 lines=['ffconcat version 1.0']
 for i,frame in enumerate(frames):
  path=(directory/frame['file']).as_posix()
  end=frames[i+1]['at'] if i+1<len(frames) else scene['duration']
  start=frame['at'] if i else 0
  lines += [f"file '{path}'",f'duration {max(0.001,end-start):.6f}']
 lines += [f"file '{(directory/frames[-1]['file']).as_posix()}'"]
 frame_list=directory/'frames.ffconcat';frame_list.write_text('\n'.join(lines)+'\n',encoding='utf-8')
 audio_files=[ROOT/segment['file'] for segment in scene['segments']]
 with wave.open(str(audio_files[0]),'rb') as f:params=f.getparams()
 rate=params.framerate;sample_bytes=params.sampwidth*params.nchannels
 audio=WORK/'audio'/f'{ident}-complete.wav'
 with wave.open(str(audio),'wb') as out:
  out.setparams(params);out.writeframes(bytes(round(rate)*sample_bytes))
  for segment,path in zip(scene['segments'],audio_files):
   with wave.open(str(path),'rb') as inp:out.writeframes(inp.readframes(inp.getnframes()))
   out.writeframes(bytes(round(0.55*rate)*sample_bytes))
   chunks=textwrap.wrap(segment['text'],92,break_long_words=False)
   length=segment['duration']/len(chunks)
   for n,chunk in enumerate(chunks):
    a=offset+segment['start']+n*length;b=a+length
    cues += [f'{stamp(a)} --> {stamp(b)}',chunk,'']
  out.writeframes(bytes(round(rate)*sample_bytes))
 output=WORK/f'chapter-{ident}.mp4'
 run(['-f','concat','-safe','0','-i',frame_list,'-i',audio,'-t',scene['duration'],'-vf','fps=12,scale=1440:900:force_original_aspect_ratio=decrease,pad=1440:900:(ow-iw)/2:(oh-ih)/2:color=0xf4f0e8,setsar=1','-c:v','libx264','-preset','veryfast','-crf','23','-pix_fmt','yuv420p','-c:a','aac','-b:a','112k','-movflags','+faststart',output])
 chapters.append({'id':ident,'title':scene['title'],'start':round(offset,3),'duration':scene['duration'],'recordedFrames':len(frames),'actions':timing['events']})
 print('ENCODED',ident,scene['duration'],flush=True);offset+=scene['duration']
concat=WORK/'chapters.ffconcat';concat.write_text('ffconcat version 1.0\n'+''.join(f"file '{(WORK/('chapter-'+s['id']+'.mp4')).as_posix()}'\n" for s in scenes),encoding='utf-8')
metadata=WORK/'chapters.ffmetadata'
meta=[';FFMETADATA1','title=Chamber House - recorded app walkthrough','comment=Actual browser navigation and form entry. Existing public StudioNet live verification cases. Offline synthetic narration.']
for c in chapters:meta+=['[CHAPTER]','TIMEBASE=1/1000',f"START={round(c['start']*1000)}",f"END={round((c['start']+c['duration'])*1000)}",'title='+c['title']]
metadata.write_text('\n'.join(meta)+'\n',encoding='utf-8')
final=PUBLIC/'chamber-house-walkthrough.mp4'
run(['-f','concat','-safe','0','-i',concat,'-i',metadata,'-map_metadata','1','-map_chapters','1','-c','copy','-movflags','+faststart',final])
(PUBLIC/'captions.vtt').write_text('\n'.join(cues),encoding='utf-8')
(PUBLIC/'chapters.json').write_text(json.dumps(chapters,indent=2)+'\n',encoding='utf-8')
shutil.copyfile(WORK/'captures/01/00000.png',PUBLIC/'poster.png')
transcript='# Chamber House walkthrough\n\nRecorded navigation and form entry in the deployed application, with synthetic voice narration. The hearing and settlement use existing live StudioNet integration cases. New wallet transactions are not signed in this recording.\n\n'
for s,c in zip(scenes,chapters):
 transcript+=f"## {stamp(c['start'])[:8]} - {s['title']}\n\n"+'\n\n'.join(s['sentences'])+'\n\n'
(ROOT/'WALKTHROUGH.md').write_text(transcript,encoding='utf-8')
report={'status':'RENDERED','durationSeconds':round(offset,3),'dimensions':[1440,900],'outputBytes':final.stat().st_size,'method':'Continuous timed browser screenshots captured through cua_repl, including real navigation, scrolling and form entry; synchronized offline narration; optional captions.','walletSigning':'Not recorded; existing completed live integration cases are inspected.','chapters':chapters}
(ROOT/'artifacts/walkthrough-video.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print('WALKTHROUGH_RENDERED',round(offset,2),final.stat().st_size,flush=True)
