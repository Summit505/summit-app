import { useState, useEffect, useCallback } from "react";

const GS = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Libre+Baskerville:ital@0;1&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{background:#080e0a;color:#dde8e1}
    ::-webkit-scrollbar{width:3px;height:3px}
    ::-webkit-scrollbar-track{background:#080e0a}
    ::-webkit-scrollbar-thumb{background:#1a2e1e;border-radius:99px}
    input,select,textarea{outline:none;appearance:none;-webkit-appearance:none}
    button{cursor:pointer}
    @keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    @keyframes popIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  `}</style>
);

const C = {
  green:"#4ec87e",greenDark:"#1a3e20",greenMid:"#2a5e3a",greenDim:"#3d6b4a",greenFaint:"#1a2e1e",
  amber:"#d4872a",amberDark:"#1a1205",amberMid:"#3d2810",
  bg:"#080e0a",card:"#0c1510",cardDark:"#090f0b",
  text:"#dde8e1",textDim:"#9ab5a0",textFaint:"#4b6b55",textGhost:"#2a3a2e",
  border:"#1a2e1e",borderMid:"#1e3025",
};

const LEVELS = [
  {level:1,name:"Flatlands",min:0,icon:"🌾",color:"#8B7355"},
  {level:2,name:"Trail Walker",min:100,icon:"🥾",color:"#7A9E7E"},
  {level:3,name:"Ridge Runner",min:300,icon:"🌲",color:"#4A8F6F"},
  {level:4,name:"Summit Seeker",min:600,icon:"⛰️",color:"#5B8FA8"},
  {level:5,name:"Alpinist",min:1000,icon:"🏔️",color:"#8B9DC3"},
  {level:6,name:"Peak Bagger",min:1500,icon:"🦅",color:"#C9A84C"},
  {level:7,name:"Mountain Ghost",min:2200,icon:"❄️",color:"#B0C4DE"},
  {level:8,name:"Summit Legend",min:3000,icon:"⭐",color:"#E8C547"},
];

// track:"summit" = always public | track:"recovery" = private unless user shares
const ACHIEVEMENTS = [
  {id:"first_step",icon:"👟",name:"First Step",desc:"Complete your first training day",track:"summit",check:s=>s.totalDone>=1},
  {id:"week1",icon:"📅",name:"One Week Strong",desc:"Complete all 7 days of Week 1",track:"summit",check:s=>s.weeksComplete>=1},
  {id:"phase1",icon:"🏕️",name:"Base Camp",desc:"Complete Phase 1: Base Building",track:"summit",check:s=>s.phasesComplete>=1},
  {id:"phase2",icon:"⛏️",name:"Load Bearer",desc:"Complete Phase 2: Load Tolerance",track:"summit",check:s=>s.phasesComplete>=2},
  {id:"halfway",icon:"🎯",name:"Halfway There",desc:"Reach 50% plan completion",track:"summit",check:s=>s.pct>=50},
  {id:"streak7",icon:"🔥",name:"No Excuses",desc:"Train 7 days in a row",track:"summit",check:s=>s.currentStreak>=7},
  {id:"streak30",icon:"💪",name:"Iron Will",desc:"30-day training streak",track:"summit",check:s=>s.currentStreak>=30},
  {id:"summit_done",icon:"🏔️",name:"Summit Day",desc:"Complete your first summit",track:"summit",check:s=>s.summitsDone>=1},
  {id:"multi_summit",icon:"⭐",name:"Peak Bagger",desc:"Complete 3 summits",track:"summit",check:s=>s.summitsDone>=3},
  {id:"level5",icon:"🦅",name:"Alpinist",desc:"Reach Level 5",track:"summit",check:s=>s.level>=5},
  {id:"journal10",icon:"📓",name:"Field Notes",desc:"Write 10 journal entries",track:"summit",check:s=>s.journalEntries>=10},
  {id:"crew",icon:"👥",name:"Find Your Crew",desc:"Join or create a group summit",track:"summit",check:s=>s.hasCrew},
  // recovery track — private by default
  {id:"dry5",icon:"💧",name:"Five Clean",desc:"5 days toward your personal goal",track:"recovery",check:s=>s.totalCleanDays>=5},
  {id:"dry30",icon:"🌊",name:"Thirty Days",desc:"30 days — momentum building",track:"recovery",check:s=>s.totalCleanDays>=30},
  {id:"dry90",icon:"🔱",name:"Ninety Days",desc:"90 days — life-changing territory",track:"recovery",check:s=>s.totalCleanDays>=90},
  {id:"dry180",icon:"🌟",name:"Six Months",desc:"180 days — you rewrote the story",track:"recovery",check:s=>s.totalCleanDays>=180},
  {id:"dry365",icon:"🏆",name:"One Year",desc:"365 days — the mountain was just the beginning",track:"recovery",check:s=>s.totalCleanDays>=365},
];

const HABIT_PRESETS = [
  {id:"alcohol",label:"Alcohol",icon:"🍺",nightLabel:"Drink-Free Day"},
  {id:"smoking",label:"Smoking",icon:"🚬",nightLabel:"Smoke-Free Day"},
  {id:"cannabis",label:"Cannabis",icon:"🌿",nightLabel:"Clear Day"},
  {id:"screens",label:"Screen Time",icon:"📱",nightLabel:"Offline Day"},
  {id:"gambling",label:"Gambling",icon:"🎲",nightLabel:"Clean Day"},
  {id:"food",label:"Junk Food",icon:"🍔",nightLabel:"Clean Eating Day"},
  {id:"other",label:"Something Else",icon:"🔒",nightLabel:"Clean Day"},
  {id:"custom",label:"My Own Words",icon:"✏️",nightLabel:"Clean Day"},
];

const HABIT_MODES = [
  {id:"moderation",label:"Moderation",icon:"⚖️",desc:"Set a weekly limit and stay under it"},
  {id:"taper",label:"Taper Off",icon:"📉",desc:"Gradually reduce toward a quit date"},
  {id:"quit",label:"Full Quit",icon:"🚫",desc:"Stop completely — track every clean day"},
];

const FITNESS_LEVELS = [
  {id:"beginner",label:"Beginner",icon:"🌱",desc:"Little to no current exercise routine"},
  {id:"intermediate",label:"Intermediate",icon:"🏃",desc:"Active a few times a week, some hiking"},
  {id:"advanced",label:"Advanced",icon:"⚡",desc:"Regular training, comfortable with long hikes"},
];

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];

const SUMMITS = {
  west:[
    {name:"Mt. Sniktau",state:"CO",elevation:13234,difficulty:"Moderate",distance:"3.8 mi RT",gain:800,image:"🏔️",note:"Excellent starter 13er — accessible trailhead, great acclimatization hike"},
    {name:"Mt. Whitney",state:"CA",elevation:14505,difficulty:"Strenuous",distance:"22 mi RT",gain:6100,image:"🏔️",note:"Highest peak in the contiguous US. Permit required."},
    {name:"Half Dome",state:"CA",elevation:8844,difficulty:"Strenuous",distance:"16 mi RT",gain:4800,image:"🪨",note:"Iconic Yosemite peak. Cable permits required for final ascent."},
    {name:"South Sister",state:"OR",elevation:10358,difficulty:"Moderate",distance:"12 mi RT",gain:4900,image:"🌋",note:"Oregon third highest — stunning volcanic landscape."},
    {name:"Mt. Rainier Camp Muir",state:"WA",elevation:10188,difficulty:"Strenuous",distance:"9 mi RT",gain:4500,image:"🌨️",note:"Glacier training route. Consider a guided ascent."},
    {name:"Mt. Elbert",state:"CO",elevation:14439,difficulty:"Moderate",distance:"9 mi RT",gain:4700,image:"🏔️",note:"Highest peak in Colorado. Well-marked trail, great starter 14er."},
  ],
  southwest:[
    {name:"Humphreys Peak",state:"AZ",elevation:12637,difficulty:"Strenuous",distance:"9 mi RT",gain:3400,image:"🏔️",note:"Highest point in Arizona. Dense forest to alpine tundra."},
    {name:"Wheeler Peak",state:"NM",elevation:13161,difficulty:"Moderate",distance:"14 mi RT",gain:3700,image:"🏔️",note:"Highest point in New Mexico. Beautiful high-desert approach."},
    {name:"Angels Landing",state:"UT",elevation:5790,difficulty:"Strenuous",distance:"5.4 mi RT",gain:1488,image:"🪨",note:"Iconic Zion scramble. Permit required. Significant exposure."},
    {name:"Guadalupe Peak",state:"TX",elevation:8751,difficulty:"Moderate",distance:"8.4 mi RT",gain:3000,image:"🏜️",note:"Highest point in Texas. Windy and exposed — classic desert."},
  ],
  southeast:[
    {name:"Mt. Mitchell",state:"NC",elevation:6684,difficulty:"Moderate",distance:"11 mi RT",gain:3600,image:"🌲",note:"Highest peak east of the Mississippi. Dense spruce-fir forest."},
    {name:"Clingmans Dome",state:"TN",elevation:6643,difficulty:"Easy",distance:"1 mi RT",gain:330,image:"🌫️",note:"Great beginner summit. Short but meaningful."},
    {name:"Black Balsam Knob",state:"NC",elevation:6214,difficulty:"Moderate",distance:"3.5 mi RT",gain:800,image:"🌾",note:"Spectacular open bald summit on the Blue Ridge Parkway."},
    {name:"Mt. LeConte",state:"TN",elevation:6593,difficulty:"Strenuous",distance:"16 mi RT",gain:3900,image:"🌲",note:"Multiple trail options. Lodge at summit for overnights."},
    {name:"Brasstown Bald",state:"GA",elevation:4784,difficulty:"Easy",distance:"1 mi RT",gain:400,image:"🌿",note:"Highest point in Georgia. Good for early Phase 1 training."},
  ],
  northeast:[
    {name:"Mt. Washington",state:"NH",elevation:6288,difficulty:"Strenuous",distance:"8 mi RT",gain:4200,image:"🌬️",note:"Home of the world's worst weather. Respect this mountain."},
    {name:"Katahdin",state:"ME",elevation:5269,difficulty:"Strenuous",distance:"10 mi RT",gain:4200,image:"🏔️",note:"Northern terminus of the Appalachian Trail. Knife-edge ridge."},
    {name:"Mt. Marcy",state:"NY",elevation:5344,difficulty:"Strenuous",distance:"15 mi RT",gain:3200,image:"🏔️",note:"Highest point in New York. Adirondacks at their finest."},
    {name:"Mt. Greylock",state:"MA",elevation:3491,difficulty:"Moderate",distance:"7 mi RT",gain:1400,image:"🌲",note:"Highest point in Massachusetts. Good Phase 1-2 trainer."},
    {name:"Camels Hump",state:"VT",elevation:4083,difficulty:"Moderate",distance:"7.5 mi RT",gain:2600,image:"🐪",note:"Vermont most iconic summit. Above-treeline exposure."},
  ],
  midwest:[
    {name:"Eagle Mountain",state:"MN",elevation:2301,difficulty:"Moderate",distance:"7 mi RT",gain:600,image:"🌲",note:"Highest point in Minnesota. Remote BWCA approach."},
    {name:"Taum Sauk Mountain",state:"MO",elevation:1772,difficulty:"Easy",distance:"3 mi RT",gain:300,image:"🌲",note:"Highest point in Missouri. Great intro summit."},
    {name:"Rib Mountain",state:"WI",elevation:1940,difficulty:"Easy",distance:"4 mi RT",gain:600,image:"🌲",note:"Accessible training hill — excellent Phase 1 conditioning."},
    {name:"Mt. Arvon",state:"MI",elevation:1979,difficulty:"Easy",distance:"4 mi RT",gain:400,image:"🌲",note:"Highest point in Michigan. Remote but rewarding."},
  ],
};

const TRAILS = {
  west:[
    {name:"Bear Lake Loop",state:"CO",distance:"0.6 mi",gain:20,difficulty:"Easy",phase:[1],why:"Perfect flat opener for Week 1 assessment",image:"🌊"},
    {name:"Flattop Mountain",state:"CO",distance:"8.5 mi",gain:2849,difficulty:"Moderate",phase:[2],why:"Sustained elevation — ideal rucking terrain",image:"🏔️"},
    {name:"Grays and Torreys",state:"CO",distance:"8 mi",gain:3500,difficulty:"Strenuous",phase:[3],why:"Back-to-back peaks simulate summit day conditions",image:"⛰️"},
    {name:"Rattlesnake Ledge",state:"WA",distance:"4 mi",gain:1100,difficulty:"Moderate",phase:[1],why:"Short punchy elevation — ideal for repeat hill efforts",image:"🦎"},
    {name:"Twin Peaks Trail",state:"CA",distance:"7.4 mi",gain:2000,difficulty:"Moderate",phase:[2],why:"Steep switchbacks both ways — great descent training",image:"🪨"},
  ],
  southwest:[
    {name:"Piestewa Peak",state:"AZ",distance:"2.4 mi",gain:1190,difficulty:"Strenuous",phase:[1,2],why:"Urban summit — perfect for repeat vertical training",image:"🌵"},
    {name:"Camelback Mountain",state:"AZ",distance:"2.5 mi",gain:1280,difficulty:"Strenuous",phase:[2],why:"Technical scrambling builds descent confidence",image:"🐪"},
    {name:"Enchanted Rock",state:"TX",distance:"3 mi",gain:425,difficulty:"Easy",phase:[1],why:"Exposed granite dome — good intro to summit exposure",image:"🪨"},
    {name:"Lost Maples Loop",state:"TX",distance:"10 mi",gain:1200,difficulty:"Moderate",phase:[2],why:"Sustained terrain for building trail endurance",image:"🍂"},
  ],
  southeast:[
    {name:"Max Patch Loop",state:"NC",distance:"2.4 mi",gain:350,difficulty:"Easy",phase:[1],why:"Bald summit views — great early confidence builder",image:"🌾"},
    {name:"Alum Cave to LeConte",state:"TN",distance:"11 mi",gain:2800,difficulty:"Strenuous",phase:[2,3],why:"Best high-volume elevation gain in the Smokies",image:"🌀"},
    {name:"Art Loeb Trail",state:"NC",distance:"6 mi",gain:2100,difficulty:"Moderate",phase:[2],why:"Sustained ridgeline — perfect ruck terrain",image:"🌄"},
    {name:"Grandfather Mountain",state:"NC",distance:"5 mi",gain:1600,difficulty:"Strenuous",phase:[2,3],why:"Exposed ridge scramble — closest to alpine SE",image:"👴"},
    {name:"Blood Mountain",state:"GA",distance:"4.4 mi",gain:1600,difficulty:"Moderate",phase:[1,2],why:"Highest point on Georgia AT — great Phase 2 push",image:"🩸"},
  ],
  northeast:[
    {name:"Mt. Monadnock",state:"NH",distance:"5 mi",gain:1818,difficulty:"Moderate",phase:[1,2],why:"Most climbed mountain in the US — exposed summit",image:"🏔️"},
    {name:"Franconia Ridge Loop",state:"NH",distance:"8.9 mi",gain:3900,difficulty:"Strenuous",phase:[3],why:"Above-treeline exposure — closest to summit conditions",image:"🌬️"},
    {name:"Mt. Tecumseh",state:"NH",distance:"5 mi",gain:2200,difficulty:"Moderate",phase:[1,2],why:"Consistent gradient — excellent ruck training trail",image:"🌲"},
    {name:"Tumbledown Mountain",state:"ME",distance:"4.5 mi",gain:1650,difficulty:"Moderate",phase:[2],why:"Rocky scrambles build technical confidence",image:"🪨"},
    {name:"Slide Mountain",state:"NY",distance:"6.5 mi",gain:1700,difficulty:"Moderate",phase:[2],why:"Catskills highest — solid Phase 2 elevation work",image:"🌄"},
  ],
  midwest:[
    {name:"Porcupine Mountains",state:"MI",distance:"12 mi",gain:800,difficulty:"Moderate",phase:[2],why:"Best sustained trail terrain in the Midwest",image:"🦔"},
    {name:"Pictured Rocks",state:"MI",distance:"7 mi",gain:400,difficulty:"Easy",phase:[1],why:"Flat distance builder — beautiful Great Lakes scenery",image:"🌊"},
    {name:"Starved Rock Canyons",state:"IL",distance:"6 mi",gain:300,difficulty:"Easy",phase:[1],why:"Good base-building terrain for flat-state hikers",image:"🏞️"},
    {name:"Copper Falls Loop",state:"WI",distance:"3 mi",gain:200,difficulty:"Easy",phase:[1],why:"Accessible trail for very early Phase 1 conditioning",image:"🍂"},
  ],
};

function getRegion(state) {
  const map={west:["WA","OR","CA","ID","MT","WY","CO","NV","UT","AK","HI"],southwest:["AZ","NM","TX","OK"],southeast:["FL","GA","SC","NC","VA","WV","KY","TN","AL","MS","AR","LA"],northeast:["ME","NH","VT","MA","RI","CT","NY","NJ","PA","DE","MD","DC"],midwest:["OH","IN","IL","MI","WI","MN","IA","MO","ND","SD","NE","KS"]};
  for(const [r,states] of Object.entries(map)) if(states.includes(state?.toUpperCase())) return r;
  return "west";
}
function getLevel(pts){let l=LEVELS[0];for(const x of LEVELS)if(pts>=x.min)l=x;return l;}
function getNextLevel(pts){for(const x of LEVELS)if(pts<x.min)return x;return null;}
function todayKey(){return new Date().toISOString().split("T")[0];}

function getStats(data) {
  if(!data?.plan?.length) return {totalDone:0,weeksComplete:0,phasesComplete:0,pct:0,totalCleanDays:0,summitsDone:0,currentStreak:0,level:1,journalEntries:0,hasCrew:false};
  let totalDone=0,weeksComplete=0,phasesComplete=0,summitsDone=0;
  const totalCleanDays=Object.values(data.cleanLog||{}).filter(v=>v?.clean).length;
  const journalEntries=Object.values(data.journal||{}).filter(v=>v?.trim()).length;
  const hasCrew=!!(data.crew?.name);
  data.plan.forEach(week=>{
    let done=0;
    week.days.forEach((_,di)=>{if(data.completed?.[`${week.week}-${di}`]){totalDone++;done++;}});
    if(done===week.days.length){weeksComplete++;if(week.isSummitWeek&&data.completed?.[`${week.week}-5`])summitsDone++;}
  });
  const phases=[...new Set(data.plan.map(w=>w.phase))];
  phases.forEach(ph=>{
    const pw=data.plan.filter(w=>w.phase===ph);
    if(pw.every(w=>w.days.every((_,di)=>data.completed?.[`${w.week}-${di}`])))phasesComplete++;
  });
  const totalDays=data.plan.reduce((a,w)=>a+w.days.length,0);
  const pct=totalDays>0?Math.round((totalDone/totalDays)*100):0;
  return {totalDone,weeksComplete,phasesComplete,summitsDone,pct,totalCleanDays,currentStreak:data.streak||0,level:getLevel(data.points||0).level,journalEntries,hasCrew};
}

function checkNewAchs(data) {
  const stats=getStats(data);
  return ACHIEVEMENTS.filter(a=>!(data.achievements||[]).includes(a.id)&&a.check(stats)).map(a=>a.id);
}

function getCurrentWeek(data) {
  if(!data?.plan) return null;
  return data.plan.find(w=>!w.days.every((_,di)=>data.completed?.[`${w.week}-${di}`])&&!w.skipped)||data.plan[data.plan.length-1];
}

function generatePlan(summitName, summitElevation, fitnessLevel, totalWeeks) {
  const isBeg=fitnessLevel==="beginner",isAdv=fitnessLevel==="advanced";
  const packStart=isBeg?10:isAdv?20:15;
  const hikeStart=isBeg?30:isAdv?60:45;
  const T=[
    {focus:"Assessment Week",note:"Establish your baseline. No pressure — just show up.",longPts:25},
    {focus:"Consistency Over Intensity",note:"The habit forms whether it feels like it or not.",longPts:25},
    {focus:"Load Introduction",note:"Add a light pack. Feel the difference.",longPts:30},
    {focus:"Deload — Active Recovery",note:"Deload is not optional. This is where adaptation happens.",longPts:15,deload:true},
    {focus:"Elevation Seeking",note:"Hills, stairs, max-incline treadmill — seek the vertical.",longPts:30},
    {focus:"Phase 1 Test",note:"What held up? What needs work? Note it and adjust.",longPts:40},
    {focus:"Rucking Begins",note:"Rucking is the single best carryover to summit hiking.",longPts:40},
    {focus:"Vertical Volume",note:"Order trekking poles if you do not have them. Not optional.",longPts:45},
    {focus:"Descent Training",note:"Descents destroy untrained knees. Train both directions.",longPts:45},
    {focus:"Deload",note:"Second deload. Body is adapting. Do not sabotage it.",longPts:15,deload:true},
    {focus:"Duration Push",note:"4 hours on feet with 30 lbs means summit day feels manageable.",longPts:50},
    {focus:"Overnight Prep",note:"Start planning your overnight backpack trip.",longPts:50},
    {focus:"Overnight Trip",note:"This trip tells you everything. How do you sleep at elevation?",longPts:60},
    {focus:"Recovery and Assessment",note:"4 weeks from the summit. The work is mostly done.",longPts:35},
    {focus:"Altitude Simulation",note:"Access any elevation above 8,000 ft for training if possible.",longPts:55},
    {focus:"Acclimatization",note:"Non-negotiable. 2-3 nights at elevation before going higher.",longPts:50},
    {focus:"Taper Begins",note:"Volume drops. You are not getting fitter — you are getting fresher.",longPts:35,deload:true},
    {focus:"SUMMIT WEEK",note:"On trail by 6am. Summit by 10am. Eat before hungry, drink before thirsty.",longPts:200,summit:true},
  ];
  return T.slice(0,totalWeeks).map((t,i)=>{
    const wk=i+1,phase=wk<=6?1:wk<=14?2:3;
    const pack=Math.min(packStart+Math.floor(wk/3)*5,35);
    const hike=Math.min(hikeStart+wk*3,90);
    const d=t.deload;
    return {
      week:wk,phase,focus:t.focus,note:t.note,isSummitWeek:!!t.summit,skipped:false,
      days:[
        {day:"MON",type:"rest",activity:"Rest or light 20-min walk.",pts:5},
        {day:"TUE",type:"training",activity:d?`Easy hike ${Math.round(hike*0.6)} min, no pack`:`Hike ${hike}-${hike+15} min + Strength circuit (step-ups, goblet squats, RDL)`,pts:d?10:15},
        {day:"WED",type:"rest",activity:"Mobility work, foam rolling, dead hangs.",pts:5},
        {day:"THU",type:"training",activity:d?`Easy hike ${Math.round(hike*0.6)} min`:`Hike ${hike} min with ${pack}lb pack + Posterior chain work`,pts:d?10:15},
        {day:"FRI",type:"rest",activity:"Full rest. Off your feet.",pts:5},
        {day:"SAT",type:"long",activity:t.summit?`SUMMIT DAY: ${summitName} — ${summitElevation.toLocaleString()} ft. On trail by 6am.`:d?`Easy hike ${hike+15} min, no pack`:`Long ruck/hike ${hike+30}-${hike+60} min with ${pack}lb pack. Find elevation.`,pts:t.longPts},
        {day:"SUN",type:"rest",activity:t.summit?"Rest. You did it. Log it. Remember this.":"Rest and stretch. Note energy and joint response.",pts:t.summit?10:5},
      ]
    };
  });
}

// ── SHARED UI ──────────────────────────────────────────────────────────────────

function Bar({pct, color, h}) {
  return (
    <div style={{background:"#1a2520",borderRadius:99,height:h||6,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${Math.min(pct||0,100)}%`,background:`linear-gradient(90deg,${(color||C.green)}88,${color||C.green})`,borderRadius:99,transition:"width 0.8s cubic-bezier(0.34,1.56,0.64,1)"}}/>
    </div>
  );
}

function Tag({children, color}) {
  return <span style={{fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:2,color:color||C.greenDim,display:"block"}}>{children}</span>;
}

function Card({children, style}) {
  return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 18px",...(style||{})}}>{children}</div>;
}

function Toggle({on, onToggle, label}) {
  return (
    <div onClick={onToggle} style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",padding:"12px 0"}}>
      <span style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:C.textDim}}>{label}</span>
      <div style={{width:40,height:22,borderRadius:99,background:on?C.green:"#1a2520",position:"relative",transition:"background 0.25s",flexShrink:0}}>
        <div style={{position:"absolute",top:3,left:on?20:3,width:16,height:16,borderRadius:99,background:"#fff",transition:"left 0.25s"}}/>
      </div>
    </div>
  );
}

function Toast({msg, onClose}) {
  useEffect(()=>{const t=setTimeout(onClose,3500);return()=>clearTimeout(t);},[onClose]);
  return (
    <div style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#1a2e1e,#0f1a12)",border:`1px solid ${C.green}`,borderRadius:12,padding:"12px 22px",color:C.green,fontFamily:"'Space Mono',monospace",fontSize:13,zIndex:9999,boxShadow:"0 8px 32px rgba(78,200,126,0.25)",animation:"slideUp 0.3s ease",whiteSpace:"nowrap"}}>
      {msg}
    </div>
  );
}

function AchPop({ids, onClose}) {
  useEffect(()=>{const t=setTimeout(onClose,4000);return()=>clearTimeout(t);},[onClose]);
  const ach=ACHIEVEMENTS.find(a=>a.id===ids[0]);
  if(!ach) return null;
  return (
    <div style={{position:"fixed",top:72,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#1a1205,#0f0a02)",border:`1px solid ${C.amber}`,borderRadius:16,padding:"18px 28px",zIndex:9998,textAlign:"center",animation:"popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",boxShadow:"0 8px 40px rgba(212,135,42,0.3)"}}>
      <div style={{fontSize:42,marginBottom:8}}>{ach.icon}</div>
      <Tag color={C.amber}>ACHIEVEMENT UNLOCKED</Tag>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:C.amber,letterSpacing:2,marginTop:4}}>{ach.name}</div>
    </div>
  );
}

// ── DISCLAIMER ─────────────────────────────────────────────────────────────────

function Disclaimer({onAccept, showAlcohol}) {
  const [read, setRead] = useState(false);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:C.card,border:`1px solid ${C.amber}`,borderRadius:20,maxWidth:480,width:"100%",maxHeight:"88vh",overflow:"hidden",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"18px 22px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:C.amber,letterSpacing:3}}>IMPORTANT DISCLAIMER</div>
        </div>
        <div style={{overflow:"auto",padding:"18px 22px",flex:1}} onScroll={e=>{const el=e.target;if(el.scrollHeight-el.scrollTop-el.clientHeight<50)setRead(true);}}>
          {showAlcohol && (
            <div style={{background:"#1a0808",border:"1px solid #8b2020",borderRadius:10,padding:"14px 16px",marginBottom:18}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#e05555",letterSpacing:2,marginBottom:8}}>ALCOHOL WITHDRAWAL WARNING</div>
              <p style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:"#c07070",lineHeight:1.8}}>If you drink heavily and regularly, abrupt cessation can be life-threatening. Symptoms including seizures can occur without medical supervision. Please consult a physician before quitting cold turkey. This app is not a substitute for clinical care.</p>
            </div>
          )}
          {[
            ["MEDICAL AND FITNESS","This app provides general fitness guidance only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Consult a qualified physician before starting any exercise program, especially if you have existing health conditions, injuries, or limitations. Stop activity immediately if you experience chest pain, severe shortness of breath, dizziness, or unusual pain."],
            ["MENTAL HEALTH AND ADDICTION","Summit is designed to support positive behavior change through physical activity. It is NOT a clinical treatment program for addiction or substance use disorder. If you are struggling with substance dependence, please seek support from a qualified healthcare provider. SAMHSA Helpline: 1-800-662-4357, free and confidential, 24/7. Crisis line: 988 Suicide and Crisis Lifeline."],
            ["OUTDOOR AND SUMMIT SAFETY","Mountain hiking carries inherent risk including weather changes, altitude sickness, falls, and injury. Always tell someone your plan and expected return time. Check weather before departing. Turn back if conditions deteriorate — the mountain will be there. Carry adequate water, food, navigation tools, and emergency supplies. This app does not replace formal mountaineering training."],
            ["ALTITUDE SICKNESS","Symptoms include headache, nausea, dizziness, and fatigue. Descent is always the correct treatment. Never ascend if you have symptoms. The acclimatization week reduces but does not eliminate risk."],
            ["YOUR PRIVACY","This app does not share your personal reasons for using it with anyone. Your habit, recovery progress, and personal notes are visible only to you and are never shown on leaderboards, crew views, or any shared screen unless you explicitly choose to share them."],
            ["DATA AND PRIVACY","All data is stored locally on your device. No personal data is transmitted to external servers in this version."],
          ].map(([title,body])=>(
            <div key={title} style={{marginBottom:18}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,color:C.green,letterSpacing:2,marginBottom:7}}>{title}</div>
              <p style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:C.textDim,lineHeight:1.8}}>{body}</p>
            </div>
          ))}
          <p style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:C.textFaint,lineHeight:1.8,marginTop:8}}>By continuing you acknowledge you have read and understood these disclaimers and accept full responsibility for your participation in any training or summit activities.</p>
          {!read && <p style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:C.amber,textAlign:"center",marginTop:12,animation:"pulse 2s infinite"}}>Scroll to read all</p>}
        </div>
        <div style={{padding:"14px 22px",borderTop:`1px solid ${C.border}`}}>
          <button onClick={onAccept} disabled={!read} style={{width:"100%",background:read?"linear-gradient(135deg,#1a3e20,#0f2016)":C.card,border:`1px solid ${read?C.green:C.border}`,borderRadius:12,padding:14,color:read?C.green:C.textFaint,fontFamily:"'Bebas Neue',sans-serif",fontSize:17,letterSpacing:3,cursor:read?"pointer":"not-allowed"}}>
            {read ? "I UNDERSTAND — CONTINUE" : "READ ALL TO CONTINUE"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ONBOARDING ─────────────────────────────────────────────────────────────────

function Onboarding({onComplete}) {
  const [step, setStep] = useState(-1);
  const [f, setF] = useState({name:"",city:"",state:"",trail:null,fitnessLevel:"intermediate",summitDate:"",habitPreset:null,customHabit:"",habitMode:"moderation",moderationLimit:3,taperWeeks:8,wantsGroup:false,crewName:"",crewCode:"",physicalNotes:""});
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const INP = {width:"100%",background:"#0c1510",border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 14px",color:C.text,fontFamily:"'Space Mono',monospace",fontSize:12,marginBottom:14};
  const BTN = (ok) => ({width:"100%",background:ok?"linear-gradient(135deg,#1a3e20,#0f2016)":C.card,border:`1px solid ${ok?C.green:C.border}`,borderRadius:12,padding:14,color:ok?C.green:C.textFaint,fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:3,cursor:ok?"pointer":"not-allowed"});
  const H = (t) => <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:3,color:C.green,marginBottom:6}}>{t}</div>;
  const Sub = (t) => <div style={{fontFamily:"'Space Mono',monospace",color:C.textFaint,fontSize:11,marginBottom:20,lineHeight:1.6}}>{t}</div>;
  const LBL = (t) => <div style={{fontFamily:"'Space Mono',monospace",color:C.greenDim,fontSize:9,letterSpacing:2,marginBottom:7}}>{t}</div>;

  if(step===-1) return <Disclaimer onAccept={()=>setStep(0)} showAlcohol={false}/>;

  const renderStep = () => {
    if(step===0) return (
      <div style={{padding:"28px 22px"}}>
        {H("WHO ARE YOU?")}
        {Sub("This is your mission. Start with your name.")}
        {LBL("YOUR NAME")}
        <input style={INP} placeholder="Name or trail alias" value={f.name} onChange={e=>set("name",e.target.value)}/>
        {LBL("PHYSICAL NOTES (optional)")}
        <textarea style={{...INP,resize:"none",height:72}} placeholder="Bad knees, asthma, previous injuries — anything to help adjust your plan" value={f.physicalNotes} onChange={e=>set("physicalNotes",e.target.value)}/>
        <button style={BTN(!!f.name.trim())} onClick={()=>f.name.trim()&&setStep(1)}>NEXT</button>
      </div>
    );
    if(step===1) return (
      <div style={{padding:"28px 22px"}}>
        {H("WHERE ARE YOU BASED?")}
        {Sub("We will find summits and training trails near you.")}
        {LBL("CITY OR REGION (optional)")}
        <input style={INP} placeholder="e.g. Asheville, Denver, Portland" value={f.city} onChange={e=>set("city",e.target.value)}/>
        {LBL("STATE")}
        <select style={INP} value={f.state} onChange={e=>set("state",e.target.value)}>
          <option value="">Select your state...</option>
          {US_STATES.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        {LBL("CURRENT FITNESS LEVEL")}
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
          {FITNESS_LEVELS.map(fl=>(
            <div key={fl.id} onClick={()=>set("fitnessLevel",fl.id)} style={{padding:"12px 14px",border:`1px solid ${f.fitnessLevel===fl.id?C.green:C.border}`,borderRadius:10,background:f.fitnessLevel===fl.id?"#0a1f12":C.card,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:22}}>{fl.icon}</span>
              <div>
                <div style={{color:C.text,fontFamily:"'Space Mono',monospace",fontSize:12}}>{fl.label}</div>
                <div style={{color:C.textFaint,fontFamily:"'Space Mono',monospace",fontSize:10,marginTop:2}}>{fl.desc}</div>
              </div>
            </div>
          ))}
        </div>
        {loading
          ? <div style={{textAlign:"center",color:C.green,fontFamily:"'Space Mono',monospace",letterSpacing:2,animation:"pulse 1.5s infinite"}}>SCANNING TERRAIN...</div>
          : <button style={BTN(!!f.state)} onClick={()=>{if(!f.state)return;setLoading(true);setTimeout(()=>{setTrails(SUMMITS[getRegion(f.state)]||[]);setLoading(false);setStep(2);},900);}}>FIND MY SUMMIT</button>
        }
      </div>
    );
    if(step===2) return (
      <div style={{padding:"28px 22px"}}>
        {H("CHOOSE YOUR SUMMIT")}
        {Sub("This is your target. Everything else is preparation.")}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
          {trails.map(t=>(
            <div key={t.name} onClick={()=>set("trail",t)} style={{padding:"13px 15px",border:`1px solid ${f.trail?.name===t.name?C.green:C.border}`,borderRadius:10,background:f.trail?.name===t.name?"#0a1f12":C.card,cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:17,color:C.text,letterSpacing:1}}>{t.image} {t.name}</div>
                  <div style={{color:C.textFaint,fontFamily:"'Space Mono',monospace",fontSize:10,marginTop:3}}>{t.state} · {t.distance} · +{t.gain.toLocaleString()}ft · {t.difficulty}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0,marginLeft:10}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:C.amber}}>{t.elevation.toLocaleString()}</div>
                  <div style={{color:C.textFaint,fontFamily:"'Space Mono',monospace",fontSize:9}}>FT</div>
                </div>
              </div>
              {f.trail?.name===t.name && <div style={{color:C.textFaint,fontFamily:"'Space Mono',monospace",fontSize:10,marginTop:8,fontStyle:"italic"}}>{t.note}</div>}
            </div>
          ))}
        </div>
        {LBL("OR ENTER A CUSTOM SUMMIT")}
        <input style={INP} placeholder="Summit name, e.g. My Local Peak" onChange={e=>{if(e.target.value.trim())set("trail",{name:e.target.value,elevation:4000,state:f.state,difficulty:"Moderate",distance:"TBD",gain:2000,image:"⛰️",note:"Custom summit — you know this mountain best."});}}/>
        {LBL("TARGET DATE (optional)")}
        <input type="date" style={INP} value={f.summitDate} onChange={e=>set("summitDate",e.target.value)}/>
        <button style={BTN(!!f.trail)} onClick={()=>f.trail&&setStep(3)}>SET THIS SUMMIT</button>
      </div>
    );
    if(step===3) return (
      <div style={{padding:"28px 22px"}}>
        {H("YOUR PERSONAL MISSION")}
        {Sub("What are you working on? This is private — only visible to you. Always.")}
        <div style={{background:"#0a1a10",border:`1px solid ${C.greenFaint}`,borderRadius:10,padding:"12px 14px",marginBottom:18}}>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:C.greenDim,lineHeight:1.8}}>
            🔒 Your reason for using this app is never shared with others. Crew members and the leaderboard only see your summit achievements and training stats.
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
          {HABIT_PRESETS.map(h=>(
            <div key={h.id} onClick={()=>set("habitPreset",h)} style={{padding:"12px 8px",border:`1px solid ${f.habitPreset?.id===h.id?C.amber:C.border}`,borderRadius:10,background:f.habitPreset?.id===h.id?C.amberDark:C.card,cursor:"pointer",textAlign:"center"}}>
              <div style={{fontSize:24,marginBottom:5}}>{h.id==="other"||h.id==="custom"?"🔒":h.icon}</div>
              <div style={{color:C.text,fontFamily:"'Space Mono',monospace",fontSize:10}}>{h.label}</div>
            </div>
          ))}
        </div>
        {f.habitPreset?.id==="custom" && <input style={INP} placeholder="Describe it in your own words..." value={f.customHabit} onChange={e=>set("customHabit",e.target.value)}/>}
        {f.habitPreset && (
          <div>
            {LBL("YOUR APPROACH")}
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
              {HABIT_MODES.map(m=>(
                <div key={m.id} onClick={()=>set("habitMode",m.id)} style={{padding:"11px 13px",border:`1px solid ${f.habitMode===m.id?C.amber:C.border}`,borderRadius:10,background:f.habitMode===m.id?C.amberDark:C.card,cursor:"pointer",display:"flex",gap:10,alignItems:"center"}}>
                  <span style={{fontSize:18}}>{m.icon}</span>
                  <div>
                    <div style={{color:C.text,fontFamily:"'Space Mono',monospace",fontSize:11}}>{m.label}</div>
                    <div style={{color:C.textFaint,fontFamily:"'Space Mono',monospace",fontSize:10,marginTop:2}}>{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            {f.habitMode==="moderation" && (
              <div style={{marginBottom:16}}>
                {LBL("DAYS ALLOWED PER WEEK")}
                <div style={{display:"flex",gap:8}}>
                  {[1,2,3,4,5].map(n=>(
                    <div key={n} onClick={()=>set("moderationLimit",n)} style={{flex:1,padding:"9px 0",border:`1px solid ${f.moderationLimit===n?C.amber:C.border}`,borderRadius:8,background:f.moderationLimit===n?C.amberDark:C.card,cursor:"pointer",textAlign:"center",color:f.moderationLimit===n?C.amber:C.textDim,fontFamily:"'Bebas Neue',sans-serif",fontSize:18}}>{n}</div>
                  ))}
                </div>
              </div>
            )}
            {f.habitMode==="taper" && (
              <div style={{marginBottom:16}}>
                {LBL("WEEKS TO QUIT")}
                <div style={{display:"flex",gap:8}}>
                  {[4,6,8,12].map(n=>(
                    <div key={n} onClick={()=>set("taperWeeks",n)} style={{flex:1,padding:"9px 0",border:`1px solid ${f.taperWeeks===n?C.amber:C.border}`,borderRadius:8,background:f.taperWeeks===n?C.amberDark:C.card,cursor:"pointer",textAlign:"center",color:f.taperWeeks===n?C.amber:C.textDim,fontFamily:"'Bebas Neue',sans-serif",fontSize:18}}>{n}w</div>
                  ))}
                </div>
              </div>
            )}
            {f.habitMode==="quit" && f.habitPreset?.id==="alcohol" && (
              <div style={{background:"#1a0808",border:"1px solid #8b2020",borderRadius:10,padding:"12px 14px",marginBottom:14}}>
                <p style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:"#e07070",lineHeight:1.8}}>Quitting alcohol abruptly can be dangerous. Please consult a doctor first. SAMHSA: 1-800-662-4357</p>
              </div>
            )}
          </div>
        )}
        <button style={BTN(!!f.habitPreset&&(f.habitPreset.id!=="custom"||!!f.customHabit.trim()))} onClick={()=>f.habitPreset&&setStep(4)}>SET MY MISSION</button>
      </div>
    );
    if(step===4) return (
      <div style={{padding:"28px 22px"}}>
        {H("SUMMIT WITH A CREW?")}
        {Sub("Accountability multiplies results. Fully optional.")}
        <div style={{display:"flex",gap:10,marginBottom:18}}>
          {[{v:false,l:"SOLO MISSION",ic:"🧍"},{v:true,l:"GROUP SUMMIT",ic:"👥"}].map(o=>(
            <div key={String(o.v)} onClick={()=>set("wantsGroup",o.v)} style={{flex:1,padding:"14px 8px",border:`1px solid ${f.wantsGroup===o.v?C.green:C.border}`,borderRadius:10,background:f.wantsGroup===o.v?"#0a1f12":C.card,cursor:"pointer",textAlign:"center"}}>
              <div style={{fontSize:26,marginBottom:7}}>{o.ic}</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,letterSpacing:2,color:f.wantsGroup===o.v?C.green:C.textDim}}>{o.l}</div>
            </div>
          ))}
        </div>
        {f.wantsGroup && (
          <div>
            {LBL("CREW NAME")}
            <input style={INP} placeholder="e.g. Trail Rats, Sniktau Squad..." value={f.crewName} onChange={e=>set("crewName",e.target.value)}/>
            {LBL("INVITE CODE")}
            <input style={INP} placeholder="Create a code your crew will use" value={f.crewCode} onChange={e=>set("crewCode",e.target.value)}/>
            <div style={{background:C.cardDark,border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 13px",marginBottom:14}}>
              <p style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:C.textFaint,lineHeight:1.7}}>Crew members see only your training points and summit achievements. Your personal mission stays private. Live crew sync coming in v1.0.</p>
            </div>
          </div>
        )}
        <button style={BTN(true)} onClick={()=>setStep(5)}>{f.wantsGroup&&f.crewName?"SET UP CREW":"GO SOLO"}</button>
      </div>
    );
    if(step===5) {
      const habit = f.habitPreset?.id==="custom" ? {...f.habitPreset,label:f.customHabit,nightLabel:`${f.customHabit}-free day`} : f.habitPreset;
      const region = getRegion(f.state);
      const weeks = f.summitDate ? Math.max(8,Math.min(26,Math.round((new Date(f.summitDate)-new Date())/(7*86400000)))) : 18;
      const plan = generatePlan(f.trail.name,f.trail.elevation,f.fitnessLevel,weeks);
      const crew = f.wantsGroup&&f.crewName ? {name:f.crewName,code:f.crewCode,members:[{name:f.name,pts:0,isYou:true}]} : null;
      const newData = {name:f.name,city:f.city,state:f.state,region,trail:f.trail,fitnessLevel:f.fitnessLevel,summitDate:f.summitDate,habit,habitMode:f.habitMode,moderationLimit:f.moderationLimit,taperWeeks:f.taperWeeks,physicalNotes:f.physicalNotes,crew,plan,points:0,achievements:[],cleanLog:{},journal:{},completed:{},streak:0,shareRecovery:false,startDate:new Date().toISOString()};
      return (
        <div style={{padding:"28px 22px"}}>
          <div style={{textAlign:"center",marginBottom:22}}>
            <div style={{fontSize:58,marginBottom:10}}>{f.trail?.image||"⛰️"}</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,color:C.green,letterSpacing:3}}>MISSION LOCKED</div>
            <div style={{fontFamily:"'Space Mono',monospace",color:C.amber,fontSize:12,letterSpacing:2,marginTop:4}}>{f.trail?.name?.toUpperCase()} — {f.trail?.elevation?.toLocaleString()} FT</div>
          </div>
          <Card style={{marginBottom:22}}>
            {[["OPERATIVE",f.name],["BASED IN",`${f.city?f.city+", ":""}${f.state}`],["TARGET PEAK",f.trail?.name],["ELEVATION",`${f.trail?.elevation?.toLocaleString()} ft`],["FITNESS",f.fitnessLevel],["SUMMIT DATE",f.summitDate||"TBD"],["PERSONAL MISSION","Private — visible only to you"],["SQUAD",f.wantsGroup&&f.crewName?f.crewName:"Solo"]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #0f2018"}}>
                <Tag color={C.textFaint}>{k}</Tag>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:k==="PERSONAL MISSION"?"#3d6b4a":C.text}}>{v}</div>
              </div>
            ))}
          </Card>
          <button style={BTN(true)} onClick={()=>onComplete(newData)}>START THE MISSION</button>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:480,background:`linear-gradient(160deg,#0c1510,${C.bg})`,border:`1px solid ${C.border}`,borderRadius:20,overflow:"hidden"}}>
        <div style={{padding:"12px 20px 0",display:"flex",gap:5}}>
          {[0,1,2,3,4,5].map(i=><div key={i} style={{flex:1,height:3,borderRadius:99,background:i<=step?C.green:C.border,transition:"background 0.4s"}}/>)}
        </div>
        <div key={step} style={{animation:"fadeIn 0.25s ease"}}>{renderStep()}</div>
      </div>
    </div>
  );
}

// ── SETTINGS ───────────────────────────────────────────────────────────────────

function Settings({data, onUpdate, onReset, onClose}) {
  const [sub, setSub] = useState(null);
  const [lf, setLf] = useState({name:data.name,city:data.city||"",state:data.state||""});
  const [hp, setHp] = useState(data.habit);
  const [hm, setHm] = useState(data.habitMode||"moderation");
  const INP = {width:"100%",background:"#0c1510",border:`1px solid ${C.border}`,borderRadius:10,padding:"11px 14px",color:C.text,fontFamily:"'Space Mono',monospace",fontSize:12,marginBottom:14};
  const SAV = {width:"100%",background:"linear-gradient(135deg,#1a3e20,#0f2016)",border:`1px solid ${C.green}`,borderRadius:12,padding:14,color:C.green,fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:3};
  const LBL = (t) => <div style={{fontFamily:"'Space Mono',monospace",color:C.greenDim,fontSize:9,letterSpacing:2,marginBottom:7}}>{t}</div>;

  if(sub==="disclaimer") return (
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div style={{padding:"18px 16px"}}>
        <button onClick={()=>setSub(null)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 11px",color:C.textFaint,fontFamily:"'Space Mono',monospace",fontSize:11}}>BACK</button>
      </div>
      <Disclaimer onAccept={()=>setSub(null)} showAlcohol={false}/>
    </div>
  );

  if(sub==="location") return (
    <div style={{minHeight:"100vh",background:C.bg,paddingBottom:100}}>
      <div style={{padding:"18px 16px 10px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>setSub(null)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 11px",color:C.textFaint,fontFamily:"'Space Mono',monospace",fontSize:11}}>BACK</button>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:C.green,letterSpacing:3}}>LOCATION AND NAME</div>
      </div>
      <div style={{padding:"0 16px"}}>
        {LBL("YOUR NAME")}<input style={INP} value={lf.name} onChange={e=>setLf(p=>({...p,name:e.target.value}))}/>
        {LBL("CITY OR REGION")}<input style={INP} value={lf.city} onChange={e=>setLf(p=>({...p,city:e.target.value}))}/>
        {LBL("STATE")}
        <select style={INP} value={lf.state} onChange={e=>setLf(p=>({...p,state:e.target.value}))}>
          {US_STATES.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <button style={SAV} onClick={()=>{onUpdate({...data,name:lf.name,city:lf.city,state:lf.state,region:getRegion(lf.state)});setSub(null);}}>SAVE CHANGES</button>
      </div>
    </div>
  );

  if(sub==="summit") {
    const tlist = SUMMITS[getRegion(lf.state||data.state)]||[];
    return (
      <div style={{minHeight:"100vh",background:C.bg,paddingBottom:100}}>
        <div style={{padding:"18px 16px 10px",display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>setSub(null)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 11px",color:C.textFaint,fontFamily:"'Space Mono',monospace",fontSize:11}}>BACK</button>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:C.green,letterSpacing:3}}>CHANGE SUMMIT</div>
        </div>
        <div style={{padding:"0 16px"}}>
          <div style={{background:"#1a0f08",border:`1px solid ${C.amberMid}`,borderRadius:10,padding:"11px 13px",marginBottom:14}}>
            <p style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:"#9a6030",lineHeight:1.7}}>Changing your summit will regenerate your training plan. Your points and achievements are preserved.</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {tlist.map(t=>(
              <div key={t.name} onClick={()=>{if(!window.confirm(`Switch to ${t.name}? Plan will regenerate.`))return;const weeks=data.summitDate?Math.max(8,Math.min(26,Math.round((new Date(data.summitDate)-new Date())/(7*86400000)))):18;onUpdate({...data,trail:t,plan:generatePlan(t.name,t.elevation,data.fitnessLevel,weeks),completed:{}});setSub(null);}} style={{padding:"13px 15px",border:`1px solid ${data.trail?.name===t.name?C.green:C.border}`,borderRadius:10,background:data.trail?.name===t.name?"#0a1f12":C.card,cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <div>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:C.text,letterSpacing:1}}>{t.image} {t.name}</div>
                    <div style={{color:C.textFaint,fontFamily:"'Space Mono',monospace",fontSize:10,marginTop:3}}>{t.state} · {t.distance} · {t.difficulty}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:19,color:C.amber}}>{t.elevation.toLocaleString()}</div>
                    <div style={{color:C.textFaint,fontFamily:"'Space Mono',monospace",fontSize:9}}>FT</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if(sub==="habit") return (
    <div style={{minHeight:"100vh",background:C.bg,paddingBottom:100}}>
      <div style={{padding:"18px 16px 10px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>setSub(null)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 11px",color:C.textFaint,fontFamily:"'Space Mono',monospace",fontSize:11}}>BACK</button>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:C.green,letterSpacing:3}}>PERSONAL MISSION</div>
      </div>
      <div style={{padding:"0 16px"}}>
        <div style={{background:"#0a1a10",border:`1px solid ${C.greenFaint}`,borderRadius:10,padding:"11px 13px",marginBottom:14}}>
          <p style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:C.greenDim,lineHeight:1.7}}>🔒 Your personal mission is never visible to others.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
          {HABIT_PRESETS.map(h=>(
            <div key={h.id} onClick={()=>setHp(h)} style={{padding:"11px 7px",border:`1px solid ${hp?.id===h.id?C.amber:C.border}`,borderRadius:10,background:hp?.id===h.id?C.amberDark:C.card,cursor:"pointer",textAlign:"center"}}>
              <div style={{fontSize:22,marginBottom:5}}>{h.id==="other"||h.id==="custom"?"🔒":h.icon}</div>
              <div style={{color:C.text,fontFamily:"'Space Mono',monospace",fontSize:10}}>{h.label}</div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
          {HABIT_MODES.map(m=>(
            <div key={m.id} onClick={()=>setHm(m.id)} style={{padding:"11px 13px",border:`1px solid ${hm===m.id?C.amber:C.border}`,borderRadius:10,background:hm===m.id?C.amberDark:C.card,cursor:"pointer",display:"flex",gap:10,alignItems:"center"}}>
              <span style={{fontSize:18}}>{m.icon}</span>
              <div>
                <div style={{color:C.text,fontFamily:"'Space Mono',monospace",fontSize:11}}>{m.label}</div>
                <div style={{color:C.textFaint,fontFamily:"'Space Mono',monospace",fontSize:10}}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
        {hm==="quit"&&hp?.id==="alcohol" && (
          <div style={{background:"#1a0808",border:"1px solid #8b2020",borderRadius:10,padding:"12px 14px",marginBottom:14}}>
            <p style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:"#e07070",lineHeight:1.8}}>Quitting alcohol abruptly can be dangerous. Please consult a doctor. SAMHSA: 1-800-662-4357</p>
          </div>
        )}
        <button style={SAV} onClick={()=>{if(hp)onUpdate({...data,habit:hp,habitMode:hm});setSub(null);}}>SAVE CHANGES</button>
      </div>
    </div>
  );

  if(sub==="privacy") return (
    <div style={{minHeight:"100vh",background:C.bg,paddingBottom:100}}>
      <div style={{padding:"18px 16px 10px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>setSub(null)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 11px",color:C.textFaint,fontFamily:"'Space Mono',monospace",fontSize:11}}>BACK</button>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:C.green,letterSpacing:3}}>PRIVACY</div>
      </div>
      <div style={{padding:"0 16px"}}>
        <div style={{background:"#0a1a10",border:`1px solid ${C.greenFaint}`,borderRadius:10,padding:"14px 16px",marginBottom:20}}>
          <p style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:C.greenDim,lineHeight:1.8}}>By default, only your summit and training achievements are public. Your personal mission and recovery progress are completely private.</p>
        </div>
        <Card style={{marginBottom:16}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:C.text,letterSpacing:1,marginBottom:4}}>ALWAYS PUBLIC</div>
          {["Summit completions","Training points and level","Weeks complete","Training streak","Summit track achievements"].map(item=>(
            <div key={item} style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:C.textFaint,padding:"5px 0",borderBottom:`1px solid ${C.border}`}}>✓ {item}</div>
          ))}
        </Card>
        <Card style={{marginBottom:20}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:C.amber,letterSpacing:1,marginBottom:4}}>YOUR CHOICE TO SHARE</div>
          <Toggle
            on={data.shareRecovery||false}
            onToggle={()=>onUpdate({...data,shareRecovery:!data.shareRecovery})}
            label="Share my recovery progress with crew and leaderboard"
          />
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:C.textFaint,lineHeight:1.7,marginTop:8}}>When on, your clean day count and recovery achievements are visible to others. When off, only you can see them.</div>
        </Card>
        <button style={SAV} onClick={()=>setSub(null)}>DONE</button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,paddingBottom:100}}>
      <div style={{padding:"18px 16px 10px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onClose} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 11px",color:C.textFaint,fontFamily:"'Space Mono',monospace",fontSize:11}}>BACK</button>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:C.green,letterSpacing:3}}>SETTINGS</div>
      </div>
      <div style={{padding:"0 16px"}}>
        {[
          {icon:"📍",label:"Location and Name",sub:`${data.city?data.city+", ":""}${data.state}`,action:()=>setSub("location")},
          {icon:"⛰️",label:"Target Summit",sub:data.trail?.name,action:()=>setSub("summit")},
          {icon:"🔒",label:"Personal Mission",sub:"Your private habit goal — never shared",action:()=>setSub("habit")},
          {icon:"👁️",label:"Privacy Controls",sub:data.shareRecovery?"Sharing recovery progress":"Recovery progress is private",action:()=>setSub("privacy")},
          {icon:"⚠️",label:"Disclaimers and Safety",sub:"Health, safety and legal notices",action:()=>setSub("disclaimer")},
          {icon:"💀",label:"Reset All Data",sub:"Wipe everything and start over",action:onReset,danger:true},
        ].map((r,i)=>(
          <div key={i} onClick={r.action} style={{display:"flex",alignItems:"center",gap:14,padding:"15px 17px",background:C.card,border:`1px solid ${r.danger?"#3d1515":C.border}`,borderRadius:12,marginBottom:10,cursor:"pointer"}}>
            <span style={{fontSize:22}}>{r.icon}</span>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:13,color:r.danger?"#e05555":C.text}}>{r.label}</div>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:C.textFaint,marginTop:3}}>{r.sub}</div>
            </div>
            <div style={{color:C.textFaint,fontSize:16}}>›</div>
          </div>
        ))}
        <div style={{textAlign:"center",marginTop:28}}>
          <Tag color={C.textGhost}>SUMMIT APP · V1.0 · 2026</Tag>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:C.textGhost,marginTop:6}}>Made for the mountains. Made for the long game.</div>
        </div>
      </div>
    </div>
  );
}

// ── TAB COMPONENTS ─────────────────────────────────────────────────────────────

function HomeTab({data, stats, level, nextLevel, todayClean, currentWeek, toggleClean}) {
  return (
    <div style={{padding:"18px 16px",paddingBottom:100}}>
      <div style={{background:"linear-gradient(135deg,#0a1f12,#051008)",border:"1px solid #1a3022",borderRadius:16,padding:"20px 18px",marginBottom:13,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-10,right:-10,fontSize:84,opacity:0.06}}>{data.trail?.image}</div>
        <Tag color={C.textFaint}>TARGET SUMMIT</Tag>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:2,color:C.green,lineHeight:1,marginTop:4}}>{data.trail?.name}</div>
        <div style={{fontFamily:"'Space Mono',monospace",color:C.amber,fontSize:12,marginTop:4,marginBottom:16}}>{data.trail?.elevation?.toLocaleString()} FT · {data.trail?.state}</div>
        <Bar pct={stats.pct}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
          <Tag color={C.textFaint}>BASE CAMP</Tag>
          <Tag color={C.green}>{stats.pct}% COMPLETE</Tag>
          <Tag color={C.amber}>SUMMIT</Tag>
        </div>
      </div>
      <Card style={{marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <Tag color={C.textFaint}>OPERATIVE LEVEL</Tag>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:23,color:level.color,letterSpacing:1,marginTop:4}}>{level.icon} {level.name}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:C.amber}}>{data.points}</div>
            <Tag color={C.textFaint}>POINTS</Tag>
          </div>
        </div>
        {nextLevel && (
          <div>
            <Bar pct={Math.round(((data.points-level.min)/(nextLevel.min-level.min))*100)} color={nextLevel.color} h={4}/>
            <div style={{fontFamily:"'Space Mono',monospace",color:C.textFaint,fontSize:10,marginTop:5}}>{nextLevel.min-data.points} pts to {nextLevel.icon} {nextLevel.name}</div>
          </div>
        )}
      </Card>
      {currentWeek && (
        <Card style={{marginBottom:12}}>
          <Tag color={C.textFaint}>CURRENT WEEK</Tag>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:C.text,letterSpacing:1,marginTop:4,marginBottom:6}}>WK {currentWeek.week}: {currentWeek.focus}</div>
          <div style={{color:C.textFaint,fontFamily:"'Libre Baskerville',serif",fontSize:12,fontStyle:"italic",lineHeight:1.6,marginBottom:10}}>{currentWeek.note}</div>
          <Bar pct={Math.round((currentWeek.days.filter((_,di)=>data.completed?.[`${currentWeek.week}-${di}`]).length/currentWeek.days.length)*100)} h={4}/>
          <div style={{fontFamily:"'Space Mono',monospace",color:C.textFaint,fontSize:10,marginTop:5}}>{currentWeek.days.filter((_,di)=>data.completed?.[`${currentWeek.week}-${di}`]).length}/{currentWeek.days.length} days done</div>
        </Card>
      )}
      <div onClick={toggleClean} style={{background:todayClean?"linear-gradient(135deg,#0f2518,#051008)":"linear-gradient(135deg,#1a1205,#100a05)",border:`1px solid ${todayClean?"#2a5e3a":"#3d2810"}`,borderRadius:14,padding:"15px 17px",marginBottom:12,cursor:"pointer"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <Tag color={todayClean?C.textFaint:"#5a3820"}>MY PERSONAL MISSION — {data.habitMode==="moderation"?"MODERATION":data.habitMode==="taper"?"TAPERING":"FULL QUIT"}</Tag>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:19,color:todayClean?C.green:C.amber,letterSpacing:1,marginTop:4}}>{todayClean?`LOGGED: ${(data.habit?.nightLabel||"CLEAN DAY").toUpperCase()}`:`LOG ${(data.habit?.nightLabel||"CLEAN DAY").toUpperCase()}`}</div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:todayClean?C.textFaint:"#5a3820",marginTop:3}}>
              {data.habitMode==="moderation" && `Limit: ${data.moderationLimit||3}x/wk · ${stats.totalCleanDays} days toward goal`}
              {data.habitMode==="quit" && `${stats.totalCleanDays} days · streak: ${data.streak||0}`}
              {data.habitMode==="taper" && `Tapering toward quit · ${stats.totalCleanDays} days logged`}
            </div>
          </div>
          <div style={{fontSize:32}}>{todayClean?"🔒":data.habit?.id==="alcohol"?"🍺":data.habit?.id==="smoking"?"🚬":data.habit?.id==="cannabis"?"🌿":data.habit?.id==="screens"?"📱":data.habit?.id==="gambling"?"🎲":data.habit?.id==="food"?"🍔":"🔒"}</div>
        </div>
      </div>
      {data.crew && (
        <Card style={{marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <Tag color={C.textFaint}>YOUR CREW</Tag>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:19,color:C.green,letterSpacing:1,marginTop:4}}>👥 {data.crew.name}</div>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:C.textFaint,marginTop:3}}>Invite code: {data.crew.code}</div>
            </div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:C.amber}}>{data.crew.members?.length||1}</div>
          </div>
        </Card>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[{l:"MISSION DAYS",v:stats.totalCleanDays,ic:"🔒",c:C.green},{l:"TRAINING DONE",v:stats.totalDone,ic:"✓",c:C.green},{l:"WEEKS",v:stats.weeksComplete,ic:"📅",c:C.amber},{l:"MEDALS",v:`${(data.achievements||[]).length}/${ACHIEVEMENTS.length}`,ic:"🏅",c:C.amber}].map(x=>(
          <Card key={x.l}>
            <Tag color={C.textFaint}>{x.l}</Tag>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:x.c,marginTop:4}}>{x.ic} {x.v}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TrainingTab({data, expandedWeek, setExpandedWeek, toggleDay, skipWeek, jDraft, setJDraft, saveJournal}) {
  return (
    <div style={{padding:"18px 16px",paddingBottom:100}}>
      {[1,2,3].map(phase=>{
        const phWeeks = data.plan.filter(w=>w.phase===phase);
        const names = ["BASE BUILDING","LOAD TOLERANCE","SUMMIT PREP"];
        return (
          <div key={phase} style={{marginBottom:22}}>
            <Tag color={C.textFaint}>PHASE {phase}: {names[phase-1]}</Tag>
            <div style={{height:8}}/>
            {phWeeks.map(week=>{
              const done = week.days.filter((_,di)=>data.completed?.[`${week.week}-${di}`]).length;
              const all = done===week.days.length;
              const open = expandedWeek===week.week;
              return (
                <div key={week.week} style={{marginBottom:8}}>
                  <div onClick={()=>setExpandedWeek(open?null:week.week)} style={{background:week.skipped?"#0f0f0a":all?"#0a1f12":C.card,border:`1px solid ${week.skipped?"#3a3a20":all?C.greenMid:C.border}`,borderRadius:open?"12px 12px 0 0":12,padding:"12px 15px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontFamily:"'Space Mono',monospace",color:week.skipped?"#7a7a40":all?C.green:C.text,fontSize:11}}>{all?"✓ ":week.skipped?"⏭ ":""}WK {week.week}: {week.focus}</div>
                      <div style={{fontFamily:"'Space Mono',monospace",color:C.textFaint,fontSize:10,marginTop:3}}>{week.skipped?"Skipped":`${done}/${week.days.length} days`}</div>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      {!all&&!week.skipped && <button onClick={e=>{e.stopPropagation();skipWeek(week.week);}} style={{background:"none",border:"1px solid #3a3a20",borderRadius:6,padding:"3px 7px",color:"#7a7a40",fontFamily:"'Space Mono',monospace",fontSize:9}}>SKIP</button>}
                      <div style={{color:C.amber,fontFamily:"'Bebas Neue',sans-serif",fontSize:13}}>{open?"▲":"▼"}</div>
                    </div>
                  </div>
                  {open && (
                    <div style={{background:"#080e0a",border:`1px solid ${C.border}`,borderTop:"none",borderRadius:"0 0 12px 12px",overflow:"hidden"}}>
                      <div style={{padding:"10px 15px",borderBottom:"1px solid #0f1a12"}}>
                        <div style={{color:C.textFaint,fontFamily:"'Libre Baskerville',serif",fontSize:12,fontStyle:"italic",lineHeight:1.6}}>{week.note}</div>
                      </div>
                      {week.days.map((day,di)=>{
                        const key = `${week.week}-${di}`;
                        const isDone = !!data.completed?.[key];
                        const tc = day.type==="rest"?"#3d5045":day.type==="training"?C.green:C.amber;
                        const jSaved = data.journal?.[key];
                        const jd = jDraft[key];
                        return (
                          <div key={di}>
                            <div onClick={()=>toggleDay(week.week,di)} style={{display:"flex",alignItems:"center",gap:11,padding:"11px 15px",cursor:"pointer",background:isDone?"#0a1810":"transparent",borderBottom:"1px solid #0f1a12",transition:"background 0.15s"}}>
                              <div style={{width:30,height:30,borderRadius:7,flexShrink:0,background:isDone?"#1a3e20":"#111a14",border:`1px solid ${isDone?C.green:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:isDone?C.green:tc,fontSize:12}}>{isDone?"✓":day.day.slice(0,2)}</div>
                              <div style={{flex:1}}>
                                <div style={{color:isDone?C.textFaint:C.textDim,fontFamily:"'Space Mono',monospace",fontSize:11,lineHeight:1.5}}>{day.activity}</div>
                                <div style={{color:tc,fontFamily:"'Space Mono',monospace",fontSize:10,marginTop:2}}>{day.type.toUpperCase()} · +{day.pts} PTS</div>
                              </div>
                            </div>
                            {isDone && (
                              <div style={{padding:"9px 15px",background:"#060c08",borderBottom:"1px solid #0f1a12"}}>
                                {jSaved&&jd==null && <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:11,color:C.textFaint,fontStyle:"italic",lineHeight:1.6,marginBottom:6}}>📓 {jSaved}</div>}
                                <textarea placeholder="Add a session note... (optional)" value={jd!=null?jd:jSaved||""} onChange={e=>setJDraft(j=>({...j,[key]:e.target.value}))} style={{width:"100%",background:"#0c1510",border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 11px",color:C.textDim,fontFamily:"'Space Mono',monospace",fontSize:11,resize:"none",height:56,outline:"none"}}/>
                                {jd!=null && <button onClick={()=>saveJournal(week.week,di,jd)} style={{marginTop:5,background:"none",border:`1px solid ${C.green}`,borderRadius:6,padding:"3px 11px",color:C.green,fontFamily:"'Space Mono',monospace",fontSize:10}}>SAVE NOTE</button>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function TrailsTab({data, currentPhase, trainingTrails}) {
  const phaseTrails = trainingTrails.filter(t=>t.phase.includes(currentPhase));
  return (
    <div style={{padding:"18px 16px",paddingBottom:100}}>
      <Card style={{marginBottom:18}}>
        <Tag color={C.textFaint}>YOUR TRAINING GROUND</Tag>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:C.green,letterSpacing:1,marginTop:4}}>{data.city?`${data.city}, `:""}{data.state}</div>
        <div style={{fontFamily:"'Space Mono',monospace",color:C.textFaint,fontSize:10,marginTop:4}}>Phase {currentPhase} — {["BASE BUILDING","LOAD TOLERANCE","SUMMIT PREP"][currentPhase-1]}</div>
      </Card>
      {phaseTrails.length>0 && (
        <div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:12,letterSpacing:3,color:C.textFaint,marginBottom:10}}>RECOMMENDED FOR PHASE {currentPhase}</div>
          {phaseTrails.map((t,i)=>(
            <div key={i} style={{background:C.card,border:`1px solid ${C.greenFaint}`,borderRadius:12,padding:"13px 15px",marginBottom:10}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:17,color:C.text,letterSpacing:1,marginBottom:4}}>{t.image} {t.name}</div>
              <div style={{color:C.textFaint,fontFamily:"'Space Mono',monospace",fontSize:10,marginBottom:8}}>{t.state} · {t.distance} · +{t.gain.toLocaleString()}ft · {t.difficulty}</div>
              <div style={{background:"#0a1f12",borderRadius:8,padding:"7px 11px"}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:C.greenDim,lineHeight:1.6}}>💡 {t.why}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:12,letterSpacing:3,color:C.textFaint,marginBottom:10,marginTop:18}}>ALL REGIONAL TRAILS</div>
      {trainingTrails.map((t,i)=>(
        <div key={i} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 15px",marginBottom:8,opacity:t.phase.includes(currentPhase)?1:0.55}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:C.text,letterSpacing:1}}>{t.image} {t.name}</div>
              <div style={{color:C.textFaint,fontFamily:"'Space Mono',monospace",fontSize:10,marginTop:3}}>{t.state} · {t.distance} · +{t.gain.toLocaleString()}ft · {t.difficulty}</div>
            </div>
            <div style={{background:"#0a1510",borderRadius:6,padding:"3px 8px",flexShrink:0,marginLeft:8}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:C.textFaint}}>PH {t.phase.join(",")}</div>
            </div>
          </div>
        </div>
      ))}
      <Card style={{marginTop:18}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:C.green,letterSpacing:2,marginBottom:8}}>TARGET SUMMIT</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:C.text}}>{data.trail?.image} {data.trail?.name}</div>
            <div style={{color:C.textFaint,fontFamily:"'Space Mono',monospace",fontSize:10,marginTop:4,lineHeight:1.6}}>{data.trail?.note}</div>
          </div>
          <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:C.amber}}>{data.trail?.elevation?.toLocaleString()}</div>
            <Tag color={C.textFaint}>FEET</Tag>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AchievementsTab({data}) {
  const summitAchs = ACHIEVEMENTS.filter(a=>a.track==="summit");
  const recoveryAchs = ACHIEVEMENTS.filter(a=>a.track==="recovery");
  return (
    <div style={{padding:"18px 16px",paddingBottom:100}}>
      <div style={{marginBottom:18}}>
        <Tag color={C.textFaint}>OPERATIVE RANK</Tag>
        <div style={{marginTop:8,display:"flex",gap:7,overflowX:"auto",paddingBottom:4}}>
          {LEVELS.map(lv=>(
            <div key={lv.level} style={{flexShrink:0,background:data.points>=lv.min?"#0a1f12":C.card,border:`1px solid ${data.points>=lv.min?C.greenMid:C.border}`,borderRadius:10,padding:"9px 11px",textAlign:"center",minWidth:75}}>
              <div style={{fontSize:19}}>{lv.icon}</div>
              <div style={{color:data.points>=lv.min?lv.color:C.textGhost,fontFamily:"'Space Mono',monospace",fontSize:8,marginTop:4}}>{lv.name}</div>
              <div style={{color:C.textGhost,fontFamily:"'Space Mono',monospace",fontSize:7,marginTop:2}}>{lv.min}pts</div>
            </div>
          ))}
        </div>
      </div>

      <Tag color={C.textFaint}>SUMMIT TRACK — ALWAYS PUBLIC</Tag>
      <div style={{height:10}}/>
      {summitAchs.map(ach=>{
        const unlocked = (data.achievements||[]).includes(ach.id);
        return (
          <div key={ach.id} style={{background:unlocked?"#0f1a08":C.card,border:`1px solid ${unlocked?"#2a4a15":C.border}`,borderRadius:12,padding:"12px 15px",marginBottom:8,display:"flex",alignItems:"center",gap:13,opacity:unlocked?1:0.45}}>
            <div style={{fontSize:28}}>{ach.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:unlocked?C.amber:C.textFaint,letterSpacing:1}}>{ach.name}</div>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:unlocked?C.textFaint:C.textGhost,marginTop:2}}>{ach.desc}</div>
            </div>
            {unlocked && <div style={{color:C.green,fontSize:15}}>✓</div>}
          </div>
        );
      })}

      <div style={{height:20}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <Tag color={C.textFaint}>RECOVERY TRACK — PRIVATE</Tag>
        <div style={{background:"#0a1510",borderRadius:6,padding:"3px 10px"}}>
          <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:C.textFaint}}>🔒 {data.shareRecovery?"SHARING":"ONLY YOU"}</div>
        </div>
      </div>
      <div style={{background:"#0a1a10",border:`1px solid ${C.greenFaint}`,borderRadius:10,padding:"11px 13px",marginBottom:14}}>
        <p style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:C.greenDim,lineHeight:1.7}}>These achievements are yours alone. Change visibility anytime in Settings → Privacy Controls.</p>
      </div>
      {recoveryAchs.map(ach=>{
        const unlocked = (data.achievements||[]).includes(ach.id);
        return (
          <div key={ach.id} style={{background:unlocked?"#1a1205":C.card,border:`1px solid ${unlocked?"#4a3010":C.border}`,borderRadius:12,padding:"12px 15px",marginBottom:8,display:"flex",alignItems:"center",gap:13,opacity:unlocked?1:0.45}}>
            <div style={{fontSize:28}}>{ach.icon}</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:unlocked?C.amber:C.textFaint,letterSpacing:1}}>{ach.name}</div>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:unlocked?C.textFaint:C.textGhost,marginTop:2}}>{ach.desc}</div>
            </div>
            {unlocked && <div style={{color:C.amber,fontSize:15}}>✓</div>}
          </div>
        );
      })}
    </div>
  );
}

function LeaderboardTab({data, level, stats}) {
  const mock = [
    {name:"TrailBlazer_K",level:"Peak Bagger",pts:2340,summit:"Mt. Rainier",emoji:"🦅",streak:22,summits:2},
    {name:"HighDesert_J",level:"Alpinist",pts:1820,summit:"Humphreys Pk",emoji:"🏔️",streak:15,summits:1},
    {name:data.name,level:level.name,pts:data.points,summit:data.trail?.name,emoji:level.icon,streak:data.streak||0,summits:stats.summitsDone,isYou:true},
    {name:"SummitSam",level:"Ridge Runner",pts:780,summit:"Mt. Mitchell",emoji:"🌲",streak:8,summits:0},
    {name:"AlpineAnna",level:"Trail Walker",pts:340,summit:"Black Balsam",emoji:"🥾",streak:3,summits:0},
  ].sort((a,b)=>b.pts-a.pts);

  return (
    <div style={{padding:"18px 16px",paddingBottom:100}}>
      <div style={{background:"#0a1a10",border:`1px solid ${C.greenFaint}`,borderRadius:10,padding:"11px 13px",marginBottom:18}}>
        <p style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:C.greenDim,lineHeight:1.7}}>🔒 Only summit achievements and training stats are shown here. Personal missions are never visible to others.</p>
      </div>
      {data.crew && (
        <div style={{marginBottom:20}}>
          <Tag color={C.textFaint}>YOUR CREW — {data.crew.name}</Tag>
          <div style={{height:8}}/>
          {(data.crew.members||[{name:data.name,pts:data.points,isYou:true}]).map((m,i)=>(
            <div key={i} style={{background:m.isYou?"#0f2016":C.card,border:`1px solid ${m.isYou?C.greenMid:C.border}`,borderRadius:12,padding:"12px 15px",marginBottom:8,display:"flex",gap:12,alignItems:"center"}}>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:C.amber,width:24}}>#{i+1}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:12,color:m.isYou?C.green:C.text}}>{m.name}{m.isYou&&<span style={{color:C.amber,fontSize:10}}> · YOU</span>}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:19,color:C.amber}}>{m.pts}</div>
                <Tag color={C.textFaint}>PTS</Tag>
              </div>
            </div>
          ))}
        </div>
      )}
      <Tag color={C.textFaint}>GLOBAL BOARD</Tag>
      <div style={{height:8}}/>
      {mock.map((p,i)=>(
        <div key={p.name} style={{background:p.isYou?"#0f2016":C.card,border:`1px solid ${p.isYou?C.greenMid:C.border}`,borderRadius:12,padding:"12px 15px",marginBottom:8,display:"flex",alignItems:"center",gap:11}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:19,color:i===0?"#E8C547":i===1?"#B0C4DE":i===2?"#C9A84C":C.textFaint,width:26,textAlign:"center"}}>#{i+1}</div>
          <span style={{fontSize:24}}>{p.emoji}</span>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:p.isYou?C.green:C.text}}>{p.name}{p.isYou&&<span style={{color:C.amber,fontSize:9}}> · YOU</span>}</div>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:10,color:C.textFaint,marginTop:2}}>
              {p.summit} · {p.summits>0?`${p.summits} summit${p.summits>1?"s":""} · `:""}🔥 {p.streak} day streak
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:19,color:C.amber}}>{p.pts}</div>
            <Tag color={C.textFaint}>PTS</Tag>
          </div>
        </div>
      ))}
      <Card style={{marginTop:18,textAlign:"center"}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:17,color:C.green,letterSpacing:2,marginBottom:7}}>LIVE ACCOUNTS COMING IN V1.0</div>
        <div style={{fontFamily:"'Space Mono',monospace",fontSize:11,color:C.textFaint,lineHeight:1.7}}>Real-time leaderboards, crew sync, and summit logs across devices. Your data is ready.</div>
      </Card>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────

export default function App() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("home");
  const [toast, setToast] = useState(null);
  const [achPop, setAchPop] = useState([]);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [jDraft, setJDraft] = useState({});

  useEffect(()=>{
    try { const s=localStorage.getItem("summit_v3"); if(s) setData(JSON.parse(s)); } catch(e) {}
  },[]);

  const save = useCallback(d=>{
    setData(d);
    try { localStorage.setItem("summit_v3",JSON.stringify(d)); } catch(e) {}
  },[]);

  const applyUpdate = (d) => {
    const earned = checkNewAchs(d);
    if(earned.length) {
      d.achievements = [...(d.achievements||[]),...earned];
      setAchPop(earned);
      setTimeout(()=>setAchPop([]),4500);
      setToast(`🏅 ${ACHIEVEMENTS.find(a=>a.id===earned[0])?.name} unlocked!`);
    }
    save(d);
  };

  const toggleDay = (wk, di) => {
    const key = `${wk}-${di}`;
    const week = data.plan.find(w=>w.week===wk);
    if(!week) return;
    const day = week.days[di];
    const d = {...data,completed:{...data.completed},points:data.points};
    if(d.completed[key]) { delete d.completed[key]; d.points=Math.max(0,d.points-day.pts); }
    else { d.completed[key]=true; d.points+=day.pts; }
    applyUpdate(d);
  };

  const toggleClean = () => {
    const today = todayKey();
    const d = {...data,cleanLog:{...data.cleanLog},points:data.points};
    if(d.cleanLog[today]?.clean) { delete d.cleanLog[today]; d.points=Math.max(0,d.points-10); }
    else { d.cleanLog[today]={clean:true}; d.points+=10; setToast(`🔒 +10 pts — mission day logged!`); }
    applyUpdate(d);
  };

  const skipWeek = (wk) => {
    if(!window.confirm("Mark this week as skipped? You can always come back to it.")) return;
    save({...data,plan:data.plan.map(w=>w.week===wk?{...w,skipped:true}:w)});
    setToast("Week skipped — your health comes first.");
  };

  const saveJournal = (wk, di, text) => {
    const key = `${wk}-${di}`;
    const d = {...data,journal:{...data.journal,[key]:text}};
    setJDraft(j=>{ const n={...j}; delete n[key]; return n; });
    applyUpdate(d);
    setToast("📓 Note saved");
  };

  const resetApp = () => {
    if(window.confirm("Reset all data? This cannot be undone.")) {
      localStorage.removeItem("summit_v3");
      setData(null);
      setShowSettings(false);
    }
  };

  if(!data) return (
    <div>
      <GS/>
      <Onboarding onComplete={d=>{ setData(d); try{localStorage.setItem("summit_v3",JSON.stringify(d));}catch(e){} }}/>
    </div>
  );

  if(showSettings) return (
    <div>
      <GS/>
      <Settings data={data} onUpdate={d=>{save(d);setShowSettings(false);}} onReset={resetApp} onClose={()=>setShowSettings(false)}/>
    </div>
  );

  const stats = getStats(data);
  const level = getLevel(data.points);
  const nextLevel = getNextLevel(data.points);
  const today = todayKey();
  const todayClean = data.cleanLog?.[today]?.clean;
  const currentWeek = getCurrentWeek(data);
  const region = data.region||getRegion(data.state);
  const currentPhase = currentWeek?.phase||1;
  const trainingTrails = TRAILS[region]||[];

  const TABS = [{id:"home",l:"HOME",ic:"🏠"},{id:"training",l:"PLAN",ic:"📋"},{id:"trails",l:"TRAILS",ic:"🗺️"},{id:"achievements",l:"MEDALS",ic:"🏅"},{id:"leaderboard",l:"BOARD",ic:"🏆"}];

  return (
    <div style={{minHeight:"100vh",background:C.bg}}>
      <GS/>
      <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(8,14,10,0.96)",backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.border}`,padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:21,letterSpacing:3,color:C.green,lineHeight:1}}>SUMMIT</div>
          <div style={{fontFamily:"'Space Mono',monospace",color:C.textFaint,fontSize:8,letterSpacing:2}}>{data.name?.toUpperCase()} · {level.icon} {level.name?.toUpperCase()}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:11}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:C.amber,lineHeight:1}}>{data.points}</div>
            <Tag color={C.textFaint}>PTS</Tag>
          </div>
          <button onClick={()=>setShowSettings(true)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 11px",color:C.textFaint,fontFamily:"'Space Mono',monospace",fontSize:11}}>⚙️</button>
        </div>
      </div>

      <div key={tab} style={{animation:"fadeIn 0.25s ease"}}>
        {tab==="home" && <HomeTab data={data} stats={stats} level={level} nextLevel={nextLevel} todayClean={todayClean} currentWeek={currentWeek} toggleClean={toggleClean}/>}
        {tab==="training" && <TrainingTab data={data} expandedWeek={expandedWeek} setExpandedWeek={setExpandedWeek} toggleDay={toggleDay} skipWeek={skipWeek} jDraft={jDraft} setJDraft={setJDraft} saveJournal={saveJournal}/>}
        {tab==="trails" && <TrailsTab data={data} currentPhase={currentPhase} trainingTrails={trainingTrails}/>}
        {tab==="achievements" && <AchievementsTab data={data}/>}
        {tab==="leaderboard" && <LeaderboardTab data={data} level={level} stats={stats}/>}
      </div>

      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:"rgba(8,14,10,0.97)",backdropFilter:"blur(12px)",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-around",padding:"9px 0 max(9px,env(safe-area-inset-bottom))"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"3px 8px",color:tab===t.id?C.green:C.textFaint,transition:"color 0.2s"}}>
            <span style={{fontSize:17}}>{t.ic}</span>
            <span style={{fontFamily:"'Space Mono',monospace",fontSize:8,letterSpacing:1}}>{t.l}</span>
          </button>
        ))}
      </div>

      {achPop.length>0 && <AchPop ids={achPop} onClose={()=>setAchPop([])}/>}
      {toast && <Toast msg={toast} onClose={()=>setToast(null)}/>}
    </div>
  );
}
