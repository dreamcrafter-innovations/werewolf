import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Animated, ScrollView, StyleSheet, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { usePalette } from '../hooks/usePalette';
import { fill } from '../utils/interpolate';
import Gradient from '../components/Gradient';
import AbandonGameButton from '../components/AbandonGameButton';
import TabletContainer from '../components/TabletContainer';
import { FONTS } from '../components/theme';
import { getRandomProphecy, ROLES } from '../data/roles';
import { getLoverPair, getNightSteps } from '../utils/gameLogic';
import { useSpeech } from '../hooks/useSpeech';
import { getActiveVillainTheme, getTheme } from '../data/villainThemes';
import { haptics } from '../utils/haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { loadSettings, saveSettings } from '../storage';

export default function NightScreen({ navigation }) {
  useKeepAwake(); // night discussion runs long; screen must not sleep mid-round
  const { state, villainTheme, setVillainTarget, setHealerProtect, setBodyguardProtect,
          setWitchSave, setWitchPoison, setCupidPair, setSeerCheck, resolveNight } = useGame();
  const { t } = useLanguage();
  const C = usePalette();
  const { players, round, witchHealUsed, witchPoisonUsed, cupidDone, lastBodyguardTarget, healerSelfUsed } = state;
  const alive = players.filter(p=>p.isAlive);
  const aliveVillains = alive.filter(p=>p.role==='VILLAIN');
  // Mixed-villain mode: alive villains may carry different theme overrides —
  // combine them for the shared "wake up" narration each night.
  const activeVillainTheme = getActiveVillainTheme(aliveVillains, state.villainThemeId);
  // Frozen for the whole night. Recomputing per render would reshuffle the list the
  // moment a step flips its own flag — binding the lovers sets cupidDone, which drops
  // CUPID out of the array and slides every later step down one, silently skipping the
  // villains' turn. The screen remounts each night, so this still refreshes per round.
  const steps = useRef(getNightSteps(alive, { round, witchHealUsed, witchPoisonUsed, cupidDone })).current;
  const [stepIdx, setStepIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [pair, setPair] = useState([]);          // Cupid picks exactly two
  const [lifePotion, setLifePotion] = useState(false);
  const [seerResult, setSeerResult] = useState(null);
  const [seerResultTheme, setSeerResultTheme] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const prophecy = useRef(getRandomProphecy()).current;
  // The 3s seer-result timer calls advance(); if the screen goes away first
  // (app killed mid-window) it would fire against an unmounted component.
  const seerTimer = useRef(null);
  useEffect(() => () => { if (seerTimer.current) clearTimeout(seerTimer.current); }, []);
  const step = steps[stepIdx];
  const { speak, stop, setEnabled } = useSpeech();
  // Shown once ever, on the very first Night screen — narration defaults on (useSpeech),
  // this is the acknowledge/opt-out moment so a first-time user notices it exists at all.
  const [showNarratorPrompt, setShowNarratorPrompt] = useState(false);

  // The Witch acts after the attack is chosen, so she is told who was targeted.
  const victim = players.find(p => p.id === state.nightActions.villainTarget);
  const loverPair = getLoverPair(players);

  // Build step metadata — villain night wake comes from theme
  const getMetaForStep = (s) => {
    const vn = villainTheme.roles?.HEALER?.name  || 'Healer';
    const ve = villainTheme.roles?.HEALER?.emoji || '🌿';
    const tn = villainTheme.roles?.SEER?.name  || 'Seer';
    const te = villainTheme.roles?.SEER?.emoji || '🔮';
    switch(s) {
      case 'INTRO':   return { icon:'🌑', title:t('night_intro_title'),   script:t('night_intro_script'),   action:null,                    bg:[C.bg,'#02020E'] };
      case 'CUPID':   return { icon:'💘', title:'Cupid, wake up!', script:'Cupid, open your eyes.\nChoose TWO players to bind together as lovers.\n\nIf either of them ever dies, the other dies of grief. 💔\n\nYou will not wake again.', action:'Link two lovers', bg:[C.bg,'#1A0010'] };
      case 'LOVERS':  return loverPair
        ? { icon:'💞', title:'Lovers, open your eyes!', script:'Narrator: wake ONLY these two players and show them this screen.\n\nEveryone else stays asleep.', action:null, bg:[C.bg,'#1A0010'] }
        : { icon:'🌙', title:'No one was bound', script:'Cupid bound no one tonight. Everyone stays asleep.', action:null, bg:[C.bg,'#1A0010'] };
      case 'VILLAIN':  return { icon:activeVillainTheme.emoji, title:activeVillainTheme.nightWake, script:activeVillainTheme.nightInstruction, action:t('night_choose_target'), bg:[activeVillainTheme.bgColor||C.bg,'#050000'] };
      case 'BODYGUARD': return { icon:'🛡️', title:'Bodyguard, wake up!', script:`Bodyguard, open your eyes.\nWho do you want to guard tonight?\n\nIf they are attacked, YOU die in their place.${lastBodyguardTarget ? '\n\n(You cannot guard the same player two nights in a row.)' : ''}`, action:'Guard someone', bg:[C.bg,'#00101A'] };
      // The self-protect line is now backed by healerSelfUsed, so it has to stop
      // offering something the selectable filter no longer allows.
      case 'HEALER':  return { icon:ve, title:`${vn}, wake up!`, script:`${vn}, open your eyes.\nWhich player do you want to protect tonight?\n\n${healerSelfUsed ? '(You have already used your one self-protection.) 💊' : '(You can protect yourself too — but only once!) 💊'}`, action:t('night_protect'), bg:[C.bg,'#000810'] };
      case 'SEER': return { icon:te, title:`${tn}, wake up!`, script:`${tn}, open your eyes.\nWhich player's identity do you want to check?\n\nThe result will ONLY be shown to you — tell no one! 🤫`, action:t('night_check'), bg:[C.bg,'#0D001A'] };
      case 'WITCH':   return {
        icon:'🧪', title:'Witch, wake up!',
        script:`Witch, open your eyes.\n${victim ? `Tonight they attacked ${victim.name}.` : 'No one was attacked tonight.'}\n\nSpend a potion — or keep them for a darker night.`,
        // Every Witch choice is optional, so the Continue button is never gated on a pick.
        action: witchPoisonUsed ? null : 'Poison someone (optional)', optional:true,
        bg:[C.bg,'#12001A'],
      };
      case 'DAWN':    return { icon:'🌅', title:t('night_dawn_title'),    script:t('night_dawn_script'),    action:null,                    bg:['#1A0D00','#100A00'] };
      default:        return { icon:'🌑', title:'', script:'', action:null, bg:[C.bg,C.bg] };
    }
  };
  const meta = getMetaForStep(step);

  // Cupid needs exactly two; optional steps (the Witch) never block.
  const blocked = step === 'CUPID' ? pair.length !== 2 : (!!meta.action && !meta.optional && !selected);

  // Speak the opening step on mount (native only — web browsers require a prior user gesture)
  useEffect(() => { speak(getMetaForStep(steps[0]).script); }, []);

  useEffect(() => {
    if (stepIdx !== 0) return;
    loadSettings().then(s => { if (!s?.narratorPromptSeen) setShowNarratorPrompt(true); });
  }, []);

  const chooseNarrator = async (enable) => {
    haptics.light();
    setEnabled(enable);
    const s = (await loadSettings()) ?? {};
    await saveSettings({ ...s, narratorEnabled: enable, narratorPromptSeen: true });
    setShowNarratorPrompt(false);
  };

  useEffect(() => {
    fadeAnim.setValue(0); setSelected(null); setPair([]); setLifePotion(false); setSeerResult(null);
    Animated.timing(fadeAnim,{toValue:1,duration:600,useNativeDriver:true}).start();
  }, [stepIdx]);

  useEffect(() => () => { stop(); }, []);

  // Night/Day/Vote are a forward-only relay (see the "replace, not navigate" notes below)
  // with no in-app back button — every round-trip screen replaces the last, so the stack
  // entry underneath is always Setup. An unguarded hardware back press would silently
  // dump the player on Setup mid-round with the game state abandoned. Swallow it instead.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, [])
  );

  const advance = () => {
    // replace (not navigate) — Night/Day/Vote cycle through the same route names every
    // round; navigate() would pop back to the already-mounted screen from a previous
    // round instead of remounting, leaving stale step/phase state behind.
    if(stepIdx===steps.length-1){ resolveNight(); navigation.replace('Day'); }
    else {
      const nextIdx = stepIdx + 1;
      speak(getMetaForStep(steps[nextIdx]).script); // synchronous in user-event — works on web
      setStepIdx(nextIdx);
    }
  };

  const handleNext = () => {
    if(blocked) return; // selection required; use Skip to bypass
    if(meta.action) haptics.light(); // confirming a night-action target selection
    if(step==='CUPID'){ setCupidPair(pair); advance(); return; }
    if(step==='WITCH'){ if(selected) setWitchPoison(selected); advance(); return; }
    if(step==='VILLAIN'&&selected) setVillainTarget(selected);
    else if(step==='HEALER'&&selected) setHealerProtect(selected);
    else if(step==='BODYGUARD'&&selected) setBodyguardProtect(selected);
    else if(step==='SEER'&&selected) {
      setSeerCheck(selected);
      const target = players.find(p=>p.id===selected);
      const isEvil = target?.role==='VILLAIN';
      setSeerResult(isEvil?'EVIL':'INNOCENT');
      // Show the target's own villain theme (mixed-villain mode), not the aggregate one
      setSeerResultTheme(isEvil ? getTheme(target.villainThemeOverride || state.villainThemeId) : null);
      (isEvil ? haptics.warning : haptics.success)();
      seerTimer.current = setTimeout(()=>{ setSeerResult(null); setSeerResultTheme(null); advance(); }, 3000);
      return;
    }
    advance();
  };

  const selectable = alive.filter(p => {
    if(step==='SEER'){ const seer=players.find(q=>q.role==='SEER'); return seer?p.id!==seer.id:true; }
    // A Bodyguard shields by dying in the target's place, so guarding themselves is a
    // no-op — and repeating last night's target is against the rules.
    if(step==='BODYGUARD'){ const bg=players.find(q=>q.role==='BODYGUARD'); return p.id!==bg?.id && p.id!==lastBodyguardTarget; }
    // Self-protection is once per game. Nothing enforced it before, so a Healer
    // could shield themselves every single night while the script said otherwise.
    if(step==='HEALER'&&healerSelfUsed){ const h=players.find(q=>q.role==='HEALER'); return p.id!==h?.id; }
    return true;
  });

  const togglePair = (id) => {
    setPair(prev => prev.includes(id) ? prev.filter(x=>x!==id) : prev.length < 2 ? [...prev, id] : prev);
  };
  const isPicked = (id) => step==='CUPID' ? pair.includes(id) : selected===id;

  return (
    <Gradient colors={meta.bg} style={styles.flex}>
      <SafeAreaView style={styles.safe}>
        <AbandonGameButton navigation={navigation} />
        <TabletContainer>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            <View style={styles.topBar}>
              <Text style={[styles.roundLabel,{color:C.primary}]}>{fill(t('night_round'),{n:round})}</Text>
              <Text style={[styles.prophecy,{color:C.textDim}]}>{prophecy}</Text>
            </View>

            <View style={styles.stepDots}>
              {steps.map((s,i)=>(
                <View key={s} style={[styles.dot,{backgroundColor:C.textDim},i===stepIdx&&{backgroundColor:C.primary,width:24},i<stepIdx&&{backgroundColor:C.village||'#27AE60'}]}/>
              ))}
            </View>

            {showNarratorPrompt ? (
              <View style={styles.body}>
                <Text style={styles.stepIcon}>📢</Text>
                <Text style={[styles.stepTitle,{color:C.text}]}>{t('night_narrator_prompt_title')}</Text>
                <View style={[styles.narratorBox,{backgroundColor:C.primary+'15',borderColor:C.primary+'40'}]}>
                  <Text style={[styles.narratorText,{color:C.text}]}>{t('night_narrator_prompt_body')}</Text>
                </View>
                <Pressable style={[styles.nextBtn,{backgroundColor:C.primary,shadowColor:C.primary}]} onPress={()=>chooseNarrator(true)}>
                  <Text style={styles.nextBtnTxt}>{t('night_narrator_prompt_yes')}</Text>
                </Pressable>
                <Pressable style={styles.skipBtn} onPress={()=>chooseNarrator(false)}>
                  <Text style={[styles.skipTxt,{color:C.textDim}]}>{t('night_narrator_prompt_no')}</Text>
                </Pressable>
              </View>
            ) : (
            <Animated.View style={[styles.body,{opacity:fadeAnim}]}>
              <Text style={styles.stepIcon}>{meta.icon}</Text>
              <Text style={[styles.stepTitle,{color:C.text}]}>{meta.title}</Text>

              <View style={[styles.narratorBox,{backgroundColor:C.primary+'15',borderColor:C.primary+'40'}]}>
                <Text style={[styles.narratorLabel,{color:C.primary}]}>{t('night_narrator_label')}</Text>
                <Text style={[styles.narratorText,{color:C.text}]}>{meta.script}</Text>
              </View>

              {/* The couple learns who they are — without this the lovers' win is unplayable */}
              {step==='LOVERS'&&loverPair&&(
                <View style={[styles.loversBox,{borderColor:ROLES.CUPID.color,backgroundColor:ROLES.CUPID.color+'1A'}]}>
                  <Text style={styles.loversEmoji}>💞</Text>
                  {loverPair.map(p=>(
                    <Text key={p.id} style={[styles.loverName,{color:C.text}]}>{p.avatar} {p.name}</Text>
                  ))}
                  <Text style={[styles.loversNote,{color:C.textSecondary}]}>
                    You are in love. If either of you dies, the other dies of grief.{'\n\n'}
                    If you turn out to be on opposite sides, you can no longer win with your own team —
                    you win only by being the last two alive, together.
                  </Text>
                </View>
              )}

              {/* Witch life potion — a one-shot toggle, separate from the poison grid below */}
              {step==='WITCH'&&!witchHealUsed&&!!victim&&(
                <Pressable
                  style={[styles.potionBtn,{borderColor:C.village||'#27AE60',backgroundColor:(lifePotion?(C.village||'#27AE60'):'transparent')+(lifePotion?'33':'')}]}
                  onPress={()=>{ const next=!lifePotion; setLifePotion(next); setWitchSave(next); haptics.light(); }}>
                  <Text style={[styles.potionTxt,{color:C.village||'#27AE60'}]}>
                    {lifePotion ? `✅ Saving ${victim.name} with the life potion` : `🧪 Use life potion to save ${victim.name}`}
                  </Text>
                </Pressable>
              )}
              {step==='WITCH'&&witchHealUsed&&(
                <Text style={[styles.potionSpent,{color:C.textDim}]}>🧪 Life potion already spent</Text>
              )}
              {step==='WITCH'&&witchPoisonUsed&&(
                <Text style={[styles.potionSpent,{color:C.textDim}]}>☠️ Death potion already spent</Text>
              )}

              {meta.action&&(
                <View style={styles.selectionArea}>
                  <Text style={[styles.selectionTitle,{color:C.text}]}>
                    {meta.action}{step==='CUPID' ? ` (${pair.length}/2)` : ''}:
                  </Text>
                  <View style={styles.playerGrid}>
                    {selectable.map(p=>{
                      const picked = isPicked(p.id);
                      return (
                        <Pressable key={p.id}
                          style={[styles.playerChip,{backgroundColor:C.card,borderColor:picked?C.primary:C.cardBorder},picked&&{backgroundColor:C.primary+'20'}]}
                          onPress={()=>step==='CUPID'?togglePair(p.id):setSelected(selected===p.id?null:p.id)}>
                          <Text style={styles.chipAvatar}>{p.avatar}</Text>
                          <Text style={[styles.chipName,{color:picked?C.primary:C.textSecondary}]}>{p.name}</Text>
                          {picked&&<Text style={[styles.check,{color:C.primary}]}>✓</Text>}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              {seerResult&&(
                <View style={[styles.seerResult,seerResult==='EVIL'?{backgroundColor:C.evil+'50',borderColor:C.evil}:{backgroundColor:(C.village||'#27AE60')+'40',borderColor:C.village||'#27AE60'}]}>
                  <Text style={styles.seerEmoji}>{seerResult==='EVIL'?(seerResultTheme?.emoji ?? villainTheme.emoji):'😇'}</Text>
                  <Text style={[styles.seerText,{color:C.text}]}>
                    {seerResult==='EVIL' ? fill(t('night_evil_result'),{villain:(seerResultTheme?.label ?? villainTheme.label).toUpperCase()}) : t('night_innocent_result')}
                  </Text>
                </View>
              )}

              {!seerResult&&(
                <Pressable
                  style={[styles.nextBtn,{backgroundColor:blocked?C.textDim:C.primary,shadowColor:C.primary}]}
                  onPress={handleNext}>
                  <Text style={styles.nextBtnTxt}>
                    {stepIdx===steps.length-1 ? t('night_dawn_btn') : t('night_continue')}
                  </Text>
                </Pressable>
              )}

              {/* Skip abandons the whole turn, so it has to undo the Witch's life potion
                  too — that one lives in game state (setWitchSave), not in the local
                  `lifePotion` flag the step-change effect resets, so without this a
                  narrator who toggled it and then skipped still spent the potion. */}
              {meta.action&&!seerResult&&(
                <Pressable style={styles.skipBtn} onPress={()=>{setSelected(null);setPair([]);if(step==='WITCH'){setLifePotion(false);setWitchSave(false);}advance();}}>
                  <Text style={[styles.skipTxt,{color:C.textDim}]}>{t('night_skip')}</Text>
                </Pressable>
              )}
            </Animated.View>
            )}
          </ScrollView>
        </TabletContainer>
      </SafeAreaView>
    </Gradient>
  );
}

const styles = StyleSheet.create({
  flex:{flex:1}, safe:{flex:1},
  scroll:{flexGrow:1,alignItems:'center',padding:24,paddingBottom:48},
  topBar:{width:'100%',alignItems:'center',marginBottom:12},
  roundLabel:{...FONTS.label,fontSize:14,letterSpacing:2,marginBottom:6},
  prophecy:{...FONTS.small,fontStyle:'italic',textAlign:'center'},
  stepDots:{flexDirection:'row',gap:8,marginBottom:24},
  dot:{width:8,height:8,borderRadius:4},
  body:{width:'100%',alignItems:'center'},
  stepIcon:{fontSize:72,textAlign:'center',marginBottom:8},
  stepTitle:{...FONTS.title,textAlign:'center',marginBottom:20},
  narratorBox:{width:'100%',maxWidth:380,borderRadius:16,padding:18,borderWidth:1,marginBottom:24},
  narratorLabel:{...FONTS.label,fontSize:11,marginBottom:10},
  narratorText:{...FONTS.body,lineHeight:26,textAlign:'center'},
  selectionArea:{width:'100%',maxWidth:380,marginBottom:24},
  selectionTitle:{...FONTS.subtitle,marginBottom:12,textAlign:'center'},
  playerGrid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'center',gap:10},
  playerChip:{flexDirection:'row',alignItems:'center',borderRadius:14,paddingHorizontal:14,paddingVertical:10,borderWidth:1.5,gap:8,minWidth:120},
  chipAvatar:{fontSize:20},
  chipName:{...FONTS.body,fontWeight:'600'},
  check:{fontSize:16,fontWeight:'800'},
  seerResult:{width:'100%',maxWidth:380,borderRadius:20,padding:24,alignItems:'center',marginBottom:20,borderWidth:2},
  seerEmoji:{fontSize:52,marginBottom:8},
  seerText:{...FONTS.subtitle,textAlign:'center',lineHeight:28},
  nextBtn:{borderRadius:16,paddingVertical:18,paddingHorizontal:40,marginBottom:12,shadowOffset:{width:0,height:0},shadowOpacity:0.4,shadowRadius:10,elevation:6},
  nextBtnTxt:{color:'#000',fontWeight:'800',fontSize:17},
  skipBtn:{paddingVertical:10},
  skipTxt:{...FONTS.small,textAlign:'center'},
  potionBtn:{width:'100%',maxWidth:380,borderRadius:14,paddingVertical:14,paddingHorizontal:16,borderWidth:1.5,marginBottom:16,alignItems:'center'},
  potionTxt:{...FONTS.body,fontWeight:'700',textAlign:'center'},
  potionSpent:{...FONTS.small,textAlign:'center',marginBottom:12,fontStyle:'italic'},
  loversBox:{width:'100%',maxWidth:380,borderRadius:20,padding:24,borderWidth:2,alignItems:'center',marginBottom:24},
  loversEmoji:{fontSize:52,marginBottom:10},
  loverName:{fontSize:20,fontWeight:'800',marginBottom:4},
  loversNote:{...FONTS.small,textAlign:'center',lineHeight:20,marginTop:12},
});
