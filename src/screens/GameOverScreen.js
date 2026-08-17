import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Pressable, Animated, ScrollView, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { usePalette } from '../hooks/usePalette';
import { fill } from '../utils/interpolate';
import Gradient from '../components/Gradient';
import TabletContainer from '../components/TabletContainer';
import { FONTS } from '../components/theme';
import { ROLES } from '../data/roles';
import { logGameCompleted, logScreenView } from '../utils/analytics';
import { recordRoundResult, loadAlltimeStats, loadEarnedBadges, awardBadge, recordGamePlayed } from '../storage';
import Confetti from '../components/Confetti';
import ParticleField from '../components/ParticleField';
import ResultShareCard from '../components/ResultShareCard';
import { getCaughtParticles, getKillParticles, VILLAGE_WIN_PARTICLES } from '../data/themeParticles';
import { shareResultCard } from '../utils/shareResult';
import OutcomeHero from '../components/OutcomeHero';
import { evaluateBadges, BADGES } from '../data/badges';
import { getActiveVillainTheme, getTheme } from '../data/villainThemes';
import { haptics } from '../utils/haptics';

let ViewShot = null;
try { ViewShot = require('react-native-view-shot').default; } catch (_) {}

export default function GameOverScreen({ navigation }) {
  const { state, resetGame, villainTheme } = useGame();
  const { t } = useLanguage();
  const C = usePalette();
  const { winner, players, round, log = [] } = state;
  const jester = players.find(p => p.role === 'JESTER');

  // Mixed-villain mode: the recap should reflect every monster theme that was actually
  // in this game, not just whichever theme happened to be last-selected on Home.
  const allVillains = players.filter(p => p.role === 'VILLAIN');
  const activeVillainTheme = getActiveVillainTheme(allVillains, state.villainThemeId);

  const lovers = players.filter(p => p.loverId);

  const meta = winner==='LOVERS' ? {
    icon:'💞', title:'THE LOVERS WIN!',
    sub:lovers.map(p=>p.name).join(' ❤️ '),
    body:'Bound across enemy lines, they outlived everyone who tried to come between them. The village lost. The monsters lost. Love, improbably, did not. 💞',
    bg:['#1A0010','#0A0006'],
    accentColor:ROLES.CUPID.color,
  } : winner==='JESTER' ? {
    // The Jester beats both teams outright, so it gets its own ending rather than being
    // squeezed into the village/evil ternary.
    icon:'🃏', title:'THE JESTER WINS!', sub:`${jester?.name ?? 'The Jester'} played you all.`,
    body:`The village walked right into it. ${jester?.name ?? 'The Jester'} wanted to be voted out — and you obliged. Village and villains both lose. 🃏`,
    bg:['#1A0014','#0A0008'],
    accentColor:ROLES.JESTER.color,
  } : winner==='VILLAGE' ? {
    icon:'🎉', title:t('over_village_title'), sub:t('over_village_sub'),
    villainSub: activeVillainTheme.loseText,
    body:t('over_village_body'), bg:['#001A08','#002A10'],
    accentColor:C.village||'#27AE60',
  } : {
    icon:activeVillainTheme.emoji, title:activeVillainTheme.winText, sub:activeVillainTheme.winSubText || 'The village has fallen.',
    body:`The villagers never figured it out. Darkness swallowed the village. The ${activeVillainTheme.label}s reign supreme! 🌑`,
    bg:[activeVillainTheme.bgColor,'#000'],
    accentColor:activeVillainTheme.color,
  };

  const scaleAnim  = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const shareRef   = useRef(null);
  const [sharing, setSharing] = useState(false);
  const [newBadges, setNewBadges] = useState([]);

  const isVillageWin  = winner === 'VILLAGE';
  const killParticles = getKillParticles(activeVillainTheme.id);
  const caughtParticles = getCaughtParticles(activeVillainTheme.id);

  const handleShare = async () => {
    setSharing(true);
    await shareResultCard(shareRef, {
      title: meta.title,
      message: `${meta.title} — ${activeVillainTheme.label} Night · ${players.length} players · ${round} rounds`,
    });
    setSharing(false);
  };

  useEffect(()=>{
    logScreenView('GameOverScreen');
    (isVillageWin ? haptics.success : haptics.warning)();
    Animated.sequence([
      Animated.spring(scaleAnim,{toValue:1,friction:4,useNativeDriver:true}),
      Animated.timing(fadeAnim,{toValue:1,duration:500,useNativeDriver:true}),
    ]).start();
    logGameCompleted({ playerCount:players.length, villainThemeId:state.villainThemeId, winner, rounds:round });
    (async () => {
      await recordRoundResult({ players, winner, villainThemeId: state.villainThemeId });
      await recordGamePlayed();
      const alltimeStats = await loadAlltimeStats();
      const earnedBadges = await loadEarnedBadges();
      const unlocked = evaluateBadges({ players, winner, alltimeStats, earnedBadges });
      if (unlocked.length > 0) {
        for (const badgeId of unlocked) {
          await awardBadge(badgeId);
        }
        setNewBadges(unlocked);
      }
    })();
  },[]);

  const getRoleDisplay = (roleId, player) => {
    const theme = (roleId === 'VILLAIN' && player?.villainThemeOverride) ? getTheme(player.villainThemeOverride) : villainTheme;
    return {
      name:  theme.roles[roleId]?.name  ?? ROLES[roleId].name,
      emoji: theme.roles[roleId]?.emoji ?? ROLES[roleId].emoji,
      color: roleId==='VILLAIN' ? theme.color : ROLES[roleId].color,
    };
  };

  // DON is evil-team (just Seer-proof) — belongs in the evil reveal, not "special roles".
  const evilPlayers    = players.filter(p=>p.role==='VILLAIN'||p.role==='DON');
  const specialPlayers = players.filter(p=>p.role!=='VILLAIN'&&p.role!=='DON'&&p.role!=='VILLAGER');

  return (
    <Gradient colors={meta.bg} style={styles.flex}>
      {/* Confetti for village win, evil particles for villain win */}
      {isVillageWin
        ? <Confetti active accentColor={meta.accentColor} density={35} />
        : <ParticleField emojis={killParticles} count={16} reverse style={StyleSheet.absoluteFillObject} />
      }

      <SafeAreaView style={styles.safe}>
        <TabletContainer>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            {/* Big animated outcome illustration */}
            <OutcomeHero
              outcome={isVillageWin ? 'CAUGHT' : 'EVIL_WIN'}
              villainEmoji={activeVillainTheme.emoji}
              accentColor={meta.accentColor}
            />

            <Animated.View style={[styles.resultBox,{transform:[{scale:scaleAnim}]}]}>
              <Text style={[styles.resultTitle,{color:meta.accentColor,textShadowColor:meta.accentColor}]}>{meta.title}</Text>
              <Text style={[styles.resultSub,{color:C.textSecondary}]}>{meta.sub}</Text>
              {winner==='VILLAGE' && (
                <Text style={[styles.resultSub,{color:C.textDim,marginTop:6}]}>{meta.villainSub}</Text>
              )}
            </Animated.View>

            <Animated.View style={[styles.rest,{opacity:fadeAnim}]}>
              <Text style={[styles.body,{color:C.text}]}>{meta.body}</Text>

              {/* Stats */}
              <View style={styles.statsRow}>
                {[[round,t('over_nights')],[players.length,t('over_players')],[players.filter(p=>!p.isAlive).length,t('over_eliminated')]].map(([val,label])=>(
                  <View key={label} style={[styles.statBox,{backgroundColor:C.card,borderColor:C.cardBorder}]}>
                    <Text style={[styles.statVal,{color:C.primary}]}>{val}</Text>
                    <Text style={[styles.statLabel,{color:C.textSecondary}]}>{label}</Text>
                  </View>
                ))}
              </View>

              {newBadges.length > 0 && (
                <View style={[styles.unlockCard, { backgroundColor: C.card, borderColor: C.primary }]}>
                  <Text style={[styles.unlockTitle, { color: C.primary }]}>Unlocked this round</Text>
                  {newBadges.map((id) => {
                    const badge = BADGES.find((b) => b.id === id);
                    if (!badge) return null;
                    return (
                      <Text key={id} style={[styles.unlockItem, { color: C.text }]}>
                        {badge.emoji} {badge.name}
                      </Text>
                    );
                  })}
                </View>
              )}

              {/* Evil reveal */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle,{color:activeVillainTheme.color}]}>{fill(t('over_evil_section'),{villain:activeVillainTheme.label})}</Text>
                <View style={styles.chipGrid}>
                  {evilPlayers.map(p=>{
                    const rd=getRoleDisplay(p.role, p);
                    return (
                      <View key={p.id} style={[styles.revealChip,{borderColor:rd.color,backgroundColor:rd.color+'22'}]}>
                        <Text style={[styles.revealAv,!p.isAlive&&{opacity:0.4}]}>{p.avatar}</Text>
                        <View style={{flex:1}}>
                          <Text style={[styles.revealName,{color:C.text}]}>{p.name}</Text>
                          <Text style={[styles.revealRole,{color:rd.color}]}>{rd.emoji} {rd.name}</Text>
                        </View>
                        {!p.isAlive&&<Text style={styles.deadTag}>☠️</Text>}
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Special roles */}
              {specialPlayers.length>0&&(
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle,{color:C.primary}]}>{t('over_special')}</Text>
                  <View style={styles.chipGrid}>
                    {specialPlayers.map(p=>{
                      const rd=getRoleDisplay(p.role, p);
                      return (
                        <View key={p.id} style={[styles.revealChip,{borderColor:rd.color,backgroundColor:rd.color+'22'}]}>
                          <Text style={[styles.revealAv,!p.isAlive&&{opacity:0.4}]}>{p.avatar}</Text>
                          <View style={{flex:1}}>
                            <Text style={[styles.revealName,{color:C.text}]}>{p.name}</Text>
                            <Text style={[styles.revealRole,{color:rd.color}]}>{rd.emoji} {rd.name}</Text>
                          </View>
                          {!p.isAlive&&<Text style={styles.deadTag}>☠️</Text>}
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* All players */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle,{color:C.text}]}>{t('over_all')}</Text>
                {players.map(p=>{
                  const rd=getRoleDisplay(p.role, p);
                  return (
                    <View key={p.id} style={[styles.allRow,{backgroundColor:C.card,borderColor:C.cardBorder},!p.isAlive&&{opacity:0.6}]}>
                      <Text style={[styles.allAv,!p.isAlive&&{opacity:0.4}]}>{p.avatar}</Text>
                      <Text style={[styles.allName,{color:p.isAlive?C.text:C.textDim},!p.isAlive&&{textDecorationLine:'line-through'}]}>
                        {p.name}{p.loverId ? ' 💞' : ''}
                      </Text>
                      <View style={[styles.rolePill,{backgroundColor:rd.color+'33'}]}>
                        <Text style={styles.pilEmoji}>{rd.emoji}</Text>
                        <Text style={[styles.pilName,{color:rd.color}]}>{rd.name}</Text>
                      </View>
                      {!p.isAlive&&<Text style={styles.deathIcon}>{p.deathReason==='VILLAIN'?'🌑':p.deathReason==='VOTE'?'🗳️':'🏹'}</Text>}
                    </View>
                  );
                })}
              </View>

              {/* Recap — the whole game, night by night */}
              {log.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle,{color:C.text}]}>📜 How it happened</Text>
                  {[...new Set(log.map(e => e.round))].sort((a,b)=>a-b).map(r => (
                    <View key={r} style={[styles.recapRound,{backgroundColor:C.card,borderColor:C.cardBorder}]}>
                      <Text style={[styles.recapRoundLabel,{color:C.primary}]}>Round {r}</Text>
                      {log.filter(e => e.round === r).map((e, i) => (
                        <View key={`${r}-${i}`} style={styles.recapRow}>
                          <View style={[styles.recapDot,{backgroundColor:e.phase==='NIGHT'?C.textDim:C.primary}]}/>
                          <Text style={[styles.recapText,{color:C.textSecondary}]}>{e.text}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              )}

              <Pressable style={[styles.playBtn,{backgroundColor:C.primary,shadowColor:C.primary}]} onPress={()=>{resetGame();navigation.navigate('Setup');}}>
                <Text style={styles.playBtnTxt}>{t('over_play_again')}</Text>
              </Pressable>
              {/* Share button */}
              <Pressable
                style={[styles.shareBtn, { borderColor: meta.accentColor, backgroundColor: meta.accentColor + '22' }, sharing && { opacity: 0.6 }]}
                onPress={handleShare}
                disabled={sharing}
              >
                <Text style={[styles.shareBtnTxt, { color: meta.accentColor }]}>{sharing ? '⏳ Capturing...' : '📲 Share Result'}</Text>
              </Pressable>

              {/* Hidden share card — captured by ViewShot */}
              {ViewShot ? (
                <ViewShot
                  ref={shareRef}
                  options={{ format: 'png', quality: 0.95 }}
                  style={styles.offscreen}
                >
                  <ResultShareCard
                    villainEmoji={activeVillainTheme.emoji}
                    villainLabel={activeVillainTheme.label}
                    villainColor={activeVillainTheme.color}
                    outcome={isVillageWin ? 'VILLAGE_WIN' : 'EVIL_WIN'}
                    outcomeTitle={meta.title}
                    outcomeEmoji={meta.icon}
                    players={players}
                    rounds={round}
                    gradientColors={meta.bg}
                  />
                </ViewShot>
              ) : (
                // Web / ViewShot unavailable — store ref on a plain View (share will use text fallback)
                <View ref={shareRef} style={styles.offscreen}>
                  <ResultShareCard
                    villainEmoji={activeVillainTheme.emoji}
                    villainLabel={activeVillainTheme.label}
                    villainColor={activeVillainTheme.color}
                    outcome={isVillageWin ? 'VILLAGE_WIN' : 'EVIL_WIN'}
                    outcomeTitle={meta.title}
                    outcomeEmoji={meta.icon}
                    players={players}
                    rounds={round}
                    gradientColors={meta.bg}
                  />
                </View>
              )}
              <Pressable style={[styles.homeBtn,{backgroundColor:C.card,borderColor:C.cardBorder}]} onPress={()=>{resetGame();navigation.navigate('Tabs');}}>
                <Text style={[styles.homeBtnTxt,{color:C.text}]}>{t('over_home')}</Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </TabletContainer>
      </SafeAreaView>
    </Gradient>
  );
}

const styles = StyleSheet.create({
  flex:{flex:1}, safe:{flex:1},
  scroll:{flexGrow:1,padding:24,paddingBottom:48,alignItems:'center'},
  resultBox:{alignItems:'center',marginBottom:16},
  resultTitle:{...FONTS.title,fontSize:34,textAlign:'center',marginBottom:6,textShadowOffset:{width:0,height:0},textShadowRadius:16},
  resultSub:{...FONTS.subtitle,textAlign:'center'},
  rest:{width:'100%',alignItems:'center'},
  body:{...FONTS.body,textAlign:'center',lineHeight:24,marginBottom:20,maxWidth:340},
  statsRow:{flexDirection:'row',gap:12,marginBottom:24},
  statBox:{borderRadius:14,padding:16,alignItems:'center',minWidth:80,borderWidth:1},
  statVal:{...FONTS.title,fontSize:28},
  statLabel:{...FONTS.small,marginTop:2},
  unlockCard:{width:'100%',maxWidth:380,borderRadius:14,padding:14,borderWidth:1,marginBottom:20},
  unlockTitle:{...FONTS.subtitle,fontSize:15,marginBottom:8},
  unlockItem:{...FONTS.body,marginBottom:4},
  section:{width:'100%',maxWidth:380,marginBottom:20},
  sectionTitle:{...FONTS.subtitle,marginBottom:12},
  chipGrid:{flexDirection:'row',flexWrap:'wrap',gap:10},
  revealChip:{flexDirection:'row',alignItems:'center',borderRadius:14,padding:12,borderWidth:1.5,gap:10,minWidth:140},
  revealAv:{fontSize:28},
  revealName:{...FONTS.body,fontWeight:'700'},
  revealRole:{...FONTS.small,fontWeight:'600'},
  deadTag:{fontSize:16},
  allRow:{flexDirection:'row',alignItems:'center',borderRadius:12,padding:10,marginBottom:8,borderWidth:1,gap:10},
  allAv:{fontSize:22},
  allName:{...FONTS.body,flex:1},
  rolePill:{flexDirection:'row',alignItems:'center',borderRadius:8,paddingHorizontal:8,paddingVertical:4,gap:4},
  pilEmoji:{fontSize:13},
  pilName:{...FONTS.small,fontWeight:'700'},
  deathIcon:{fontSize:16},
  recapRound:{borderRadius:12,padding:12,marginBottom:8,borderWidth:1},
  recapRoundLabel:{...FONTS.small,fontWeight:'800',letterSpacing:1,marginBottom:8,textTransform:'uppercase'},
  recapRow:{flexDirection:'row',alignItems:'flex-start',gap:8,marginBottom:6},
  recapDot:{width:6,height:6,borderRadius:3,marginTop:7},
  recapText:{...FONTS.small,flex:1,lineHeight:19},
  playBtn:{width:'100%',maxWidth:380,borderRadius:16,paddingVertical:18,alignItems:'center',marginBottom:12,shadowOffset:{width:0,height:0},shadowOpacity:0.4,shadowRadius:10,elevation:6},
  playBtnTxt:{color:'#000',fontWeight:'800',fontSize:18},
  shareBtn:{width:'100%',maxWidth:380,borderRadius:16,paddingVertical:16,alignItems:'center',marginBottom:12,borderWidth:1.5},
  shareBtnTxt:{fontWeight:'800',fontSize:16},
  homeBtn:{width:'100%',maxWidth:380,borderRadius:16,paddingVertical:16,alignItems:'center',borderWidth:1},
  homeBtnTxt:{fontWeight:'700',fontSize:16},
  offscreen:{position:'absolute',top:10000,left:0,opacity:0},
});
