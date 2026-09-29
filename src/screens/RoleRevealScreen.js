import React, { useState, useRef, useCallback } from 'react';
import { View, Text, Animated, StyleSheet, BackHandler, ScrollView } from 'react-native';
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
import { ROLES } from '../data/roles';
import { getTheme } from '../data/villainThemes';
import { haptics } from '../utils/haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { useTheme } from '../context/ThemeContext';
import PlayingCard, { CardBack, Plaque, Ornament, useCardWidth } from '../components/PlayingCard';
import { cardTheme, readableOn, withAlpha } from '../theme/cardTheme';

import { Tap } from '../components/Tap';
export default function RoleRevealScreen({ navigation }) {
  useKeepAwake(undefined, { suppressDeactivateWarnings: true }); // passing the phone player-to-player takes minutes; screen must not sleep
  const { state, startNight, villainTheme } = useGame();
  const { t } = useLanguage();
  const C = usePalette();
  const { players, knowsAllies } = state;
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const revealAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  // Card flip: back squeezes to 0 on X, face springs out from 0 → 1
  const flipAnim = useRef(new Animated.Value(1)).current;
  // Gold card follows the Settings theme (the rest of the game screen follows the villain atmosphere)
  const { palette: settingsPalette, isDark } = useTheme();
  const ct = cardTheme(settingsPalette, isDark);
  const cardW = useCardWidth(340, 24);

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
    hint: themeRole?.hint ?? baseRole.hint,
    color: currentPlayer.role==='VILLAIN' ? displayTheme.color : baseRole.color,
    bgColor: currentPlayer.role==='VILLAIN' ? displayTheme.bgColor : baseRole.bgColor,
  } : null;

  // DON is evil-team too (just Seer-proof) — still shown as an ally to other evils.
  const EVIL_ROLES = ['VILLAIN', 'DON'];
  const evilAllies = (EVIL_ROLES.includes(baseRole?.id) && knowsAllies)
    ? players.filter(p=>EVIL_ROLES.includes(p.role)&&p.id!==currentPlayer.id) : [];

  // Roles are already dealt by the time this screen mounts. A hardware back press pops
  // straight to Setup, and the only way forward from there is Start Game — which
  // reshuffles every role, so whoever had already looked at their card is now holding
  // the wrong one with no way to find out. Swallow back once a card has been turned
  // over; before that, going back to fix a name is still harmless and still works.
  const revealStarted = revealed || idx > 0;
  useFocusEffect(
    useCallback(() => {
      if (!revealStarted) return undefined;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, [revealStarted])
  );

  const revealCard = () => {
    if (revealed) return;
    haptics.medium();
    Animated.timing(flipAnim,{toValue:0,duration:170,useNativeDriver:true}).start(()=>{
      setRevealed(true);
      revealAnim.setValue(1);
      Animated.sequence([
        Animated.spring(flipAnim,{toValue:1,friction:6,tension:140,useNativeDriver:true}),
      ]).start();
      Animated.sequence([
        Animated.timing(scaleAnim,{toValue:1.04,duration:150,useNativeDriver:true}),
        Animated.timing(scaleAnim,{toValue:1,duration:120,useNativeDriver:true}),
      ]).start();
    });
  };

  const goNext = () => {
    if(idx===players.length-1) setAllDone(true);
    else { revealAnim.setValue(0); flipAnim.setValue(1); setRevealed(false); setIdx(idx+1); }
  };

  // Role / team inks — nudged to stay readable on whichever card face the Settings theme gives
  const roleInk   = roleData ? readableOn(roleData.color, ct.face, 4.5) : ct.ink;
  const roleTitle = roleData ? readableOn(roleData.color, ct.face, 3) : ct.ink;
  const evilInk   = readableOn(displayTheme.color || '#C0392B', ct.face, 4.5);
  const team      = baseRole?.team;
  const teamInk   = team==='evil' ? evilInk : team==='neutral' ? readableOn('#9B59B6', ct.face, 4.5) : readableOn('#27AE60', ct.face, 4.5);
  const teamLabel = team==='evil' ? t('reveal_team_evil') : team==='neutral' ? t('reveal_team_neutral') : t('reveal_team_good');

  if(allDone) return (
    <Gradient colors={villainTheme.gradientBg} style={styles.flex}>
      <SafeAreaView style={styles.safe}>
        <AbandonGameButton navigation={navigation} />
        <TabletContainer>
          <ScrollView style={styles.scrollFlex} contentContainerStyle={styles.centered} showsVerticalScrollIndicator={false}>
            <Text style={styles.bigMoon}>{villainTheme.homeMoon}</Text>
            <Text style={[styles.doneTitle,{color:C.text}]}>{t('reveal_all_done_title')}</Text>
            <Text style={[styles.doneSub,{color:C.textSecondary}]}>{t('reveal_all_done_sub')}</Text>
            {/* replace, not navigate — Night is revisited every round and must remount
                fresh each time (see Night/Day/Vote for the full explanation) */}
            <Tap style={[styles.nightBtn,{backgroundColor:C.primary,shadowColor:C.primary}]} onPress={()=>{startNight();navigation.replace('Night');}}>
              <Text style={styles.nightBtnTxt}>{t('reveal_start_night')}</Text>
            </Tap>
          </ScrollView>
        </TabletContainer>
      </SafeAreaView>
    </Gradient>
  );

  return (
    <Gradient colors={villainTheme.gradientBg} style={styles.flex}>
      <SafeAreaView style={styles.safe}>
        <AbandonGameButton navigation={navigation} />
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
          <ScrollView style={styles.scrollFlex} contentContainerStyle={styles.centered} showsVerticalScrollIndicator={false}>
            <Text style={[styles.instruction,{color:C.text}]}>
              {revealed ? fill(t('reveal_check_role'),{name:currentPlayer.name}) : fill(t('reveal_pass_phone'),{name:`${currentPlayer.avatar} ${currentPlayer.name}`})}
            </Text>
            <Animated.View style={[styles.cardWrap,{transform:[{scale:scaleAnim},{scaleX:flipAnim}]}]}>
              {!revealed ? (
                <Tap
                  onPress={revealCard}
                  accessibilityRole="button"
                  accessibilityLabel={`${currentPlayer.name} — ${t('reveal_btn')}`}
                >
                  <CardBack
                    theme={ct}
                    width={cardW}
                    monogram={villainTheme.homeMoon || '🌑'}
                    title={`${currentPlayer.avatar} ${currentPlayer.name}`}
                    subtitle={t('reveal_tap')}
                    caption={t('reveal_dont_show')}
                  />
                </Tap>
              ) : (
                <PlayingCard theme={ct} width={cardW} cornerGlyph={roleData.emoji} cornerRank={(roleData.name||'?').charAt(0).toUpperCase()}>
                  {/* Name banner */}
                  <Text style={[styles.cardName,{color:ct.ink}]} numberOfLines={1} maxFontSizeMultiplier={1.2}>
                    {currentPlayer.avatar} {currentPlayer.name}
                  </Text>
                  {/* Role medallion */}
                  <View style={[styles.medal,{borderColor:ct.metalBright,backgroundColor:withAlpha(roleInk,0.14)}]}>
                    <View style={[styles.medalInner,{borderColor:ct.metal}]}>
                      <Text style={styles.roleEmoji}>{roleData.emoji}</Text>
                    </View>
                  </View>
                  <Text style={[styles.roleName,{color:roleTitle}]} maxFontSizeMultiplier={1.2}>{roleData.name}</Text>
                  <View style={[styles.teamChip,{borderColor:withAlpha(teamInk,0.5),backgroundColor:withAlpha(teamInk,0.10)}]}>
                    <Text style={[styles.teamChipTxt,{color:teamInk}]}>{teamLabel}</Text>
                  </View>
                  <Ornament theme={ct} />
                  {!!roleData.hint&&(
                    <Plaque theme={ct} label={t('reveal_power_label')} value={roleData.hint} />
                  )}
                  <Text style={[styles.roleDesc,{color:ct.ink}]}>{roleData.description}</Text>
                  {evilAllies.length>0&&(
                    // displayTheme (not villainTheme) — a Villain in mixed-villain mode
                    // must see allies framed in their OWN theme, not whichever theme is
                    // currently previewed globally.
                    <Plaque
                      theme={ct}
                      tone={{border:withAlpha(evilInk,0.5),bg:withAlpha(evilInk,0.10),label:evilInk,value:ct.ink}}
                      label={fill(t('reveal_allies_title'),{villain:displayTheme.label})}
                      value={evilAllies.map(p=>`${p.avatar} ${p.name}`).join('\n')}
                    />
                  )}
                  {/* was VILLAIN-only, so a Don with knowsAllies off saw neither this nor
                      the allies box above — a blank gap where a message should be */}
                  {EVIL_ROLES.includes(baseRole?.id)&&!knowsAllies&&(
                    <Plaque theme={ct} value={t('reveal_solo')} />
                  )}
                  {roleData.secretNote&&(
                    <Text style={[styles.secretTxt,{color:ct.inkMuted}]}>🔒 {roleData.secretNote}</Text>
                  )}
                </PlayingCard>
              )}
            </Animated.View>
            {!revealed&&(
              <Tap style={[styles.revealBtn,{backgroundColor:C.primary,shadowColor:C.primary}]} onPress={revealCard}>
                <Text style={styles.revealBtnTxt}>{t('reveal_btn')}</Text>
              </Tap>
            )}
            {revealed&&(
              <Tap style={[styles.nextBtn,{backgroundColor:C.primary,shadowColor:C.primary}]} onPress={goNext}>
                <Text style={styles.nextBtnTxt}>{idx===players.length-1?t('reveal_done_btn'):t('reveal_next')}</Text>
              </Tap>
            )}
            <View style={styles.dots}>
              {players.map((_,i)=>(
                <View key={i} style={[styles.dot,{backgroundColor:C.textDim},i===idx&&{backgroundColor:C.primary,width:20},i<idx&&{backgroundColor:C.village||'#27AE60'}]}/>
              ))}
            </View>
          </ScrollView>
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
  scrollFlex:{flex:1,width:'100%'},
  centered:{flexGrow:1,alignItems:'center',justifyContent:'center',paddingHorizontal:24,paddingBottom:24,width:'100%'},
  instruction:{...FONTS.subtitle,textAlign:'center',marginBottom:24},
  cardWrap:{width:'100%',alignItems:'center'},
  card:{width:'100%',borderRadius:24,padding:28,alignItems:'center',borderWidth:2,shadowColor:'#000',shadowOffset:{width:0,height:4},shadowOpacity:0.4,shadowRadius:8,elevation:5},
  hiddenMoon:{fontSize:60,marginBottom:12},
  hiddenTitle:{...FONTS.subtitle,textAlign:'center',marginBottom:8},
  hiddenSub:{...FONTS.small,textAlign:'center',marginBottom:24},
  revealBtn:{marginTop:20,borderRadius:14,paddingHorizontal:28,paddingVertical:14,shadowOffset:{width:0,height:0},shadowOpacity:0.4,shadowRadius:10,elevation:5},
  revealBtnTxt:{color:'#000',fontWeight:'800',fontSize:16},
  cardName:{fontSize:18,fontWeight:'900',letterSpacing:0.4,textAlign:'center',maxWidth:'100%',paddingHorizontal:18},
  medal:{width:96,height:96,borderRadius:48,borderWidth:3,alignItems:'center',justifyContent:'center'},
  medalInner:{width:82,height:82,borderRadius:41,borderWidth:1,alignItems:'center',justifyContent:'center'},
  roleEmoji:{fontSize:46},
  roleName:{fontSize:26,fontWeight:'900',textAlign:'center'},
  teamChip:{paddingHorizontal:14,paddingVertical:4,borderRadius:999,borderWidth:1},
  teamChipTxt:{fontSize:11,fontWeight:'900',letterSpacing:1.2,textTransform:'uppercase'},
  roleDesc:{...FONTS.small,textAlign:'center',lineHeight:20},
  alliesBox:{marginTop:16,borderRadius:12,padding:12,borderWidth:1,width:'100%',alignItems:'center',backgroundColor:'rgba(0,0,0,0.2)'},
  alliesTitle:{...FONTS.small,fontWeight:'700',marginBottom:6},
  allyName:{...FONTS.body,marginBottom:2},
  secretBox:{marginTop:12,borderRadius:10,padding:10,borderWidth:1,width:'100%'},
  secretTxt:{...FONTS.small,textAlign:'center',fontStyle:'italic',lineHeight:18},
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
