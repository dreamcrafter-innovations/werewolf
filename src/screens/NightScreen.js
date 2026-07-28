import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { usePalette } from '../hooks/usePalette';
import { fill } from '../utils/interpolate';
import Gradient from '../components/Gradient';
import TabletContainer from '../components/TabletContainer';
import { FONTS } from '../components/theme';
import { getRandomProphecy } from '../data/roles';
import { getNightSteps } from '../utils/gameLogic';
import { useSpeech } from '../hooks/useSpeech';
import { getActiveVillainTheme, getTheme } from '../data/villainThemes';
import { haptics } from '../utils/haptics';

export default function NightScreen({ navigation }) {
  const { state, villainTheme, setVillainTarget, setHealerProtect, setSeerCheck, resolveNight } = useGame();
  const { t } = useLanguage();
  const C = usePalette();
  const { players, round } = state;
  const alive = players.filter(p=>p.isAlive);
  const aliveVillains = alive.filter(p=>p.role==='VILLAIN');
  // Mixed-villain mode: alive villains may carry different theme overrides —
  // combine them for the shared "wake up" narration each night.
  const activeVillainTheme = getActiveVillainTheme(aliveVillains, state.villainThemeId);
  const steps = getNightSteps(alive);
  const [stepIdx, setStepIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [seerResult, setSeerResult] = useState(null);
  const [seerResultTheme, setSeerResultTheme] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const prophecy = useRef(getRandomProphecy()).current;
  const step = steps[stepIdx];
  const { speak, stop } = useSpeech();

  // Build step metadata — villain night wake comes from theme
  const getMetaForStep = (s) => {
    const vn = villainTheme.roles?.HEALER?.name  || 'Healer';
    const ve = villainTheme.roles?.HEALER?.emoji || '🌿';
    const tn = villainTheme.roles?.SEER?.name  || 'Seer';
    const te = villainTheme.roles?.SEER?.emoji || '🔮';
    switch(s) {
      case 'INTRO':   return { icon:'🌑', title:t('night_intro_title'),   script:t('night_intro_script'),   action:null,                    bg:[C.bg,'#02020E'] };
      case 'VILLAIN':  return { icon:activeVillainTheme.emoji, title:activeVillainTheme.nightWake, script:activeVillainTheme.nightInstruction, action:t('night_choose_target'), bg:[activeVillainTheme.bgColor||C.bg,'#050000'] };
      case 'HEALER':  return { icon:ve, title:`${vn}, wake up!`, script:`${vn}, open your eyes.\nWhich player do you want to protect tonight?\n\n(You can protect yourself too — but only once!) 💊`, action:t('night_protect'), bg:[C.bg,'#000810'] };
      case 'SEER': return { icon:te, title:`${tn}, wake up!`, script:`${tn}, open your eyes.\nWhich player's identity do you want to check?\n\nThe result will ONLY be shown to you — tell no one! 🤫`, action:t('night_check'), bg:[C.bg,'#0D001A'] };
      case 'DAWN':    return { icon:'🌅', title:t('night_dawn_title'),    script:t('night_dawn_script'),    action:null,                    bg:['#1A0D00','#100A00'] };
      default:        return { icon:'🌑', title:'', script:'', action:null, bg:[C.bg,C.bg] };
    }
  };
  const meta = getMetaForStep(step);

  // Speak the opening step on mount (native only — web browsers require a prior user gesture)
  useEffect(() => { speak(getMetaForStep(steps[0]).script); }, []);

  useEffect(() => {
    fadeAnim.setValue(0); setSelected(null); setSeerResult(null);
    Animated.timing(fadeAnim,{toValue:1,duration:600,useNativeDriver:true}).start();
  }, [stepIdx]);

  useEffect(() => () => { stop(); }, []);

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
    if(meta.action && !selected) return; // selection required; use Skip to bypass
    if(meta.action) haptics.light(); // confirming a night-action target selection
    if(step==='VILLAIN'&&selected) setVillainTarget(selected);
    else if(step==='HEALER'&&selected) setHealerProtect(selected);
    else if(step==='SEER'&&selected) {
      setSeerCheck(selected);
      const target = players.find(p=>p.id===selected);
      const isEvil = target?.role==='VILLAIN';
      setSeerResult(isEvil?'EVIL':'INNOCENT');
      // Show the target's own villain theme (mixed-villain mode), not the aggregate one
      setSeerResultTheme(isEvil ? getTheme(target.villainThemeOverride || state.villainThemeId) : null);
      (isEvil ? haptics.warning : haptics.success)();
      setTimeout(()=>{ setSeerResult(null); setSeerResultTheme(null); advance(); }, 3000);
      return;
    }
    advance();
  };

  const selectable = alive.filter(p => {
    if(step==='SEER'){ const seer=players.find(q=>q.role==='SEER'); return seer?p.id!==seer.id:true; }
    return true;
  });

  return (
    <Gradient colors={meta.bg} style={styles.flex}>
      <SafeAreaView style={styles.safe}>
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

            <Animated.View style={[styles.body,{opacity:fadeAnim}]}>
              <Text style={styles.stepIcon}>{meta.icon}</Text>
              <Text style={[styles.stepTitle,{color:C.text}]}>{meta.title}</Text>

              <View style={[styles.narratorBox,{backgroundColor:C.primary+'15',borderColor:C.primary+'40'}]}>
                <Text style={[styles.narratorLabel,{color:C.primary}]}>{t('night_narrator_label')}</Text>
                <Text style={[styles.narratorText,{color:C.text}]}>{meta.script}</Text>
              </View>

              {meta.action&&(
                <View style={styles.selectionArea}>
                  <Text style={[styles.selectionTitle,{color:C.text}]}>{meta.action}:</Text>
                  <View style={styles.playerGrid}>
                    {selectable.map(p=>(
                      <Pressable key={p.id}
                        style={[styles.playerChip,{backgroundColor:C.card,borderColor:selected===p.id?C.primary:C.cardBorder},selected===p.id&&{backgroundColor:C.primary+'20'}]}
                        onPress={()=>setSelected(p.id)}>
                        <Text style={styles.chipAvatar}>{p.avatar}</Text>
                        <Text style={[styles.chipName,{color:selected===p.id?C.primary:C.textSecondary}]}>{p.name}</Text>
                        {selected===p.id&&<Text style={[styles.check,{color:C.primary}]}>✓</Text>}
                      </Pressable>
                    ))}
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
                  style={[styles.nextBtn,{backgroundColor:(meta.action&&!selected)?C.textDim:C.primary,shadowColor:C.primary}]}
                  onPress={handleNext}>
                  <Text style={styles.nextBtnTxt}>
                    {stepIdx===steps.length-1 ? t('night_dawn_btn') : t('night_continue')}
                  </Text>
                </Pressable>
              )}

              {meta.action&&!seerResult&&(
                <Pressable style={styles.skipBtn} onPress={()=>{setSelected(null);advance();}}>
                  <Text style={[styles.skipTxt,{color:C.textDim}]}>{t('night_skip')}</Text>
                </Pressable>
              )}
            </Animated.View>
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
});
