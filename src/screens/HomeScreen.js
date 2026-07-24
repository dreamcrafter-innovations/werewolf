import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, ScrollView, FlatList, Switch, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { usePalette } from '../hooks/usePalette';
import Gradient from '../components/Gradient';
import TabletContainer from '../components/TabletContainer';
import { FONTS } from '../components/theme';
import { VILLAIN_THEME_LIST } from '../data/villainThemes';
import { ROLES } from '../data/roles';
import { logThemeSelected, logScreenView } from '../utils/analytics';
import { loadSettings, saveSettings } from '../storage';

export default function HomeScreen({ navigation }) {
  const { resetGame, state, setVillainTheme, toggleThemeSelect, selectAllThemes, setKnowsAllies, setVillainCount, setAllowGhostVotes, villainTheme } = useGame();
  const { t } = useLanguage();
  const C = usePalette();
  const moonPulse = useRef(new Animated.Value(1)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(0.85)).current;
  const [showInternational, setShowInternational] = useState(false);
  const [narratorEnabled, setNarratorEnabled] = useState(false);
  const [themeScrollInfo, setThemeScrollInfo] = useState({ canLeft: false, canRight: true });
  const themeFlatListRef = useRef(null);
  const themeLeftOpacity  = useRef(new Animated.Value(0)).current;
  const themeRightOpacity = useRef(new Animated.Value(1)).current;
  const { width: screenWidth } = useWindowDimensions();
  const visibleThemes = VILLAIN_THEME_LIST.filter(th => !th.international || showInternational);

  useEffect(() => {
    logScreenView('HomeScreen');
    loadSettings().then(s => {
      if (s?.narratorEnabled !== undefined) setNarratorEnabled(s.narratorEnabled);
    });
    Animated.sequence([
      Animated.timing(titleFade, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(btnScale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(moonPulse, { toValue: 1.1, duration: 2200, useNativeDriver: true }),
      Animated.timing(moonPulse, { toValue: 1.0, duration: 2200, useNativeDriver: true }),
    ])).start();
  }, []);

  async function toggleNarrator() {
    const next = !narratorEnabled;
    setNarratorEnabled(next);
    const s = (await loadSettings()) ?? {};
    await saveSettings({ ...s, narratorEnabled: next });
  }

  // When the visible theme list changes (international toggle), reset right-arrow and scroll to start
  useEffect(() => {
    setThemeScrollInfo({ canLeft: false, canRight: true });
    Animated.parallel([
      Animated.timing(themeLeftOpacity,  { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(themeRightOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    themeFlatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [showInternational]);

  const handleThemeScroll = useCallback((e) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const x = contentOffset.x;
    const maxX = contentSize.width - layoutMeasurement.width;
    const canLeft  = x > 8;
    const canRight = x < maxX - 8;
    setThemeScrollInfo(prev => {
      if (prev.canLeft === canLeft && prev.canRight === canRight) return prev;
      Animated.parallel([
        Animated.timing(themeLeftOpacity,  { toValue: canLeft  ? 1 : 0, duration: 200, useNativeDriver: true }),
        Animated.timing(themeRightOpacity, { toValue: canRight ? 1 : 0, duration: 200, useNativeDriver: true }),
      ]).start();
      return { canLeft, canRight };
    });
  }, [themeLeftOpacity, themeRightOpacity]);

  return (
    <Gradient colors={villainTheme.gradientBg} style={styles.flex}>
      <SafeAreaView style={styles.safe}>
        <TabletContainer>
          <ScrollView style={styles.scroller} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            <View style={styles.starsRow}>
              {['✦','✧','✦','✧','✦','✧','✦'].map((s,i)=>(
                <Text key={i} style={[styles.star,{opacity:0.25+(i%3)*0.2}]}>{s}</Text>
              ))}
            </View>

            <Animated.View style={[styles.moonWrap,{transform:[{scale:moonPulse}]}]}>
              <Text style={styles.moon}>{villainTheme.homeMoon}</Text>
              <Text style={styles.villainEmoji}>{villainTheme.emoji}</Text>
            </Animated.View>

            <View style={styles.villageRow}>
              {['🏚️','🌲','🏚️','🌳','🏚️'].map((e,i)=><Text key={i} style={styles.villageEmoji}>{e}</Text>)}
            </View>

            <Animated.View style={{opacity:titleFade}}>
              <Text style={[styles.titleMain,{color:C.primary,textShadowColor:C.primary}]}>{t('home_title')}</Text>
              <Text style={[styles.titleSub,{color:C.textSecondary}]}>{villainTheme.tagline}</Text>
              <Text style={[styles.tagline,{color:C.textSecondary}]}>{villainTheme.atmosphere}</Text>
            </Animated.View>

            <View style={[styles.divider,{backgroundColor:C.primary}]} />

            {/* Villain */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionLabel,{color:C.textDim,marginBottom:0}]}>{t('home_choose_villain')}</Text>
              <Pressable
                style={[styles.intlToggle, showInternational && {borderColor:'#4A90D9', backgroundColor:'#4A90D925'}]}
                onPress={()=>setShowInternational(v=>!v)}
              >
                <Text style={[styles.intlToggleText,{color:showInternational?'#4A90D9':C.textDim}]}>🌍 International</Text>
              </Pressable>
            </View>
            <View style={styles.themeScrollWrapper}>
              {/* Left fade + arrow — appears after user scrolls right */}
              <Animated.View style={[styles.themeEdge, styles.themeEdgeLeft, { opacity: themeLeftOpacity }]} pointerEvents="none">
                <Text style={[styles.themeEdgeArrow, { color: C.primary }]}>‹</Text>
              </Animated.View>

              <FlatList
                ref={themeFlatListRef}
                data={visibleThemes}
                keyExtractor={th=>th.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{alignSelf:'stretch'}}
                nestedScrollEnabled
                onScroll={handleThemeScroll}
                scrollEventThrottle={16}
                contentContainerStyle={styles.rowList}
                ListHeaderComponent={
                  <Pressable
                    style={[styles.themeCard,{
                      backgroundColor: C.card,
                      borderColor: C.cardBorder,
                    }]}
                    onPress={()=>{
                      const randomId = visibleThemes[Math.floor(Math.random()*visibleThemes.length)].id;
                      setVillainTheme(randomId);
                      logThemeSelected('RANDOM');
                    }}>
                    <Text style={styles.themeEmoji}>🎲</Text>
                    <Text style={[styles.themeLabel,{color:C.text}]}>Random</Text>
                    <Text style={[styles.themeSub,{color:C.textDim}]}>All themes</Text>
                  </Pressable>
                }
                renderItem={({item})=>{
                  const sel = state.selectedThemeIds.includes(item.id);
                  return (
                    <Pressable style={[styles.themeCard,{backgroundColor:sel?item.color+'25':C.card,borderColor:sel?item.color:C.cardBorder}]}
                      onPress={()=>{setVillainTheme(item.id);logThemeSelected(item.id);}}>
                      <Text style={styles.themeEmoji}>{item.emoji}</Text>
                      <Text style={[styles.themeLabel,{color:sel?item.color:C.text}]}>{item.label}</Text>
                      <Text style={[styles.themeSub,{color:C.textDim}]}>{item.sublabel}</Text>
                      {sel&&<View style={[styles.selDot,{backgroundColor:item.color}]}/>}
                      {sel&&<Text style={[styles.selCheck,{color:item.color}]}>✓</Text>}
                    </Pressable>
                  );
                }}
              />

              {/* Right fade + arrow — fades out when end reached */}
              <Animated.View style={[styles.themeEdge, styles.themeEdgeRight, { opacity: themeRightOpacity }]} pointerEvents="none">
                <Text style={[styles.themeEdgeArrow, { color: C.primary }]}>›</Text>
              </Animated.View>
            </View>

            {/* Scroll hint pill — only visible before first scroll */}
            {!themeScrollInfo.canLeft && themeScrollInfo.canRight && (
              <View style={[styles.scrollHintPill, { borderColor: C.cardBorder }]}>
                <Text style={[styles.scrollHintText, { color: C.textDim }]}>‹  swipe to see more themes  ›</Text>
              </View>
            )}
            {!showInternational&&(
              <Pressable onPress={()=>setShowInternational(true)}>
                <Text style={[styles.randomHint,{color:C.textDim}]}>🌍 Tap to show international villain themes</Text>
              </Pressable>
            )}

            {/* Evil mode settings — side by side */}
            <Text style={[styles.sectionLabel,{color:C.textDim,marginTop:20}]}>{t('home_evil_mode')}</Text>
            <View style={styles.settingsPair}>
              {/* Knows Allies */}
              <View style={[styles.settingCard,{backgroundColor:C.card,borderColor:C.cardBorder}]}>
                <Text style={[styles.settingCardTitle,{color:C.text}]}>
                  {state.knowsAllies?t('home_knows_allies_on'):t('home_knows_allies_off')}
                </Text>
                <Text style={[styles.settingCardSub,{color:C.textSecondary}]}>
                  {state.knowsAllies?t('home_knows_allies_on_sub'):t('home_knows_allies_off_sub')}
                </Text>
                <Switch value={state.knowsAllies} onValueChange={setKnowsAllies}
                  trackColor={{false:C.cardBorder,true:C.primary}} thumbColor={C.white}
                  style={{marginTop:10,alignSelf:'flex-start'}}/>
              </View>
              {/* Evil Players */}
              <View style={[styles.settingCard,{backgroundColor:C.card,borderColor:C.cardBorder}]}>
                <Text style={[styles.settingCardTitle,{color:C.text}]}>🎭 Evil Players</Text>
                <Text style={[styles.settingCardSub,{color:C.textSecondary}]}>
                  {state.villainCount === 0 ? 'Auto — scales with count' : `${state.villainCount} evil player${state.villainCount > 1 ? 's' : ''}`}
                </Text>
                <View style={[styles.stepperRow,{marginTop:10}]}>
                  <Pressable
                    style={[styles.stepBtn,{borderColor:C.cardBorder},state.villainCount<=0&&{opacity:0.3}]}
                    onPress={()=>setVillainCount(Math.max(0,state.villainCount-1))}
                    disabled={state.villainCount<=0}
                  >
                    <Text style={[styles.stepBtnText,{color:C.text}]}>−</Text>
                  </Pressable>
                  <Text style={[styles.stepVal,{color:C.primary}]}>
                    {state.villainCount===0?'Auto':state.villainCount}
                  </Text>
                  <Pressable
                    style={[styles.stepBtn,{borderColor:C.cardBorder},state.villainCount>=3&&{opacity:0.3}]}
                    onPress={()=>setVillainCount(Math.min(3,state.villainCount+1))}
                    disabled={state.villainCount>=3}
                  >
                    <Text style={[styles.stepBtnText,{color:C.text}]}>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={styles.settingsPair}>
              <View style={[styles.settingCard,{backgroundColor:C.card,borderColor:C.cardBorder}]}>
                <Text style={[styles.settingCardTitle,{color:C.text}]}>
                  {villainTheme.afterlifeEmoji} {villainTheme.afterlifeTerm} Vote Mode
                </Text>
                <Text style={[styles.settingCardSub,{color:C.textSecondary}]}>
                  Eliminated players can still vote as {villainTheme.afterlifeTerm.toLowerCase()}. Their votes count as half, and they vote in silence.
                </Text>
                <Switch value={state.allowGhostVotes} onValueChange={setAllowGhostVotes}
                  trackColor={{false:C.cardBorder,true:C.primary}} thumbColor={C.white}
                  style={{marginTop:10,alignSelf:'flex-start'}}/>
              </View>
              <View style={[styles.settingCard,{backgroundColor:C.card,borderColor:C.cardBorder}]}>
                <Text style={[styles.settingCardTitle,{color:C.text}]}>🎙️ Voice Narration</Text>
                <Text style={[styles.settingCardSub,{color:C.textSecondary}]}>
                  Reads night-phase narrator prompts aloud using text-to-speech.
                </Text>
                <Switch value={narratorEnabled} onValueChange={toggleNarrator}
                  trackColor={{false:C.cardBorder,true:C.primary}} thumbColor={C.white}
                  style={{marginTop:10,alignSelf:'flex-start'}}/>
              </View>
            </View>

            {/* Role cards — expanded 2-column grid with theme-specific hints */}
            <View style={styles.rolesGrid}>
              {Object.entries(villainTheme.roles).map(([roleKey, r])=>{
                const hint = r.hint || ROLES[roleKey]?.hint;
                const isEvil = roleKey === 'VILLAIN';
                const color = isEvil ? villainTheme.color : (ROLES[roleKey]?.color || C.textSecondary);
                return (
                  <View key={roleKey} style={[styles.roleCard,{backgroundColor:C.card,borderColor:color+'44'}]}>
                    <Text style={styles.roleCardEmoji}>{r.emoji}</Text>
                    <Text style={[styles.roleCardName,{color}]}>{r.name}</Text>
                    <Text style={[styles.roleCardHint,{color:C.textDim}]}>{hint}</Text>
                  </View>
                );
              })}
            </View>

            <Animated.View style={[styles.btnWrap,{transform:[{scale:btnScale}]}]}>
              <Pressable style={({pressed})=>[styles.btn,{backgroundColor:C.primary,shadowColor:C.primary},pressed&&{opacity:0.8}]}
                onPress={()=>{
                  resetGame(state.villainThemeId);
                  navigation.navigate('Setup');
                }}>
                <Text style={styles.btnText}>{t('home_start_btn')}</Text>
              </Pressable>
            </Animated.View>

            <Pressable
              style={[styles.howToBtn,{borderColor:C.cardBorder}]}
              onPress={()=>navigation.navigate('HowToPlay')}
            >
              <Text style={[styles.howToBtnText,{color:C.textSecondary}]}>❓ How to Play</Text>
            </Pressable>

            <Text style={[styles.note,{color:C.textDim}]}>{t('home_player_note')}</Text>
          </ScrollView>
        </TabletContainer>
      </SafeAreaView>
    </Gradient>
  );
}

const styles = StyleSheet.create({
  flex:{flex:1}, safe:{flex:1}, scroller:{flex:1},
  scroll:{flexGrow:1,alignItems:'center',paddingHorizontal:24,paddingBottom:100},
  starsRow:{flexDirection:'row',marginTop:12,gap:10},
  star:{color:'#FFF8DC',fontSize:12},
  moonWrap:{alignItems:'center',marginTop:8},
  moon:{fontSize:64}, villainEmoji:{fontSize:40,marginTop:-16},
  villageRow:{flexDirection:'row',marginTop:4,gap:4},
  villageEmoji:{fontSize:28},
  titleMain:{...FONTS.title,fontSize:34,textAlign:'center',marginTop:16,textShadowOffset:{width:0,height:0},textShadowRadius:12},
  titleSub:{...FONTS.label,fontSize:13,textAlign:'center',letterSpacing:4,marginTop:4},
  tagline:{...FONTS.body,textAlign:'center',fontStyle:'italic',marginTop:6},
  divider:{width:60,height:2,borderRadius:1,marginVertical:20,opacity:0.5},
  sectionHeaderRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',width:'100%',marginBottom:12},
  sectionLabel:{...FONTS.label,letterSpacing:3,alignSelf:'flex-start'},
  intlToggle:{borderRadius:8,borderWidth:1,borderColor:'#555',paddingHorizontal:8,paddingVertical:4},
  intlToggleText:{fontSize:11,fontWeight:'600'},
  rowList:{paddingBottom:4,gap:8},
  themeScrollWrapper:{alignSelf:'stretch',position:'relative'},
  themeEdge:{position:'absolute',top:0,bottom:0,width:36,zIndex:10,alignItems:'center',justifyContent:'center'},
  themeEdgeLeft:{left:0},
  themeEdgeRight:{right:0},
  themeEdgeArrow:{fontSize:22,fontWeight:'700',textShadowOffset:{width:0,height:0},textShadowRadius:6,opacity:0.9},
  scrollHintPill:{alignSelf:'center',marginTop:6,borderRadius:20,borderWidth:1,paddingHorizontal:12,paddingVertical:3},
  scrollHintText:{fontSize:11,letterSpacing:1},
  langCard:{alignItems:'center',borderRadius:14,borderWidth:2,paddingHorizontal:12,paddingVertical:10,minWidth:72,position:'relative'},
  langEmoji:{fontSize:22},
  langLabel:{...FONTS.small,marginTop:4,fontWeight:'600',textAlign:'center'},
  themeCard:{alignItems:'center',borderRadius:16,borderWidth:2,paddingHorizontal:14,paddingVertical:12,minWidth:80,position:'relative'},
  themeEmoji:{fontSize:32},
  themeLabel:{...FONTS.small,fontWeight:'700',marginTop:4},
  themeSub:{...FONTS.small,fontSize:10,marginTop:1},
  selDot:{width:6,height:6,borderRadius:3,position:'absolute',bottom:6},
  selCheck:{position:'absolute',top:5,right:7,fontSize:11,fontWeight:'900'},
  randomHint:{...FONTS.small,alignSelf:'flex-start',marginTop:6,fontStyle:'italic'},
  toggleRow:{flexDirection:'row',alignItems:'center',borderRadius:14,padding:14,borderWidth:1,gap:12},
  toggleLabel:{...FONTS.body,fontWeight:'600'},
  toggleSub:{...FONTS.small,marginTop:2},
  settingsPair:{flexDirection:'row',gap:10,alignSelf:'stretch'},
  settingCard:{flex:1,borderRadius:14,borderWidth:1,padding:12},
  ghostVoteCard:{borderRadius:14,borderWidth:1,padding:12,marginTop:10,alignSelf:'stretch'},
  settingCardTitle:{...FONTS.body,fontWeight:'600',fontSize:12},
  settingCardSub:{...FONTS.small,marginTop:3,fontSize:10,lineHeight:14},
  stepperRow:{flexDirection:'row',alignItems:'center',gap:6},
  stepBtn:{width:32,height:32,borderRadius:8,borderWidth:1,alignItems:'center',justifyContent:'center'},
  stepBtnText:{fontSize:20,fontWeight:'700',lineHeight:26},
  stepVal:{fontSize:15,fontWeight:'800',minWidth:36,textAlign:'center'},
  rolesGrid:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:16,alignSelf:'stretch'},
  roleCard:{alignItems:'center',borderRadius:12,borderWidth:1,padding:12,width:'48%'},
  roleCardEmoji:{fontSize:28},
  roleCardName:{...FONTS.body,fontWeight:'700',marginTop:4,textAlign:'center',fontSize:13},
  roleCardHint:{fontSize:10,textAlign:'center',marginTop:5,lineHeight:14},
  btnWrap:{marginTop:24,width:'100%',maxWidth:320},
  btn:{borderRadius:16,paddingVertical:18,alignItems:'center',shadowOffset:{width:0,height:0},shadowOpacity:0.4,shadowRadius:10,elevation:6},
  btnText:{...FONTS.subtitle,color:'#000',fontWeight:'800',fontSize:18},
  howToBtn:{marginTop:14,borderRadius:12,borderWidth:1,paddingVertical:11,paddingHorizontal:24,alignItems:'center',width:'100%',maxWidth:320},
  howToBtnText:{fontSize:14,fontWeight:'600'},
  note:{...FONTS.small,textAlign:'center',marginTop:20},
});
