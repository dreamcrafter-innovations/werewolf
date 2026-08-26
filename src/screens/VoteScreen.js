import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { usePalette } from '../hooks/usePalette';
import { fill } from '../utils/interpolate';
import Gradient from '../components/Gradient';
import TabletContainer from '../components/TabletContainer';
import { FONTS } from '../components/theme';
import { ROLES } from '../data/roles';
import { getTheme } from '../data/villainThemes';
import { getVoteTally, getVoteWeight } from '../utils/gameLogic';
import { haptics } from '../utils/haptics';
import { useKeepAwake } from 'expo-keep-awake';

export default function VoteScreen({ navigation }) {
  useKeepAwake(); // pass-the-phone voting runs long; screen must not sleep mid-round
  const { state, villainTheme, castVote, resolveVote, hunterRevengeTarget, skipHunterRevenge, startNight } = useGame();
  const { t } = useLanguage();
  const C = usePalette();
  const { players, votes, eliminatedThisVote, phase, allowGhostVotes } = state;
  const alive = players.filter(p=>p.isAlive);
  const dead = players.filter(p=>!p.isAlive);
  const voters = allowGhostVotes ? [...alive, ...dead] : alive;
  const [voterIdx, setVoterIdx] = useState(0);
  const [subPhase, setSubPhase] = useState('VOTING');
  const [selected, setSelected] = useState(null);
  const [showRevenge, setShowRevenge] = useState(false);

  // See NightScreen — Night/Day/Vote replace each other in the stack, so the entry
  // underneath is always Setup. Block hardware back so it can't silently abandon the round.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, [])
  );

  const voter = voters[voterIdx];
  const tally = getVoteTally(votes, players);
  const eliminated = players.find(p=>p.id===eliminatedThisVote);
  const totalVoteWeight = voters.reduce((sum, p) => sum + getVoteWeight(p), 0) || 1;
  const isGhostVoter = !!voter && !voter.isAlive;

  const getRoleDisplay = (roleId, player) => {
    const theme = (roleId === 'VILLAIN' && player?.villainThemeOverride) ? getTheme(player.villainThemeOverride) : villainTheme;
    return {
      name:  theme.roles[roleId]?.name  ?? ROLES[roleId].name,
      emoji: theme.roles[roleId]?.emoji ?? ROLES[roleId].emoji,
      color: roleId==='VILLAIN' ? theme.color : ROLES[roleId].color,
    };
  };

  // Haptic pulse when the vote result actually appears — warning if someone was
  // eliminated, a lighter tap for a tie. Keyed on subPhase so it fires exactly once
  // per genuine transition into RESULT, not on every render.
  useEffect(() => {
    if (subPhase === 'RESULT') (eliminated ? haptics.warning : haptics.light)();
  }, [subPhase]);

  // Navigate after revenge resolves.
  // replace (not navigate) — Night/Day/Vote cycle through the same route names every
  // round; navigate() would pop back to the already-mounted screen from a previous
  // round instead of remounting, leaving stale step/phase state behind.
  useEffect(()=>{
    if(!showRevenge) return;
    if(phase==='GAME_OVER') navigation.replace('GameOver');
    else if(phase==='DAY'){ startNight(); navigation.replace('Night'); }
  },[phase, showRevenge]);

  const doVote = (abstain=false) => {
    if(!abstain&&!selected) return;
    haptics.light();
    castVote(voter.id, abstain?null:selected);
    const isLast = voterIdx===voters.length-1;
    if(isLast){ resolveVote(); setSubPhase('RESULT'); }
    else { setSelected(null); setVoterIdx(voterIdx+1); }
  };

  const afterResult = () => {
    if (phase === 'HUNTER_REVENGE') { setShowRevenge(true); return; }
    if (phase === 'GAME_OVER') { navigation.replace('GameOver'); return; }
    startNight();
    navigation.replace('Night');
  };

  // ── Hunter revenge ───────────────────────────────────────────────────────
  if(showRevenge && phase==='HUNTER_REVENGE') {
    const hunter = players.find(p=>p.id===state.hunterRevenge.hunterId);
    const targets = players.filter(p=>p.isAlive&&p.id!==state.hunterRevenge.hunterId);
    return (
      <Gradient colors={['#1A0800','#0D0400']} style={styles.flex}>
        <SafeAreaView style={styles.safe}>
          <TabletContainer>
            <ScrollView contentContainerStyle={styles.scroll}>
              <Text style={styles.bigIcon}>🏹</Text>
              <Text style={[styles.pageTitle,{color:C.warning||'#F39C12'}]}>{t('vote_hunter_title')}</Text>
              <Text style={[styles.pageSub,{color:C.text}]}>{fill(t('vote_hunter_sub'),{name:`${hunter?.avatar} ${hunter?.name}`})}</Text>
              <Text style={[styles.pickLabel,{color:C.text}]}>{t('vote_hunter_pick')}</Text>
              <View style={styles.grid}>
                {targets.map(p=>(
                  <Pressable key={p.id}
                    style={[styles.chip,{backgroundColor:C.card,borderColor:selected===p.id?C.primary:C.cardBorder},selected===p.id&&{backgroundColor:C.primary+'20'}]}
                    onPress={()=>setSelected(p.id)}>
                    <Text style={styles.chipAv}>{p.avatar}</Text>
                    <Text style={[styles.chipNm,{color:selected===p.id?C.primary:C.textSecondary}]}>{p.name}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable style={[styles.actionBtn,{backgroundColor:selected?C.primary:C.textDim,shadowColor:C.primary}]}
                onPress={()=>{ if(selected){ haptics.warning(); hunterRevengeTarget(selected); } }}>
                <Text style={styles.actionBtnTxt}>{t('vote_hunter_fire')}</Text>
              </Pressable>
              <Pressable style={styles.skipBtn} onPress={skipHunterRevenge}>
                <Text style={[styles.skipTxt,{color:C.textDim}]}>{t('vote_hunter_skip')}</Text>
              </Pressable>
            </ScrollView>
          </TabletContainer>
        </SafeAreaView>
      </Gradient>
    );
  }

  // ── Result ───────────────────────────────────────────────────────────────
  if(subPhase==='RESULT') {
    const sorted = Object.entries(tally).sort((a,b)=>b[1]-a[1]).map(([id,count])=>({player:players.find(p=>p.id===id),count}));
    return (
      <Gradient colors={['#0A0500','#180A00']} style={styles.flex}>
        <SafeAreaView style={styles.safe}>
          <TabletContainer>
            <ScrollView contentContainerStyle={styles.scroll}>
              <Text style={styles.bigIcon}>🗳️</Text>
              <Text style={[styles.pageTitle,{color:C.text}]}>{t('vote_result_title')}</Text>

              <View style={[styles.tallyBox,{backgroundColor:C.card,borderColor:C.cardBorder}]}>
                <Text style={[styles.tallyTitle,{color:C.text}]}>{t('vote_tally')}</Text>
                {sorted.map(({player,count})=>(
                  <View key={player?.id} style={styles.tallyRow}>
                    <Text style={styles.tallyAv}>{player?.avatar}</Text>
                    <Text style={[styles.tallyNm,{color:C.text}]}>{player?.name}</Text>
                    <View style={[styles.barWrap,{backgroundColor:C.surface}]}>
                      <View style={[styles.barFill,{width:`${(count/totalVoteWeight)*100}%`,backgroundColor:player?.id===eliminatedThisVote?C.evil:C.textDim}]}/>
                    </View>
                    <Text style={[styles.tallyCount,{color:C.textSecondary}]}>
                      {allowGhostVotes ? '✦' : count}
                    </Text>
                  </View>
                ))}
              </View>
              {allowGhostVotes && (
                <Text style={[styles.secretNote,{color:C.textDim}]}>
                  {villainTheme.afterlifeEmoji} {villainTheme.afterlifeTerm} influence is hidden.
                </Text>
              )}

              {eliminated ? (
                <View style={[styles.elimCard,{backgroundColor:C.evil+'20',borderColor:C.evil}]}>
                  <Text style={styles.bigIcon}>☠️</Text>
                  <Text style={[styles.elimLabel,{color:C.textSecondary}]}>{t('vote_eliminated')}</Text>
                  <Text style={styles.elimAv}>{eliminated.avatar}</Text>
                  <Text style={[styles.elimName,{color:C.text}]}>{eliminated.name}</Text>
                  {(()=>{const rd=getRoleDisplay(eliminated.role, eliminated); return (
                    <View style={[styles.roleBadge,{backgroundColor:rd.color+'33'}]}>
                      <Text>{rd.emoji}</Text>
                      <Text style={[styles.roleBadgeNm,{color:rd.color}]}>{fill(t('vote_was_a'),{role:rd.name})}</Text>
                    </View>
                  );})()}
                </View>
              ) : (
                <View style={[styles.tieCard,{backgroundColor:C.card,borderColor:C.cardBorder}]}>
                  <Text style={styles.bigIcon}>🤝</Text>
                  <Text style={[styles.tieTitle,{color:C.text}]}>{t('vote_tie_title')}</Text>
                  <Text style={[styles.tieSub,{color:C.textSecondary}]}>{fill(t('vote_tie_sub'),{villain:villainTheme.label})}</Text>
                </View>
              )}

              <Pressable style={[styles.actionBtn,{backgroundColor:C.primary,shadowColor:C.primary}]} onPress={afterResult}>
                <Text style={styles.actionBtnTxt}>{phase==='GAME_OVER'?t('vote_see_results'):t('vote_next_night')}</Text>
              </Pressable>
            </ScrollView>
          </TabletContainer>
        </SafeAreaView>
      </Gradient>
    );
  }

  // ── Voting ───────────────────────────────────────────────────────────────
  return (
    <Gradient colors={['#0A0500','#160B00','#1E1200']} style={styles.flex}>
      <SafeAreaView style={styles.safe}>
        <TabletContainer>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.bigIcon}>🗳️</Text>
            <Text style={[styles.pageTitle,{color:C.text}]}>{t('vote_title')}</Text>
            <Text style={[styles.pageSub,{color:C.textSecondary}]}>{fill(t('vote_pass'),{name:`${voter?.avatar} ${voter?.name}`})}</Text>
            {isGhostVoter && (
              <View style={[styles.ghostNote,{backgroundColor:C.card,borderColor:C.cardBorder}]}>
                <Text style={[styles.ghostNoteTxt,{color:C.textSecondary}]}>
                  {villainTheme.afterlifeEmoji} {villainTheme.afterlifeTerm} vote in silence.
                </Text>
              </View>
            )}

            {voter?.role==='CHIEF'&&(
              <View style={[styles.chiefBadge,{backgroundColor:C.primary+'20',borderColor:C.primary+'60'}]}>
                <Text style={[styles.chiefTxt,{color:C.primary}]}>{t('vote_chief')}</Text>
              </View>
            )}

            <Text style={[styles.progressTxt,{color:C.textSecondary}]}>{fill(t('vote_progress'),{n:voterIdx+1,total:voters.length})}</Text>
            <View style={[styles.progressBar,{backgroundColor:C.cardBorder}]}>
              {/* (voterIdx+1) so the bar reaches 100% on the last voter, matching the
                  "{voterIdx+1}/{voters.length} voted" label above it — it was previously
                  always one voter short (e.g. 0% while the first of five is voting, 80%
                  on the last). Same fix as the RoleReveal progress bar. */}
              <View style={[styles.progressFill,{width:`${((voterIdx+1)/voters.length)*100}%`,backgroundColor:C.primary}]}/>
            </View>

            <Text style={[styles.promptTxt,{color:C.text}]}>{fill(t('vote_prompt'),{name:voter?.name})}</Text>
            <View style={styles.grid}>
              {alive.filter(p=>p.id!==voter?.id).map(p=>(
                <Pressable key={p.id}
                  style={[styles.chip,{backgroundColor:C.card,borderColor:selected===p.id?C.primary:C.cardBorder},selected===p.id&&{backgroundColor:C.primary+'20'}]}
                  onPress={()=>setSelected(p.id)}>
                  <Text style={styles.chipAv}>{p.avatar}</Text>
                  <Text style={[styles.chipNm,{color:selected===p.id?C.primary:C.textSecondary}]}>{p.name}</Text>
                  {selected===p.id&&<Text style={[styles.check,{color:C.primary}]}>✓</Text>}
                </Pressable>
              ))}
            </View>

            <Pressable style={[styles.actionBtn,{backgroundColor:selected?C.primary:C.textDim,shadowColor:C.primary}]} onPress={()=>doVote(false)}>
              <Text style={styles.actionBtnTxt}>{selected?fill(t('vote_confirm'),{name:players.find(p=>p.id===selected)?.name}):t('vote_choose')}</Text>
            </Pressable>
            <Pressable style={styles.skipBtn} onPress={()=>doVote(true)}>
              <Text style={[styles.skipTxt,{color:C.textDim}]}>{t('vote_abstain')}</Text>
            </Pressable>
          </ScrollView>
        </TabletContainer>
      </SafeAreaView>
    </Gradient>
  );
}

const styles = StyleSheet.create({
  flex:{flex:1}, safe:{flex:1},
  scroll:{flexGrow:1,padding:24,paddingBottom:48,alignItems:'center'},
  bigIcon:{fontSize:60,marginBottom:8,textAlign:'center'},
  pageTitle:{...FONTS.title,textAlign:'center',marginBottom:8},
  pageSub:{...FONTS.subtitle,textAlign:'center',marginBottom:12},
  pickLabel:{...FONTS.subtitle,marginBottom:12},
  chiefBadge:{borderRadius:12,paddingHorizontal:14,paddingVertical:8,borderWidth:1,marginBottom:12},
  chiefTxt:{...FONTS.small,fontWeight:'700'},
  ghostNote:{borderRadius:10,paddingHorizontal:12,paddingVertical:8,borderWidth:1,marginBottom:10},
  ghostNoteTxt:{...FONTS.small,fontWeight:'700'},
  progressTxt:{...FONTS.small,marginBottom:6},
  progressBar:{width:'100%',maxWidth:380,height:4,borderRadius:2,marginBottom:20},
  progressFill:{height:'100%',borderRadius:2},
  promptTxt:{...FONTS.subtitle,textAlign:'center',marginBottom:16},
  grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'center',gap:10,width:'100%',maxWidth:380,marginBottom:24},
  chip:{flexDirection:'row',alignItems:'center',borderRadius:14,paddingHorizontal:14,paddingVertical:10,borderWidth:1.5,gap:8,minWidth:130},
  chipAv:{fontSize:20},
  chipNm:{...FONTS.body,fontWeight:'600'},
  check:{fontSize:16,fontWeight:'800'},
  actionBtn:{width:'100%',maxWidth:380,borderRadius:16,paddingVertical:16,alignItems:'center',marginBottom:10,shadowOffset:{width:0,height:0},shadowOpacity:0.4,shadowRadius:10,elevation:6},
  actionBtnTxt:{color:'#000',fontWeight:'800',fontSize:16},
  skipBtn:{paddingVertical:10},
  skipTxt:{...FONTS.small,textAlign:'center'},
  tallyBox:{width:'100%',maxWidth:380,borderRadius:16,padding:16,borderWidth:1,marginBottom:20,gap:10},
  tallyTitle:{...FONTS.subtitle,marginBottom:4},
  tallyRow:{flexDirection:'row',alignItems:'center',gap:8},
  tallyAv:{fontSize:18,width:28},
  tallyNm:{...FONTS.small,width:90},
  barWrap:{flex:1,height:8,borderRadius:4},
  barFill:{height:'100%',borderRadius:4,minWidth:8},
  tallyCount:{...FONTS.small,width:20,textAlign:'right'},
  secretNote:{...FONTS.small,textAlign:'center',marginTop:-10,marginBottom:16,fontStyle:'italic'},
  elimCard:{alignItems:'center',borderRadius:20,padding:24,borderWidth:1.5,marginBottom:24,width:'100%',maxWidth:380},
  elimLabel:{...FONTS.small,marginBottom:8},
  elimAv:{fontSize:44,marginBottom:4},
  elimName:{fontSize:22,fontWeight:'800',marginBottom:10},
  roleBadge:{flexDirection:'row',alignItems:'center',borderRadius:12,paddingHorizontal:14,paddingVertical:8,gap:6},
  roleBadgeNm:{...FONTS.body,fontWeight:'700'},
  tieCard:{alignItems:'center',borderRadius:20,padding:24,borderWidth:1,marginBottom:24,width:'100%',maxWidth:380},
  tieTitle:{...FONTS.subtitle,marginBottom:6},
  tieSub:{...FONTS.small,textAlign:'center'},
});
