"use strict";

// Coursework demo only. Credits have no monetary value.
const ROWS = 3;
const LINES = 20;
const SCATTER = "X";
const WILD = "W";
const PAYLINES = [
  [1,1,1,1,1],[0,0,0,0,0],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],
  [0,0,1,2,2],[2,2,1,0,0],[1,0,1,2,1],[1,2,1,0,1],[0,1,1,1,0],
  [2,1,1,1,2],[1,0,0,0,1],[1,2,2,2,1],[0,1,0,1,0],[2,1,2,1,2],
  [0,2,0,2,0],[2,0,2,0,2],[0,2,1,2,0],[2,0,1,0,2],[1,1,0,1,1]
];
const PAYTABLE = {
  T:[7.6,15.2,38],J:[11.4,22.8,57],Q:[15.2,30.4,76],K:[19,38,95],A:[22.8,45.6,114],
  S:[38,76,228],O:[57,114,304],L:[76,190,532],R:[114,304,912],C:[190,608,1900],W:[228,1140,5700]
};
const NAMES = {T:"Runic 10",J:"Runic J",Q:"Runic Q",K:"Runic K",A:"Runic A",S:"Obsidian Seal",O:"Astral Orrery",L:"Lunar Key",R:"Solar Relic",C:"Crown of Totality",W:"Wild Solar Crown",X:"Scatter Eclipse Gate"};
const ASSET = {T:"symbol_runic_ten.png",J:"symbol_runic_jack.png",Q:"symbol_runic_queen.png",K:"symbol_runic_king.png",A:"symbol_runic_ace.png",S:"symbol_obsidian_seal.png",O:"symbol_astral_orrery.png",L:"symbol_lunar_key.png",R:"symbol_solar_relic.png",C:"symbol_crown_totality.png",W:"symbol_wild_solar_crown.png",X:"symbol_scatter_eclipse_gate.png"};
const BASE_REELS = [
  ["A","K","Q","J","T","S","A","K","Q","J","T","O","A","K","Q","J","T","L","A","K","Q","J","T","R","A","K","Q","J","T","C","A","K","Q","O","W","X"],
  ["K","A","J","Q","T","S","K","A","J","Q","T","O","K","A","J","Q","T","L","K","A","J","Q","T","R","K","A","J","Q","T","C","K","A","Q","L","W","X"],
  ["Q","K","A","J","T","S","Q","K","A","J","T","O","Q","K","A","J","T","L","Q","K","A","J","T","R","Q","K","A","J","T","C","Q","A","K","R","W","X"],
  ["J","Q","K","A","T","S","J","Q","K","A","T","O","J","Q","K","A","T","L","J","Q","K","A","T","R","J","Q","K","A","T","C","J","K","A","S","W","X"],
  ["T","J","Q","K","A","S","T","J","Q","K","A","O","T","J","Q","K","A","L","T","J","Q","K","A","R","T","J","Q","K","A","C","T","Q","K","O","W","X"]
];
const FREE_REELS = [
  ["A","K","Q","J","T","S","A","K","Q","J","O","A","K","Q","L","A","K","R","Q","J","C","A","K","O","Q","L","A","R","K","C","W","A","W","Q","S","X"],
  ["K","A","J","Q","T","S","K","A","J","O","K","A","L","J","Q","R","K","A","C","J","Q","O","K","L","A","R","Q","C","K","A","W","J","W","L","S","X"],
  ["Q","K","A","J","T","S","Q","K","O","A","J","L","Q","K","R","A","J","C","Q","O","K","L","A","R","Q","C","J","K","A","O","W","Q","W","R","S","X"],
  ["J","Q","K","A","T","S","J","O","Q","K","L","A","J","R","Q","K","C","A","J","O","L","Q","R","K","C","A","J","L","Q","O","W","K","W","R","S","X"],
  ["T","J","Q","K","A","S","O","T","J","L","Q","K","R","A","C","T","J","O","Q","L","K","R","A","C","T","J","L","Q","O","K","W","A","W","R","S","X"]
];
const BETS = [0.25,0.5,1,2,5];
const BUY_BONUS_MULTIPLIER = 40; // Prototype-only assumption; requires separate RTP validation for production.
const state = {balance:1000, lineBet:1, grid:null, spinning:false, free:{active:false, left:0, awarded:0, multiplier:1,totalWin:0,played:0}, muted:false};

const $ = id => document.getElementById(id);
const fmt = n => Number(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const totalStake = () => state.lineBet * LINES;
const buyBonusCost = () => totalStake() * BUY_BONUS_MULTIPLIER;
const symbolPath = s => `assets/eclipse_vault/${ASSET[s]}`;
function windowAt(reel,stop){return [reel[stop],reel[(stop+1)%reel.length],reel[(stop+2)%reel.length]];}
function randomOutcome(reels){const stops=reels.map(reel=>Math.floor(Math.random()*reel.length));return {stops,grid:reels.map((reel,index)=>windowAt(reel,stops[index]))};}
function count(grid, symbol){return grid.flat().filter(x=>x===symbol).length;}
function linePayout(symbols){let best=0, bestSymbol=null, bestLength=0;for(const symbol of Object.keys(PAYTABLE)){for(const length of [5,4,3]){if(symbols.slice(0,length).every(item=>item===symbol||item===WILD)){const award=PAYTABLE[symbol][length-3];if(award>best){best=award;bestSymbol=symbol;bestLength=length;}break;}}}return {award:best,symbol:bestSymbol,length:bestLength};}
function calculate(grid){let payout=0,wins=[];PAYLINES.forEach((line,index)=>{const symbols=line.map((row,reel)=>grid[reel][row]);const result=linePayout(symbols);if(result.award>0){payout+=result.award*state.lineBet;wins.push({index:index+1,line,result});}});return {payout,wins,scatters:count(grid,SCATTER),wilds:count(grid,WILD)};}
function symbolCell(symbol,winning=false){const cell=document.createElement("div");cell.className=`symbol ${symbol===WILD?"wild":""} ${symbol===SCATTER?"scatter":""}${winning?" winning":""}`;cell.innerHTML=`<img src="${symbolPath(symbol)}" alt="${NAMES[symbol]}">`;return cell;}
function fillReel(strip,symbols,winningRows=[]){strip.innerHTML="";const track=document.createElement("div");track.className="reel-track";symbols.forEach((symbol,row)=>track.append(symbolCell(symbol,winningRows.includes(row))));strip.append(track);return track;}
function renderGrid(grid,winning=[]){const holder=$("reels");holder.innerHTML="";for(let reel=0;reel<5;reel++){const strip=document.createElement("div");strip.className="reel";const winningRows=winning.filter(w=>w.line[reel]!==undefined).map(w=>w.line[reel]);fillReel(strip,grid[reel],winningRows);holder.append(strip);}}
function renderRollingReel(reelIndex,reel,stop){const strip=$("reels").children[reelIndex];strip.className="reel rolling";const previous=(stop-1+reel.length)%reel.length;const symbols=[reel[previous],reel[stop],reel[(stop+1)%reel.length],reel[(stop+2)%reel.length]];const track=fillReel(strip,symbols);track.classList.add("down-start");return track;}
function animateSingleReel(reelIndex,reel,targetStop){
  const steps=10+reelIndex*2+Math.floor(Math.random()*2);
  let remaining=steps;let current=(targetStop+steps)%reel.length;
  return new Promise(resolve=>{
    const advance=()=>{
      const track=renderRollingReel(reelIndex,reel,current);
      requestAnimationFrame(()=>track.classList.add("is-moving-down"));
      setTimeout(()=>{
        current=(current-1+reel.length)%reel.length;remaining-=1;
        if(remaining===0){resolve();return;}
        requestAnimationFrame(advance);
      },62);
    };
    setTimeout(advance,reelIndex*52);
  });
}
async function animateReels(reels,outcome){await Promise.all(reels.map((reel,index)=>animateSingleReel(index,reel,outcome.stops[index])));renderGrid(outcome.grid);}
function updateUI(){
  $("balance").textContent=fmt(state.balance);$("lineBet").textContent=fmt(state.lineBet);$("stakeLabel").textContent=`STAKE ${fmt(totalStake())}`;
  const free=state.free.active;$("modeLabel").textContent=free?"TOTALITY MODE":"BASE GAME";$("featureBar").hidden=!free;$("freeSpinsLeft").textContent=state.free.left;$("multiplier").textContent=state.free.multiplier;
  $("spinLabel").textContent=free?"FREE SPIN":"SPIN";$("spinButton").disabled=state.spinning||(!free&&state.balance<totalStake());
  $("buyBonusPrice").textContent=`${BUY_BONUS_MULTIPLIER}× · ${fmt(buyBonusCost())} CREDITS`;
  $("buyBonusButton").disabled=state.spinning||free||state.balance<buyBonusCost();
}
function initialGrid(){return [["A","K","Q"],["J","T","S"],["O","L","R"],["C","A","W"],["X","K","Q"]];}
function setStatus(kicker,text){$("statusKicker").textContent=kicker;$("statusText").textContent=text;}
function highlightResult(result,displayWin){renderGrid(state.grid,result.wins);$("lastWin").textContent=fmt(displayWin);$("winDisplay").textContent=fmt(displayWin);if(result.wins.length){const top=result.wins.slice(0,2).map(w=>`L${w.index}: ${w.result.length} ${NAMES[w.result.symbol]}`).join(" · ");$("winBreakdown").textContent=`${top}${result.wins.length>2?` + ${result.wins.length-2} more line wins`:""}`;$("winBreakdown").className="win-breakdown win";}else{$("winBreakdown").textContent="NO LINE WIN · THE VAULT REMAINS SEALED";$("winBreakdown").className="win-breakdown";}}
function updateCharges(result){const charges=Math.min(3,result.wilds+result.scatters);$("chargeValue").textContent=charges;}
function startFeature(scatters){const award=scatters>=5?16:scatters===4?12:8;state.free={active:true,left:award,awarded:award,multiplier:1,totalWin:0,played:0};setStatus("ВЛЕЗНА В БОНУС",`Имаш ${award} Free Spins. Totality Mode започва.`);$("winBreakdown").textContent=`${scatters} Scatter Eclipse Gate символа отключиха бонус играта.`;$("bonusAward").textContent=award;updateUI();openModal("bonusStartModal");}
function endFeature(){const totalWin=state.free.totalWin;const played=state.free.played;state.free={active:false,left:0,awarded:0,multiplier:1,totalWin:0,played:0};setStatus("FEATURE COMPLETE","Бонус играта приключи. Виж общата печалба от Free Spins.");$("winBreakdown").textContent="TOTALITY MODE COMPLETE";$("bonusWinAmount").textContent=fmt(totalWin);$("bonusSpinsPlayed").textContent=`Изиграни Free Spins: ${played}`;updateUI();openModal("bonusSummaryModal");}
async function buyBonus(){
  if(state.spinning||state.free.active||state.balance<buyBonusCost())return;
  const cost=buyBonusCost();
  // Stops 35, 34 and 33 place one X Scatter visibly on the first three base reels.
  const buyOutcome={stops:[35,34,33,6,7],grid:[]};
  buyOutcome.grid=BASE_REELS.map((reel,index)=>windowAt(reel,buyOutcome.stops[index]));
  state.spinning=true;state.balance-=cost;
  $("lastWin").textContent="0.00";$("winDisplay").textContent="0.00";$("chargeValue").textContent="3";
  updateUI();
  setStatus("BONUS BUY ACTIVATED",`Купуваш 3 Scatter за ${fmt(cost)} demo credits.`);
  $("winBreakdown").textContent="ECLIPSE GATES ARE SPINNING…";
  await animateReels(BASE_REELS,buyOutcome);
  state.grid=buyOutcome.grid;
  setStatus("3 SCATTER LANDED","Влезна в бонус. Имаш 8 Free Spins.");
  $("winBreakdown").textContent="3 SCATTER · BONUS GAME UNLOCKED · 8 FREE SPINS";
  await new Promise(resolve=>setTimeout(resolve,800));
  state.spinning=false;startFeature(3);updateUI();
}
async function spin(){
  if(state.spinning||(!state.free.active&&state.balance<totalStake()))return;
  const free=state.free.active;const activeReels=free?FREE_REELS:BASE_REELS;state.spinning=true;if(!free)state.balance-=totalStake();updateUI();setStatus(free?"TOTALITY IN MOTION":"RNG DEMO SPIN",free?"The Free Spins reels are turning…":"The celestial reels are turning…");
  const outcome=randomOutcome(activeReels);await animateReels(activeReels,outcome);state.grid=outcome.grid;const result=calculate(state.grid);const multiplier=free?state.free.multiplier:1;const regularWin=result.payout*multiplier;state.balance+=regularWin;highlightResult(result,regularWin);updateCharges(result);
  if(free){state.free.left-=1;state.free.played+=1;state.free.totalWin+=regularWin;if(result.scatters>=3&&state.free.awarded<30){const added=Math.min(4,30-state.free.awarded);state.free.left+=added;state.free.awarded+=added;$("winBreakdown").textContent+=` · RETRIGGER +${added} FREE SPINS`;}
    const currentMult=state.free.multiplier;if(result.wilds>0)state.free.multiplier=Math.min(5,state.free.multiplier+1);setStatus("TOTALITY MODE",result.wilds>0?`×${currentMult} applied. Wild raised next multiplier to ×${state.free.multiplier}.`:`×${currentMult} applied to this Free Spin.`);
  }else if(result.scatters>=3){setStatus("SCATTER TRIGGER",`${result.scatters} Eclipse Gates opened the Vault.`);}
  else setStatus(result.wins.length?"VAULT REWARD":"BASE GAME",result.wins.length?`You won ${fmt(regularWin)} demo credits.`:"No line win. Choose another demonstration spin.");
  state.spinning=false;updateUI();
  if(!free&&result.scatters>=3)startFeature(result.scatters); else if(free&&state.free.left===0)endFeature();
}
function reset(){Object.assign(state,{balance:1000,lineBet:1,grid:initialGrid(),spinning:false,free:{active:false,left:0,awarded:0,multiplier:1,totalWin:0,played:0}});renderGrid(state.grid);$("lastWin").textContent="0.00";$("winDisplay").textContent="0.00";$("chargeValue").textContent="0";$("winBreakdown").textContent="READY FOR A DEMO SPIN";setStatus("THE VAULT AWAITS","Select your stake and spin.");updateUI();}
function openModal(which){document.querySelectorAll(".modal").forEach(el=>el.classList.add("hidden"));$("modalRoot").setAttribute("aria-hidden","false");$(which).classList.remove("hidden");}
function closeModal(){document.querySelectorAll(".modal").forEach(el=>el.classList.add("hidden"));$("modalRoot").setAttribute("aria-hidden","true");}
function buildPaytable(){const p=$("paytable");p.innerHTML=["Symbol","3","4","5"].map(x=>`<div class="head">${x}</div>`).join("");Object.entries(PAYTABLE).forEach(([s,values])=>{p.insertAdjacentHTML("beforeend",`<div>${s} · ${NAMES[s]}</div>${values.map(v=>`<div>${fmt(v)}</div>`).join("")}`);});}
function launch(){ $("lobby").classList.add("hidden");$("game").classList.remove("hidden");window.scrollTo(0,0);}

document.addEventListener("click",event=>{const open=event.target.closest("[data-open]");if(open){openModal(`${open.dataset.open}Modal`);return;}if(event.target.closest("[data-close-modal]"))closeModal();});
$("launchGame").addEventListener("click",launch);$("launchGameCard").addEventListener("click",launch);$("backToLobby").addEventListener("click",()=>{$("game").classList.add("hidden");$("lobby").classList.remove("hidden");window.scrollTo(0,0);});
$("spinButton").addEventListener("click",spin);$("betDown").addEventListener("click",()=>{const i=BETS.indexOf(state.lineBet);if(i>0){state.lineBet=BETS[i-1];updateUI();}});$("betUp").addEventListener("click",()=>{const i=BETS.indexOf(state.lineBet);if(i<BETS.length-1){state.lineBet=BETS[i+1];updateUI();}});$("resetDemo").addEventListener("click",reset);$("lineInfo").addEventListener("click",()=>openModal("rulesModal"));$("featurePreview").addEventListener("click",()=>openModal("featureModal"));
$("buyBonusButton").addEventListener("click",buyBonus);
$("beginFreeSpins").addEventListener("click",closeModal);$("finishBonus").addEventListener("click",closeModal);
$("soundToggle").addEventListener("click",()=>{state.muted=!state.muted;$("soundToggle").textContent=state.muted?"♩":"♫";$("soundToggle").setAttribute("aria-pressed",String(state.muted));});
buildPaytable();reset();
