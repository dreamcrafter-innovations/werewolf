import React, { useState, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { usePalette } from '../hooks/usePalette';
import { fill } from '../utils/interpolate';
import Gradient from '../components/Gradient';
import TabletContainer from '../components/TabletContainer';
import { FONTS } from '../components/theme';
import { ROLES } from '../data/roles';
import { getTheme } from '../data/villainThemes';
import { haptics } from '../utils/haptics';
import { useKeepAwake } from 'expo-keep-awake';

export default function RoleRevealScreen({ navigation }) {
  useKeepAwake(); // passing the phone player-to-player takes minutes; screen must not sleep
  const { state, startNight, villainTheme } = useGame();
  const { t } = useLanguage();
  const C = usePalette();
  const { players, knowsAllies } = state;
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const revealAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const currentPlayer = players[idx];
  const baseRole = currentPlayer ? ROLES[currentPlayer.role] : null;
  // Mixed-villain mode: each VILLAIN player may carry a theme override
  const displayTheme = currentPlayer?.villainThemeOverride
    ? getTheme(currentPlayer.villainThemeOverride)
    : villainTheme;
  const themeRole = baseRole ? displayTheme.roles[currentPlayer.role] : null;

  const roleData = baseRole ? {
    ...baseRole,
    name: themeRole?.name ?? baseRole.name,
    emoji: themeRole?.emoji ?? baseRole.emoji,
    description: currentPlayer.role === 'VILLAIN'
      ? displayTheme.description
      : (themeRole?.description ?? baseRole.description),
    tagline: themeRole?.tagline ?? baseRole.tagline,
    color: currentPlayer.role==='VILLAIN' ? displayTheme.color : baseRole.color,
    bgColor: currentPlayer.role==='VILLAIN' ? displayTheme.bgColor : baseRole.bgColor,
  } : null;

  // DON is evil-team too (just Seer-proof) — still shown as an ally to other evils.
  const EVIL_ROLES = ['VILLAIN', 'DON'];
  const evilAllies = (EVIL_ROLES.includes(baseRole?.id) && knowsAllies)
    ? players.filter(p=>EVIL_ROLES.includes(p.role)&&p.id!==currentPlayer.id) : [];

  const revealCard = () => {
    haptics.medium();
    Animated.sequence([
      Animated.timing(scaleAnim,{toValue:0.93,duration:100,useNativeDriver:true}),
      Animated.timing(scaleAnim,{toValue:1.02,duration:150,useNativeDriver:true}),
      Animated.timing(scaleAnim,{toValue:1,duration:100,useNativeDriver:true}),
    ]).start();
    Animated.timing(revealAnim,{toValue:1,duration:350,useNativeDriver:true}).start();
    setTimeout(()=>setRevealed(true),50);
  };

  const goNext = () => {
    if(idx===players.length-1) setAllDone(true);
    else { revealAnim.setValue(0); setRevealed(false); setIdx(idx+1); }
  };

  if(allDone) return (
    <Gradient colors={villainTheme.gradientBg} style={styles.flex}>
      <SafeAreaView style={styles.safe}>
        <TabletContainer>
          <View style={styles.centered}>
            <Text style={styles.bigMoon}>{villainTheme.homeMoon}</Text>
            <Text style={[styles.doneTitle,{color:C.text}]}>{t('reveal_all_done_title')}</Text>
            <Text style={[styles.doneSub,{color:C.textSecondary}]}>{t('reveal_all_done_sub')}</Text>
            {/* replace, not navigate — Night is revisited every round and must remount
                fresh each time (see Night/Day/Vote for the full explanation) */}
            <Pressable style={[styles.nightBtn,{backgroundColor:C.primary,shadowColor:C.primary}]} onPress={()=>{startNight();navigation.replace('Night');}}>
              <Text style={styles.nightBtnTxt}>{t('reveal_start_night')}</Text>
            </Pressable>
          </View>
        </TabletContainer>
      </SafeAreaView>
    </Gradient>
  );

  return (
    <Gradient colors={villainTheme.gradientBg} style={styles.flex}>
      <SafeAreaView style={styles.safe}>
        <TabletContainer>
          <View style={styles.header}>
            <Text style={[styles.progress,{color:C.textSecondary}]}>{idx+1} / {players.length}</Text>
            <View style={[styles.bar,{backgroundColor:C.cardBorder}]}>
              {/* (idx+1) so this actually reaches 100% on the last card, matching the
                  "{idx+1} / {players.length}" label above it — it was previously always
                  one player short (e.g. 3/4 while viewing the 4th and final player). */}
              <View style={[styles.barFill,{width:`${((idx+1)/players.length)*100}%`,backgroundColor:C.primary}]}/>
            </View>
          </View>
          <View style={styles.centered}>
            <Text style={[styles.instruction,{color:C.text}]}>
              {revealed ? fill(t('reveal_check_role'),{name:currentPlayer.name}) : fill(t('reveal_pass_phone'),{name:`${currentPlayer.avatar} ${currentPlayer.name}`})}
            </Text>
            <Animated.View style={[styles.cardWrap,{transform:[{scale:scaleAnim}]}]}>
              {!revealed ? (
                <View style={[styles.card,{backgroundColor:C.surface,borderColor:C.cardBorder}]}>
                  <Text style={styles.hiddenMoon}>🌑</Text>
                  <Text style={[styles.hiddenTitle,{color:C.text}]}>{t('reveal_tap')}</Text>
                  <Text style={[styles.hiddenSub,{color:C.textSecondary}]}>{t('reveal_dont_show')}</Text>
                  <Pressable style={[styles.revealBtn,{backgroundColor:C.primary,shadowColor:C.primary}]} onPress={revealCard}>
                    <Text style={styles.revealBtnTxt}>{t('reveal_btn')}</Text>
                  </Pressable>
                </View>
              ) : (
                <Animated.View style={[styles.card,{backgroundColor:roleData.bgColor,borderColor:roleData.color,opacity:revealAnim}]}>
                  <Text style={styles.roleEmoji}>{roleData.emoji}</Text>
                  <Text style={[styles.roleName,{color:roleData.color}]}>{roleData.name}</Text>
                  <View style={[styles.divider,{backgroundColor:C.cardBorder}]}/>
                  <Text style={[styles.roleDesc,{color:C.text}]}>{roleData.description}</Text>
                  {evilAllies.length>0&&(
                    // displayTheme (not villainTheme) — a Villain in mixed-villain mode
                    // must see allies framed in their OWN theme, not whichever theme is
                    // currently previewed globally.
                    <View style={[styles.alliesBox,{borderColor:displayTheme.color}]}>
                      <Text style={[styles.alliesTitle,{color:displayTheme.color}]}>{fill(t('reveal_allies_title'),{villain:displayTheme.label})}</Text>
                      {evilAllies.map(p=><Text key={p.id} style={[styles.allyName,{color:C.text}]}>{p.avatar} {p.name}</Text>)}
                    </View>
                  )}
                  {/* was VILLAIN-only, so a Don with knowsAllies off saw neither this nor
                      the allies box above — a blank gap where a message should be */}
                  {EVIL_ROLES.includes(baseRole?.id)&&!knowsAllies&&(
                    <View style={[styles.alliesBox,{borderColor:C.cardBorder}]}>
                      <Text style={[styles.alliesTitle,{color:C.textSecondary}]}>{t('reveal_solo')}</Text>
                    </View>
                  )}
                  {roleData.secretNote&&(
                    <View style={[styles.secretBox,{backgroundColor:C.surface,borderColor:C.cardBorder}]}>
                      <Text style={[styles.secretTxt,{color:C.textSecondary}]}>🔒 {roleData.secretNote}</Text>
                    </View>
                  )}
                </Animated.View>
              )}
            </Animated.View>
            {revealed&&(
              <Pressable style={[styles.nextBtn,{backgroundColor:C.primary,shadowColor:C.primary}]} onPress={goNext}>
                <Text style={styles.nextBtnTxt}>{idx===players.length-1?t('reveal_done_btn'):t('reveal_next')}</Text>
              </Pressable>
            )}
            <View style={styles.dots}>
              {players.map((_,i)=>(
                <View key={i} style={[styles.dot,{backgroundColor:C.textDim},i===idx&&{backgroundColor:C.primary,width:20},i<idx&&{backgroundColor:C.village||'#27AE60'}]}/>
              ))}
            </View>
          </View>
        </TabletContainer>
      </SafeAreaView>
    </Gradient>
  );
}

const styles = StyleSheet.create({
  flex:{flex:1}, safe:{flex:1},
  header:{paddingHorizontal:24,paddingTop:16,paddingBottom:8},
  progress:{...FONTS.small,textAlign:'right',marginBottom:6},
  bar:{height:3,borderRadius:2}, barFill:{height:'100%',borderRadius:2},
  centered:{flex:1,alignItems:'center',justifyContent:'center',paddingHorizontal:24,paddingBottom:24},
  instruction:{...FONTS.subtitle,textAlign:'center',marginBottom:24},
  cardWrap:{width:'100%',maxWidth:320,alignItems:'center'},
  card:{width:'100%',borderRadius:24,padding:28,alignItems:'center',borderWidth:2,shadowColor:'#000',shadowOffset:{width:0,height:4},shadowOpacity:0.4,shadowRadius:8,elevation:5},
  hiddenMoon:{fontSize:60,marginBottom:12},
  hiddenTitle:{...FONTS.subtitle,textAlign:'center',marginBottom:8},
  hiddenSub:{...FONTS.small,textAlign:'center',marginBottom:24},
  revealBtn:{borderRadius:14,paddingHorizontal:28,paddingVertical:14,shadowOffset:{width:0,height:0},shadowOpacity:0.4,shadowRadius:10,elevation:5},
  revealBtnTxt:{color:'#000',fontWeight:'800',fontSize:16},
  roleEmoji:{fontSize:64,marginBottom:8},
  roleName:{fontSize:22,fontWeight:'800',marginBottom:12},
  divider:{width:40,height:1,marginBottom:12},
  roleDesc:{...FONTS.small,textAlign:'center',lineHeight:20},
  alliesBox:{marginTop:16,borderRadius:12,padding:12,borderWidth:1,width:'100%',alignItems:'center',backgroundColor:'rgba(0,0,0,0.2)'},
  alliesTitle:{...FONTS.small,fontWeight:'700',marginBottom:6},
  allyName:{...FONTS.body,marginBottom:2},
  secretBox:{marginTop:12,borderRadius:10,padding:10,borderWidth:1,width:'100%'},
  secretTxt:{...FONTS.small,textAlign:'center',fontStyle:'italic'},
  nextBtn:{marginTop:24,borderRadius:14,paddingHorizontal:32,paddingVertical:14,shadowOffset:{width:0,height:0},shadowOpacity:0.4,shadowRadius:10,elevation:5},
  nextBtnTxt:{color:'#000',fontWeight:'800',fontSize:16},
  dots:{flexDirection:'row',gap:8,marginTop:20},
  dot:{width:8,height:8,borderRadius:4},
  bigMoon:{fontSize:72,marginBottom:16},
  doneTitle:{...FONTS.subtitle,textAlign:'center',marginBottom:12},
  doneSub:{...FONTS.body,textAlign:'center',lineHeight:24,marginBottom:32},
  nightBtn:{borderRadius:16,paddingVertical:18,paddingHorizontal:40,shadowOffset:{width:0,height:0},shadowOpacity:0.4,shadowRadius:10,elevation:6},
  nightBtnTxt:{color:'#000',fontWeight:'800',fontSize:18},
});
