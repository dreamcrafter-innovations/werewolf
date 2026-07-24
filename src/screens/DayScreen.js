import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { usePalette } from '../hooks/usePalette';
import { fill } from '../utils/interpolate';
import Gradient from '../components/Gradient';
import TabletContainer from '../components/TabletContainer';
import { FONTS } from '../components/theme';
import { ROLES } from '../data/roles';
import ParticleField from '../components/ParticleField';
import BurstEffect from '../components/BurstEffect';
import KillRevealArt from '../components/KillRevealArt';
import { getKillParticles, SAVE_BURST_PARTICLES, QUIET_NIGHT_PARTICLES } from '../data/themeParticles';

export default function DayScreen({ navigation }) {
  const { state, villainTheme } = useGame();
  const { t } = useLanguage();
  const C = usePalette();
  const { players, lastNightResult, round } = state;
  const { killedId, savedById } = lastNightResult;

  const killedPlayer = players.find(p=>p.id===killedId);
  const savedPlayer  = players.find(p=>p.id===savedById);
  const alive = players.filter(p=>p.isAlive);
  const dead  = players.filter(p=>!p.isAlive);
  const ghostGossip = dead.length > 0
    ? dead.slice(0, 2).map((p, i) => {
        const lines = [
          `${p.avatar} ${p.name}: "I told you not to trust the quiet one."`,
          `${p.avatar} ${p.name}: "If I return as a ghost, I am haunting the vote."`,
          `${p.avatar} ${p.name}: "I leave one clue: watch who smiles too early."`,
        ];
        return lines[(round + i) % lines.length];
      })
    : [];

  const killParticles  = getKillParticles(state.villainThemeId);
  const nightParticles = killedId   ? killParticles
                       : savedById  ? SAVE_BURST_PARTICLES
                       : QUIET_NIGHT_PARTICLES;

  const sunFade  = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;

  useEffect(()=>{
    Animated.parallel([
      Animated.timing(sunFade,  {toValue:1,duration:800,useNativeDriver:true}),
      Animated.timing(cardSlide,{toValue:0,duration:600,useNativeDriver:true}),
    ]).start();
  },[]);

  const getRoleDisplay = (roleId) => ({
    name:  villainTheme.roles[roleId]?.name  ?? ROLES[roleId].name,
    emoji: villainTheme.roles[roleId]?.emoji ?? ROLES[roleId].emoji,
    color: roleId==='VILLAIN' ? villainTheme.color : ROLES[roleId].color,
  });

  return (
    <Gradient colors={['#0A0500','#180E00','#1E1200']} style={styles.flex}>
      {/* Ambient particle field — kill = villain emojis drifting down, save = green sparkles, quiet = stars */}
      <ParticleField
        emojis={nightParticles}
        count={killedId ? 14 : 10}
        reverse={!!savedById}
        style={StyleSheet.absoluteFillObject}
      />
      {/* One-shot burst around the result card */}
      <BurstEffect
        key={`${killedId ?? savedById ?? 'quiet'}`}
        emojis={nightParticles}
        count={killedId ? 12 : 8}
        active
      />
      <SafeAreaView style={styles.safe}>
        <TabletContainer>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            <Animated.View style={[styles.sunWrap,{opacity:sunFade}]}>
              <Text style={styles.sunEmoji}>🌅</Text>
              <Text style={[styles.roundLabel,{color:C.primary}]}>{fill(t('day_round'),{n:round})}</Text>
              <Text style={[styles.tagline,{color:C.textSecondary}]}>{t('day_tagline')}</Text>
            </Animated.View>

            {/* Night result card */}
            <Animated.View style={[
              styles.resultCard,
              killedPlayer ? {backgroundColor:C.evil+'25',borderColor:C.evil} : {backgroundColor:(C.village||'#27AE60')+'18',borderColor:C.village||'#27AE60'},
              {transform:[{translateY:cardSlide}],opacity:sunFade},
            ]}>
              {killedPlayer ? (
                <>
                  <KillRevealArt type="KILL" playerAvatar={killedPlayer.avatar} villainEmoji={villainTheme.emoji} accentColor={villainTheme.color} />
                  <Text style={styles.resultIcon}>💀</Text>
                  <Text style={[styles.resultTitle,{color:C.text}]}>{t('day_attack_title')}</Text>
                  <View style={styles.victimRow}>
                    <Text style={styles.victimAvatar}>{killedPlayer.avatar}</Text>
                    <View>
                      <Text style={[styles.victimName,{color:C.text}]}>{killedPlayer.name}</Text>
                      <Text style={[styles.victimSub,{color:C.textSecondary}]}>{villainTheme.killAction ?? fill(t('day_attack_sub'),{villain:villainTheme.label,emoji:villainTheme.emoji})}</Text>
                    </View>
                  </View>
                  <Text style={[styles.flavor,{color:C.textDim}]}>{villainTheme.killFlavor ?? t('day_attack_flavor')}</Text>
                </>
              ) : savedById ? (
                <>
                  <KillRevealArt type="SAVE" playerAvatar={savedPlayer?.avatar ?? '🌿'} villainEmoji={villainTheme.emoji} accentColor={villainTheme.color} />
                  <Text style={styles.resultIcon}>🌿</Text>
                  <Text style={[styles.resultTitle,{color:C.text}]}>{t('day_healer_title')}</Text>
                  <View style={styles.victimRow}>
                    <Text style={styles.victimAvatar}>{savedPlayer?.avatar}</Text>
                    <View>
                      <Text style={[styles.victimName,{color:C.primary}]}>{savedPlayer?.name}</Text>
                      <Text style={[styles.victimSub,{color:C.textSecondary}]}>{t('day_healer_sub')}</Text>
                    </View>
                  </View>
                  <Text style={[styles.flavor,{color:C.textDim}]}>{t('day_healer_flavor')}</Text>
                </>
              ) : (
                <>
                  <KillRevealArt type="QUIET" playerAvatar="😶‍🌫️" villainEmoji={villainTheme.emoji} accentColor={villainTheme.color} />
                  <Text style={styles.resultIcon}>😶‍🌫️</Text>
                  <Text style={[styles.resultTitle,{color:C.text}]}>{t('day_quiet_title')}</Text>
                  <Text style={[styles.flavor,{color:C.textDim}]}>{villainTheme.quietFlavor ?? fill(t('day_quiet_flavor'),{villain:villainTheme.label})}</Text>
                </>
              )}
            </Animated.View>

            {/* Alive */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle,{color:C.text}]}>{fill(t('day_alive'),{count:alive.length})}</Text>
              <View style={styles.chipGrid}>
                {alive.map(p=>(
                  <View key={p.id} style={[styles.aliveChip,{backgroundColor:C.card,borderColor:C.cardBorder}]}>
                    <Text style={styles.chipAv}>{p.avatar}</Text>
                    <Text style={[styles.chipNm,{color:C.text}]}>{p.name}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Dead */}
            {dead.length>0&&(
              <View style={styles.section}>
                <Text style={[styles.sectionTitle,{color:C.text}]}>{fill(t('day_dead'),{count:dead.length})}</Text>
                <View style={styles.deadList}>
                  {dead.map(p=>{
                    const rd = getRoleDisplay(p.role);
                    return (
                      <View key={p.id} style={[styles.deadRow,{backgroundColor:C.surface,borderColor:C.cardBorder}]}>
                        <Text style={[styles.deadAv,{opacity:0.5}]}>{p.avatar}</Text>
                        <Text style={[styles.deadNm,{color:C.textDim}]}>{p.name}</Text>
                        <View style={[styles.roleBadge,{backgroundColor:rd.color+'33'}]}>
                          <Text style={styles.roleEmoji}>{rd.emoji}</Text>
                          <Text style={[styles.roleBadgeName,{color:rd.color}]}>{rd.name}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Discuss */}
            <View style={[styles.discussBox,{backgroundColor:C.primary+'10',borderColor:C.primary+'30'}]}>
              <Text style={[styles.discussTitle,{color:C.primary}]}>{t('day_discuss_title')}</Text>
              <Text style={[styles.discussText,{color:C.textSecondary}]}>{fill(t('day_discuss_text'),{villain:villainTheme.label})}</Text>
            </View>

            {ghostGossip.length > 0 && (
              <View style={[styles.gossipBox,{backgroundColor:C.card,borderColor:C.cardBorder}]}>
                <Text style={[styles.gossipTitle,{color:C.text}]}>Ghost Gossip</Text>
                {ghostGossip.map((line) => (
                  <Text key={line} style={[styles.gossipLine,{color:C.textSecondary}]}>{line}</Text>
                ))}
              </View>
            )}

            <Pressable style={[styles.voteBtn,{backgroundColor:C.primary,shadowColor:C.primary}]} onPress={()=>navigation.navigate('Vote')}>
              <Text style={styles.voteBtnTxt}>{t('day_vote_btn')}</Text>
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
  sunWrap:{alignItems:'center',marginBottom:20},
  sunEmoji:{fontSize:64},
  roundLabel:{...FONTS.label,marginTop:8,letterSpacing:2},
  tagline:{...FONTS.small,fontStyle:'italic',marginTop:4},
  resultCard:{width:'100%',maxWidth:380,borderRadius:20,padding:24,alignItems:'center',borderWidth:1.5,marginBottom:24},
  resultIcon:{fontSize:48,marginBottom:8},
  resultTitle:{...FONTS.subtitle,textAlign:'center',marginBottom:16},
  victimRow:{flexDirection:'row',alignItems:'center',gap:14,marginBottom:14},
  victimAvatar:{fontSize:40},
  victimName:{fontSize:22,fontWeight:'800'},
  victimSub:{...FONTS.small,marginTop:2},
  flavor:{...FONTS.small,textAlign:'center',fontStyle:'italic',lineHeight:20},
  section:{width:'100%',maxWidth:380,marginBottom:20},
  sectionTitle:{...FONTS.subtitle,marginBottom:12},
  chipGrid:{flexDirection:'row',flexWrap:'wrap',gap:8},
  aliveChip:{flexDirection:'row',alignItems:'center',borderRadius:12,paddingHorizontal:12,paddingVertical:8,borderWidth:1,gap:6},
  chipAv:{fontSize:18}, chipNm:{...FONTS.small,fontWeight:'600'},
  deadList:{gap:8},
  deadRow:{flexDirection:'row',alignItems:'center',borderRadius:12,padding:10,borderWidth:1,gap:10,opacity:0.7},
  deadAv:{fontSize:22},
  deadNm:{...FONTS.body,flex:1,textDecorationLine:'line-through'},
  roleBadge:{flexDirection:'row',alignItems:'center',borderRadius:8,paddingHorizontal:8,paddingVertical:4,gap:4},
  roleEmoji:{fontSize:14},
  roleBadgeName:{...FONTS.small,fontWeight:'700'},
  discussBox:{width:'100%',maxWidth:380,borderRadius:16,padding:18,borderWidth:1,marginBottom:24,alignItems:'center'},
  discussTitle:{...FONTS.subtitle,marginBottom:8},
  discussText:{...FONTS.body,textAlign:'center',lineHeight:24},
  gossipBox:{width:'100%',maxWidth:380,borderRadius:14,padding:14,borderWidth:1,marginBottom:20},
  gossipTitle:{...FONTS.body,fontWeight:'700',marginBottom:8},
  gossipLine:{...FONTS.small,lineHeight:18,marginBottom:5},
  voteBtn:{width:'100%',maxWidth:380,borderRadius:16,paddingVertical:18,alignItems:'center',shadowOffset:{width:0,height:0},shadowOpacity:0.4,shadowRadius:10,elevation:6},
  voteBtnTxt:{color:'#000',fontWeight:'800',fontSize:18},
});
