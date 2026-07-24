/**
 * SetupScreen — 4 internal views:
 *   'setup'      Player list + role preview + Start Game
 *   'roster'     Browse / load saved rosters
 *   'editGroup'  Create or edit a roster (name + player list)
 *   'editPlayer' Name + avatar picker for one saved player
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame }     from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { usePalette }  from '../hooks/usePalette';
import { fill }        from '../utils/interpolate';
import Gradient        from '../components/Gradient';
import TabletContainer from '../components/TabletContainer';
import { FONTS }       from '../components/theme';
import { AVATAR_GROUPS, getAvatarEmoji, getRolePreview } from '../data/roles';
import { loadProfiles, saveProfiles, makeId } from '../storage';

const FALLBACK_AVATARS = ['👦','👧','🧒','👩','👨','🧑','👴','👵',
  '🧔','👲','👳','🧕','🕵️','👮','🧙','🧝'];

export default function SetupScreen({ navigation }) {
  const { startGame, villainTheme } = useGame();
  const { t } = useLanguage();
  const C = usePalette();

  // ── game setup ───────────────────────────────────────────────────────
  const [players, setPlayers] = useState([
    { id: '1', name: '', avatar: '👦' },
    { id: '2', name: '', avatar: '👧' },
  ]);
  const [showPreview,  setShowPreview]  = useState(false);
  const [avatarTarget, setAvatarTarget] = useState(null); // player.id whose avatar is being picked

  // ── roster management ────────────────────────────────────────────────
  const [view,         setView]         = useState('setup');
  const [profiles,     setProfiles]     = useState([]);
  const [activeGroup,  setActiveGroup]  = useState(null); // { id, name, players }
  const [activePlayer, setActivePlayer] = useState(null); // { id, name, avatarId }

  useEffect(() => {
    loadProfiles().then(p => setProfiles(Array.isArray(p) ? p : []));
  }, []);

  // ── setup helpers ────────────────────────────────────────────────────
  const addPlayer = () => {
    if (players.length >= 16) return;
    setPlayers([...players, {
      id: makeId(), name: '',
      avatar: FALLBACK_AVATARS[players.length % FALLBACK_AVATARS.length],
    }]);
  };
  const removePlayer = id => { if (players.length > 4) setPlayers(players.filter(p => p.id !== id)); };
  const updateName   = (id, name) => setPlayers(players.map(p => p.id === id ? { ...p, name } : p));
  const applyAvatar  = (id, emoji) => { setPlayers(players.map(p => p.id === id ? { ...p, avatar: emoji } : p)); setAvatarTarget(null); };

  const canStart = players.length >= 4 && players.every(p => p.name.trim().length > 0);
  const canQuickFill = players.some((p, i) => !p.name.trim() && i < 6);

  const quickFillPlayers = () => {
    let next = [...players];
    while (next.length < 6) {
      next.push({
        id: makeId(),
        name: '',
        avatar: FALLBACK_AVATARS[next.length % FALLBACK_AVATARS.length],
      });
    }
    next = next.map((p, i) => ({
      ...p,
      name: p.name.trim() || `Player ${i + 1}`,
    }));
    setPlayers(next);
  };

  const handleStart = () => {
    if (!canStart) { Alert.alert(t('setup_alert_title'), t('setup_alert_msg')); return; }
    startGame(players.map(p => ({ id: p.id, name: p.name.trim(), avatar: p.avatar })));
    navigation.navigate('RoleReveal');
  };

  // ── roster helpers ───────────────────────────────────────────────────
  async function persistProfiles(updated) {
    setProfiles(updated);
    await saveProfiles(updated);
  }

  function loadGroupIntoSetup(group) {
    if (group.players.length < 2) { Alert.alert('', t('roster_too_few')); return; }
    setPlayers(group.players.map(p => ({ id: p.id, name: p.name, avatar: getAvatarEmoji(p.avatarId) })));
    setView('setup');
  }

  function openNewGroup() {
    setActiveGroup({ id: '', name: '', players: [] });
    setView('editGroup');
  }

  function openEditGroup(group) {
    setActiveGroup({ ...group, players: [...group.players] });
    setView('editGroup');
  }

  async function saveGroup() {
    if (!activeGroup?.name?.trim()) { Alert.alert('', t('roster_name_required')); return; }
    const isNew = !activeGroup.id;
    const group = { ...activeGroup, id: isNew ? makeId() : activeGroup.id, name: activeGroup.name.trim() };
    const updated = isNew ? [...profiles, group] : profiles.map(p => p.id === group.id ? group : p);
    await persistProfiles(updated);
    setView('roster');
  }

  function confirmDeleteGroup() {
    Alert.alert(t('roster_delete_title'), t('roster_delete_confirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: async () => {
        await persistProfiles(profiles.filter(p => p.id !== activeGroup.id));
        setView('roster');
      }},
    ]);
  }

  function openNewPlayer() {
    setActivePlayer({ id: '', name: '', avatarId: 1 });
    setView('editPlayer');
  }

  function openEditPlayer(player) {
    setActivePlayer({ ...player });
    setView('editPlayer');
  }

  function savePlayer() {
    if (!activePlayer?.name?.trim()) return;
    const player = { ...activePlayer, id: activePlayer.id || makeId(), name: activePlayer.name.trim() };
    const exists = activeGroup.players.some(p => p.id === player.id);
    setActiveGroup({
      ...activeGroup,
      players: exists
        ? activeGroup.players.map(p => p.id === player.id ? player : p)
        : [...activeGroup.players, player],
    });
    setView('editGroup');
  }

  function removePlayerFromGroup(playerId) {
    setActiveGroup({ ...activeGroup, players: activeGroup.players.filter(p => p.id !== playerId) });
  }

  // ── render: setup ────────────────────────────────────────────────────
  if (view === 'setup') {
    const rolePreview = getRolePreview(players.length);
    return (
      <Gradient colors={villainTheme.gradientBg} style={s.flex}>
        <SafeAreaView style={s.flex}>
          <TabletContainer>
            <View style={[s.header, { borderBottomColor: C.cardBorder }]}>
              <Pressable onPress={() => navigation.goBack()}>
                <Text style={[s.backBtn, { color: C.primary }]}>{t('setup_back')}</Text>
              </Pressable>
              <Text style={[s.headerTitle, { color: C.text }]}>{t('setup_title')}</Text>
              <Pressable onPress={() => setView('roster')}>
                <Text style={[s.headerRight, { color: C.primary }]}>{t('setup_rosters_btn')}</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Pressable style={[s.previewBanner, { backgroundColor: C.card, borderColor: C.cardBorder }]} onPress={() => setShowPreview(!showPreview)}>
                <Text style={[s.previewText, { color: C.textSecondary }]}>
                  {fill(t('setup_preview_btn'), { count: players.length, arrow: showPreview ? '▲' : '▼' })}
                </Text>
              </Pressable>

              {showPreview && (
                <View style={[s.previewBox, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
                  {rolePreview.map(r => {
                    const ro = villainTheme.roles[r.id];
                    const color = r.id === 'VILLAIN' ? villainTheme.color : r.color;
                    return (
                      <View key={r.id} style={s.previewRow}>
                        <Text style={s.previewEmoji}>{ro?.emoji ?? r.emoji}</Text>
                        <Text style={[s.previewName, { color, flex: 1 }]}>{ro?.name ?? r.name}</Text>
                        <View style={[s.previewCount, { backgroundColor: color + '33' }]}>
                          <Text style={[s.previewCountText, { color }]}>×{r.count}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}

              {players.map((p, i) => (
                <View key={p.id} style={[s.playerRow, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
                  <Text style={[s.num, { color: C.textDim }]}>{i + 1}</Text>
                  <Pressable style={[s.avatarBtn, { backgroundColor: C.surface, borderColor: C.cardBorder }]} onPress={() => setAvatarTarget(p.id)}>
                    <Text style={s.avatarEmoji}>{p.avatar}</Text>
                  </Pressable>
                  <TextInput
                    style={[s.input, { color: C.text, backgroundColor: C.surface, borderColor: C.cardBorder }]}
                    value={p.name} onChangeText={t2 => updateName(p.id, t2)}
                    placeholder={fill(t('setup_placeholder'), { n: i + 1 })} placeholderTextColor={C.textDim}
                    maxLength={16} autoCapitalize="words"
                  />
                  {players.length > 4 && (
                    <Pressable style={[s.removeBtn, { backgroundColor: C.evil + '33' }]} onPress={() => removePlayer(p.id)}>
                      <Text style={[s.removeTxt, { color: C.danger }]}>✕</Text>
                    </Pressable>
                  )}
                </View>
              ))}

              {players.length < 16 && (
                <Pressable style={[s.addBtn, { borderColor: C.primary, backgroundColor: C.primary + '08' }]} onPress={addPlayer}>
                  <Text style={[s.addTxt, { color: C.primary }]}>{t('setup_add_player')}</Text>
                </Pressable>
              )}

              {canQuickFill && (
                <Pressable style={[s.quickBtn, { borderColor: C.cardBorder, backgroundColor: C.card }]} onPress={quickFillPlayers}>
                  <Text style={[s.quickTxt, { color: C.textSecondary }]}>⚡ Quick Start (auto-fill 6 players)</Text>
                </Pressable>
              )}

              <Pressable style={[s.startBtn, { backgroundColor: canStart ? C.primary : C.textDim, shadowColor: C.primary }]} onPress={handleStart}>
                <Text style={s.startTxt}>{canStart ? t('setup_start_btn') : t('setup_start_disabled')}</Text>
              </Pressable>

              <Text style={[s.note, { color: C.textDim }]}>{t('setup_note')}</Text>
            </ScrollView>
          </TabletContainer>

          {/* Avatar picker overlay for setup-view players */}
          {avatarTarget !== null && (
            <Pressable style={s.overlayBg} onPress={() => setAvatarTarget(null)}>
              <Pressable style={[s.sheet, { backgroundColor: C.surface, borderColor: C.cardBorder }]} onPress={() => {}}>
                <Text style={[s.sheetTitle, { color: C.text }]}>{t('setup_avatar_title')}</Text>
                <ScrollView showsVerticalScrollIndicator={false} style={s.sheetScroll}>
                  {AVATAR_GROUPS.map(g => (
                    <View key={g.label} style={s.avatarGroupWrap}>
                      <Text style={[s.groupLabel, { color: C.textSecondary }]}>{g.label}</Text>
                      <View style={s.avatarGrid}>
                        {g.items.map(a => (
                          <Pressable key={a.id} style={[s.avatarOpt, { backgroundColor: C.card, borderColor: C.cardBorder }]} onPress={() => applyAvatar(avatarTarget, a.emoji)}>
                            <Text style={s.avatarOptEmoji}>{a.emoji}</Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </Pressable>
            </Pressable>
          )}
        </SafeAreaView>
      </Gradient>
    );
  }

  // ── render: roster ───────────────────────────────────────────────────
  if (view === 'roster') {
    return (
      <Gradient colors={villainTheme.gradientBg} style={s.flex}>
        <SafeAreaView style={s.flex}>
          <TabletContainer>
            <View style={[s.header, { borderBottomColor: C.cardBorder }]}>
              <Pressable onPress={() => setView('setup')}>
                <Text style={[s.backBtn, { color: C.primary }]}>{t('setup_back')}</Text>
              </Pressable>
              <Text style={[s.headerTitle, { color: C.text }]}>{t('roster_title')}</Text>
              <Pressable onPress={openNewGroup}>
                <Text style={[s.headerRight, { color: C.primary }]}>{t('roster_new')}</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
              {profiles.length === 0 ? (
                <View style={s.emptyWrap}>
                  <Text style={s.emptyIcon}>📋</Text>
                  <Text style={[s.emptyText, { color: C.textSecondary }]}>{t('roster_empty')}</Text>
                  <Pressable style={[s.addBtn, { borderColor: C.primary, backgroundColor: C.primary + '08', marginTop: 8 }]} onPress={openNewGroup}>
                    <Text style={[s.addTxt, { color: C.primary }]}>{t('roster_new')}</Text>
                  </Pressable>
                </View>
              ) : profiles.map(g => (
                <View key={g.id} style={[s.rosterCard, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
                  <View style={s.rosterCardLeft}>
                    <Text style={[s.rosterName, { color: C.text }]}>{g.name}</Text>
                    <Text style={[s.rosterCount, { color: C.textSecondary }]}>
                      {fill(t('roster_players'), { count: g.players.length })}
                    </Text>
                    <Text style={s.rosterAvatars} numberOfLines={1}>
                      {g.players.slice(0, 6).map(p => getAvatarEmoji(p.avatarId)).join(' ')}
                    </Text>
                  </View>
                  <View style={s.rosterActions}>
                    <Pressable style={[s.rosterActionBtn, { backgroundColor: C.primary + '22', borderColor: C.primary }]} onPress={() => loadGroupIntoSetup(g)}>
                      <Text style={[s.rosterActionTxt, { color: C.primary }]}>{t('roster_load')}</Text>
                    </Pressable>
                    <Pressable style={[s.rosterActionBtn, { backgroundColor: C.surface, borderColor: C.cardBorder }]} onPress={() => openEditGroup(g)}>
                      <Text style={[s.rosterActionTxt, { color: C.textSecondary }]}>{t('roster_edit')}</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </ScrollView>
          </TabletContainer>
        </SafeAreaView>
      </Gradient>
    );
  }

  // ── render: editGroup ────────────────────────────────────────────────
  if (view === 'editGroup') {
    const isNew = !activeGroup?.id;
    return (
      <Gradient colors={villainTheme.gradientBg} style={s.flex}>
        <SafeAreaView style={s.flex}>
          <TabletContainer>
            <View style={[s.header, { borderBottomColor: C.cardBorder }]}>
              <Pressable onPress={async () => {
                if (activeGroup?.name?.trim()) await saveGroup();
                else setView('roster');
              }}>
                <Text style={[s.backBtn, { color: C.primary }]}>{t('setup_back')}</Text>
              </Pressable>
              <Text style={[s.headerTitle, { color: C.text }]}>
                {isNew ? t('edit_group_title_new') : t('edit_group_title_edit')}
              </Text>
              <View style={{ minWidth: 70 }} />
            </View>
            <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <TextInput
                style={[s.rosterNameInput, { color: C.text, backgroundColor: C.card, borderColor: C.cardBorder }]}
                value={activeGroup?.name ?? ''}
                onChangeText={n => setActiveGroup(g => ({ ...g, name: n }))}
                placeholder={t('edit_group_name_placeholder')}
                placeholderTextColor={C.textDim}
                maxLength={30}
                autoCapitalize="words"
              />

              {(activeGroup?.players ?? []).map((p, i) => (
                <View key={p.id} style={[s.playerRow, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
                  <Text style={[s.num, { color: C.textDim }]}>{i + 1}</Text>
                  <Text style={[s.avatarEmoji, { width: 36, textAlign: 'center' }]}>{getAvatarEmoji(p.avatarId)}</Text>
                  <Text style={[s.playerNameTxt, { color: C.text }]}>{p.name}</Text>
                  <Pressable style={[s.editBtn, { borderColor: C.cardBorder, backgroundColor: C.surface }]} onPress={() => openEditPlayer(p)}>
                    <Text style={[s.editBtnTxt, { color: C.textSecondary }]}>✎</Text>
                  </Pressable>
                  <Pressable style={[s.removeBtn, { backgroundColor: C.evil + '33' }]} onPress={() => removePlayerFromGroup(p.id)}>
                    <Text style={[s.removeTxt, { color: C.danger }]}>✕</Text>
                  </Pressable>
                </View>
              ))}

              <Pressable style={[s.addBtn, { borderColor: C.primary, backgroundColor: C.primary + '08' }]} onPress={openNewPlayer}>
                <Text style={[s.addTxt, { color: C.primary }]}>{t('edit_group_add_player')}</Text>
              </Pressable>

              <Pressable style={[s.startBtn, { backgroundColor: C.primary, shadowColor: C.primary }]} onPress={saveGroup}>
                <Text style={s.startTxt}>{t('edit_group_save')}</Text>
              </Pressable>

              {!isNew && (
                <Pressable style={[s.deleteBtn, { borderColor: C.danger }]} onPress={confirmDeleteGroup}>
                  <Text style={[s.deleteBtnTxt, { color: C.danger }]}>{t('roster_delete')}</Text>
                </Pressable>
              )}
            </ScrollView>
          </TabletContainer>
        </SafeAreaView>
      </Gradient>
    );
  }

  // ── render: editPlayer ───────────────────────────────────────────────
  const canSavePlayer = !!activePlayer?.name?.trim();
  return (
    <Gradient colors={villainTheme.gradientBg} style={s.flex}>
      <SafeAreaView style={s.flex}>
        <TabletContainer>
          <View style={[s.header, { borderBottomColor: C.cardBorder }]}>
            <Pressable onPress={() => setView('editGroup')}>
              <Text style={[s.backBtn, { color: C.primary }]}>{t('setup_back')}</Text>
            </Pressable>
            <Text style={[s.headerTitle, { color: C.text }]}>{t('edit_player_title')}</Text>
            <Pressable onPress={savePlayer} disabled={!canSavePlayer}>
              <Text style={[s.headerRight, { color: canSavePlayer ? C.primary : C.textDim }]}>{t('edit_player_done')}</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={[s.playerPreview, { backgroundColor: C.card, borderColor: C.cardBorder }]}>
              <Text style={s.previewBigEmoji}>{getAvatarEmoji(activePlayer?.avatarId ?? 1)}</Text>
              <TextInput
                style={[s.playerNameInput, { color: C.text, borderBottomColor: C.cardBorder }]}
                value={activePlayer?.name ?? ''}
                onChangeText={n => setActivePlayer(p => ({ ...p, name: n }))}
                placeholder={t('edit_player_name_placeholder')}
                placeholderTextColor={C.textDim}
                maxLength={16}
                autoCapitalize="words"
                autoFocus
              />
            </View>

            {AVATAR_GROUPS.map(g => (
              <View key={g.label} style={s.avatarGroupWrap}>
                <Text style={[s.groupLabel, { color: C.textSecondary }]}>{g.label}</Text>
                <View style={s.avatarGrid}>
                  {g.items.map(a => {
                    const sel = activePlayer?.avatarId === a.id;
                    return (
                      <Pressable
                        key={a.id}
                        style={[s.avatarOpt, {
                          backgroundColor: sel ? C.primary + '33' : C.card,
                          borderColor: sel ? C.primary : C.cardBorder,
                          borderWidth: sel ? 2 : 1,
                        }]}
                        onPress={() => setActivePlayer(p => ({ ...p, avatarId: a.id }))}
                      >
                        <Text style={s.avatarOptEmoji}>{a.emoji}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}

            <Pressable style={[s.startBtn, { backgroundColor: canSavePlayer ? C.primary : C.textDim, shadowColor: C.primary }]} onPress={savePlayer}>
              <Text style={s.startTxt}>{t('edit_player_done')}</Text>
            </Pressable>
          </ScrollView>
        </TabletContainer>
      </SafeAreaView>
    </Gradient>
  );
}

const s = StyleSheet.create({
  flex:            { flex: 1 },
  // header
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  backBtn:         { ...FONTS.body, minWidth: 70 },
  headerTitle:     { flex: 1, textAlign: 'center', ...FONTS.subtitle },
  headerRight:     { ...FONTS.body, minWidth: 70, textAlign: 'right' },
  // scroll content
  content:         { padding: 20, paddingBottom: 60 },
  note:            { ...FONTS.small, textAlign: 'center', lineHeight: 20 },
  // role preview
  previewBanner:   { borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, alignItems: 'center' },
  previewText:     { ...FONTS.small },
  previewBox:      { borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, gap: 10 },
  previewRow:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  previewEmoji:    { fontSize: 20 },
  previewName:     { ...FONTS.body, fontWeight: '700' },
  previewCount:    { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  previewCountText:{ ...FONTS.label, fontSize: 13 },
  // player row (setup + editGroup shared)
  playerRow:       { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 10, marginBottom: 10, gap: 10, borderWidth: 1 },
  num:             { ...FONTS.small, width: 20, textAlign: 'center' },
  avatarBtn:       { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  avatarEmoji:     { fontSize: 24 },
  input:           { flex: 1, ...FONTS.body, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1 },
  removeBtn:       { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  removeTxt:       { fontSize: 14, fontWeight: '700' },
  playerNameTxt:   { flex: 1, ...FONTS.body },
  editBtn:         { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  editBtnTxt:      { fontSize: 16 },
  // buttons
  addBtn:          { borderWidth: 1.5, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 20 },
  addTxt:          { ...FONTS.body, fontWeight: '600' },
  quickBtn:        { borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 16 },
  quickTxt:        { ...FONTS.small, fontWeight: '700' },
  startBtn:        { borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 16, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  startTxt:        { color: '#000', ...FONTS.subtitle, fontWeight: '800', fontSize: 18 },
  deleteBtn:       { borderWidth: 1.5, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 20 },
  deleteBtnTxt:    { ...FONTS.body, fontWeight: '600' },
  // avatar picker (setup overlay + editPlayer)
  overlayBg:       { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
  sheet:           { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 34, borderWidth: 1, maxHeight: '72%' },
  sheetTitle:      { ...FONTS.subtitle, textAlign: 'center', marginBottom: 12 },
  sheetScroll:     { flexGrow: 0 },
  avatarGroupWrap: { marginBottom: 14 },
  groupLabel:      { ...FONTS.small, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  avatarGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  avatarOpt:       { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  avatarOptEmoji:  { fontSize: 26 },
  // roster view
  emptyWrap:       { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyIcon:       { fontSize: 48 },
  emptyText:       { ...FONTS.body, textAlign: 'center', lineHeight: 22 },
  rosterCard:      { borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rosterCardLeft:  { flex: 1, gap: 4 },
  rosterName:      { ...FONTS.subtitle, fontSize: 16 },
  rosterCount:     { ...FONTS.small },
  rosterAvatars:   { fontSize: 18, letterSpacing: 2 },
  rosterActions:   { gap: 8 },
  rosterActionBtn: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center' },
  rosterActionTxt: { ...FONTS.small, fontWeight: '700' },
  // editGroup view
  rosterNameInput: { ...FONTS.subtitle, borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1 },
  // editPlayer view
  playerPreview:   { borderRadius: 14, padding: 20, marginBottom: 20, borderWidth: 1, alignItems: 'center', gap: 12 },
  previewBigEmoji: { fontSize: 52 },
  playerNameInput: { ...FONTS.subtitle, width: '100%', textAlign: 'center', borderBottomWidth: 1, paddingBottom: 8 },
});
