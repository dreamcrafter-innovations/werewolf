// Each theme: palette (full color set) + roles (all 6 role name/emoji overrides)

const PALETTES = {
  DEMON:  { bg:'#0B0B1E', surface:'#131328', card:'#1A1A32', cardBorder:'#2A2A4A', primary:'#FF8C00', primaryLight:'#FFB347', evil:'#C0392B', evilGlow:'#FF4444', village:'#27AE60', text:'#EEE8F0', textSecondary:'#A8A0C8', textDim:'#706890', white:'#FFFFFF', danger:'#E74C3C', success:'#2ECC71', warning:'#F39C12' },
  WOLF:   { bg:'#060400', surface:'#0E0900', card:'#181200', cardBorder:'#2E2000', primary:'#C9820A', primaryLight:'#E8A830', evil:'#7D5A3C', evilGlow:'#C0852A', village:'#5A8A3A', text:'#F0E8D8', textSecondary:'#C0A870', textDim:'#887050', white:'#FFFFFF', danger:'#C0392B', success:'#27AE60', warning:'#E8A830' },
  VAMP:   { bg:'#0A0005', surface:'#150010', card:'#1E0018', cardBorder:'#3A0030', primary:'#C42080', primaryLight:'#E060A0', evil:'#8E1A5A', evilGlow:'#E030A0', village:'#1A8070', text:'#F0D0E8', textSecondary:'#C878B0', textDim:'#906080', white:'#FFFFFF', danger:'#C0392B', success:'#27AE60', warning:'#E8A830' },
  LION:   { bg:'#0A0600', surface:'#151000', card:'#1E1500', cardBorder:'#302200', primary:'#D4921A', primaryLight:'#F0B840', evil:'#B06010', evilGlow:'#E08020', village:'#5A8A3A', text:'#F8EDD0', textSecondary:'#C8A860', textDim:'#907050', white:'#FFFFFF', danger:'#C0392B', success:'#27AE60', warning:'#D4921A' },
  ZOMBIE: { bg:'#030A03', surface:'#0A150A', card:'#111E11', cardBorder:'#1E3A1E', primary:'#5A9E2F', primaryLight:'#7EC050', evil:'#3A7A1A', evilGlow:'#70C040', village:'#2A7A50', text:'#D4EDDA', textSecondary:'#90C870', textDim:'#608050', white:'#FFFFFF', danger:'#C0392B', success:'#5A9E2F', warning:'#A0B830' },
  FREDDY: { bg:'#0A0000', surface:'#150000', card:'#1A0505', cardBorder:'#3A0A0A', primary:'#B22222', primaryLight:'#D04040', evil:'#8B0000', evilGlow:'#E03030', village:'#1A6060', text:'#F0D8D8', textSecondary:'#C07880', textDim:'#906060', white:'#FFFFFF', danger:'#B22222', success:'#27AE60', warning:'#E8A830' },
  JASON:  { bg:'#000308', surface:'#000810', card:'#000D1A', cardBorder:'#001A30', primary:'#3A6EA5', primaryLight:'#5090C8', evil:'#1A4E8A', evilGlow:'#4080C0', village:'#1A7060', text:'#D0E8F8', textSecondary:'#88B0D0', textDim:'#507090', white:'#FFFFFF', danger:'#C0392B', success:'#27AE60', warning:'#E8A830' },
  WITCH:  { bg:'#06000E', surface:'#0D0018', card:'#120020', cardBorder:'#200038', primary:'#8B2ABE', primaryLight:'#B060E0', evil:'#6A1AA0', evilGlow:'#C060F0', village:'#1A6080', text:'#E8D0F8', textSecondary:'#B080D8', textDim:'#806098', white:'#FFFFFF', danger:'#C0392B', success:'#27AE60', warning:'#E8A830' },
  HINDI:   { bg:'#0A0600', surface:'#120A00', card:'#1C1000', cardBorder:'#332000', primary:'#FF9933', primaryLight:'#FFB84D', evil:'#8B0000', evilGlow:'#CC2200', village:'#138808', text:'#FFF3E0', textSecondary:'#D0A868', textDim:'#907050', white:'#FFFFFF', danger:'#E74C3C', success:'#2ECC71', warning:'#F39C12' },
  TAMIL:   { bg:'#0A0010', surface:'#120018', card:'#1A0022', cardBorder:'#300040', primary:'#CC0000', primaryLight:'#FF3333', evil:'#7B0000', evilGlow:'#DD0000', village:'#006633', text:'#FFE0E0', textSecondary:'#C87888', textDim:'#905068', white:'#FFFFFF', danger:'#E74C3C', success:'#2ECC71', warning:'#F39C12' },
  TELUGU:  { bg:'#000A08', surface:'#00150E', card:'#001C14', cardBorder:'#003028', primary:'#00A896', primaryLight:'#33C4B5', evil:'#006B5A', evilGlow:'#00D4B8', village:'#1A8040', text:'#D0F5F0', textSecondary:'#80C8B8', textDim:'#508878', white:'#FFFFFF', danger:'#E74C3C', success:'#2ECC71', warning:'#F39C12' },
  CHINESE: { bg:'#0A0000', surface:'#160000', card:'#200000', cardBorder:'#3A0000', primary:'#CC3333', primaryLight:'#E05555', evil:'#8B0000', evilGlow:'#DD2222', village:'#2A6E3A', text:'#FFF0E0', textSecondary:'#D09080', textDim:'#906858', white:'#FFFFFF', danger:'#E74C3C', success:'#2ECC71', warning:'#F39C12' },
  KOREAN:  { bg:'#060008', surface:'#0C0010', card:'#120018', cardBorder:'#200030', primary:'#FF6B35', primaryLight:'#FF8C5A', evil:'#8B2500', evilGlow:'#FF4A00', village:'#1A6B8A', text:'#FFE8D8', textSecondary:'#D09878', textDim:'#906858', white:'#FFFFFF', danger:'#E74C3C', success:'#2ECC71', warning:'#F39C12' },
  BANSHEE: { bg:'#04060A', surface:'#080C14', card:'#0C121E', cardBorder:'#182030', primary:'#7FB3D3', primaryLight:'#A0CCEE', evil:'#2A3A5A', evilGlow:'#8BAAD4', village:'#2D7A5A', text:'#E8F0F8', textSecondary:'#98C0D8', textDim:'#607888', white:'#FFFFFF', danger:'#E74C3C', success:'#2ECC71', warning:'#F39C12' },
  MEXICAN: { bg:'#04000A', surface:'#080012', card:'#0C001A', cardBorder:'#180030', primary:'#E8A020', primaryLight:'#F0C050', evil:'#8B0030', evilGlow:'#CC0040', village:'#1A7A5A', text:'#FFF0C8', textSecondary:'#C8A868', textDim:'#806848', white:'#FFFFFF', danger:'#E74C3C', success:'#2ECC71', warning:'#F39C12' },
  MAFIA:   { bg:'#070707', surface:'#0F0F0F', card:'#161616', cardBorder:'#252525', primary:'#C9A84C', primaryLight:'#E8C870', evil:'#8B0000', evilGlow:'#CC2200', village:'#2A4A6A', text:'#F0E8D0', textSecondary:'#C0A870', textDim:'#807050', white:'#FFFFFF', danger:'#E74C3C', success:'#27AE60', warning:'#C9A84C' },
  YAKSHI:  { bg:'#030A06', surface:'#060F08', card:'#0A1A0C', cardBorder:'#153020', primary:'#8BC34A', primaryLight:'#AED581', evil:'#1B5E20', evilGlow:'#4CAF50', village:'#2E7D32', text:'#E8F5E9', textSecondary:'#A0D080', textDim:'#608058', white:'#FFFFFF', danger:'#E74C3C', success:'#8BC34A', warning:'#F39C12' },
  VETALA:  { bg:'#050308', surface:'#0A0510', card:'#0F0818', cardBorder:'#1E1030', primary:'#7E57C2', primaryLight:'#9575CD', evil:'#4A148C', evilGlow:'#7B1FA2', village:'#1A6060', text:'#EDE7F6', textSecondary:'#B098D8', textDim:'#806898', white:'#FFFFFF', danger:'#E74C3C', success:'#27AE60', warning:'#F39C12' },
  ONI:     { bg:'#060000', surface:'#0D0200', card:'#160400', cardBorder:'#2A0A00', primary:'#E53935', primaryLight:'#EF5350', evil:'#B71C1C', evilGlow:'#E53935', village:'#1A6060', text:'#FFF3E0', textSecondary:'#D09080', textDim:'#906858', white:'#FFFFFF', danger:'#E53935', success:'#27AE60', warning:'#FFB300' },
  IFRIT:   { bg:'#050300', surface:'#0A0500', card:'#160800', cardBorder:'#2A1200', primary:'#FF6D00', primaryLight:'#FF9100', evil:'#BF360C', evilGlow:'#FF3D00', village:'#1A6060', text:'#FFF8E1', textSecondary:'#D0A068', textDim:'#906848', white:'#FFFFFF', danger:'#E53935', success:'#27AE60', warning:'#FF6D00' },
};

const ROLE_SETS = {
  DEMON:   {
    VILLAIN:   {name:'Demon',      emoji:'👿', hint:'Possesses one soul and destroys them each night'},
    VILLAGER:{name:'Mortal',     emoji:'🙍', hint:'No powers — survive by faith and wits alone'},
    SEER:  { name:'Cleric',      emoji:'📿', hint:'Holy rites reveal if a soul is damned or pure' },
    HEALER:   {name:'Monk',       emoji:'🙏', hint:'Sacred prayers can shield one soul each night'},
  },
  WOLF:    {
    VILLAIN:   {name:'Werewolf',   emoji:'🐺', hint:'Hunts under the full moon — one kill each night'},
    VILLAGER:{name:'Shepherd',   emoji:'🐑', hint:'Guards the flock — root out the wolf among you'},
    SEER:  {name:'Wolf Hunter',emoji:'🏹', hint:'Seasoned hunter who can sniff out the wolf'},
    HEALER:   {name:'Apothecary', emoji:'⚗️', hint:'Herbal cures can save one targeted villager'},
  },
  VAMP:    {
    VILLAIN:   {name:'Vampire',    emoji:'🧛', hint:'Drains the life from one mortal each night'},
    VILLAGER:{name:'Mortal',     emoji:'🧍', hint:'Unturned — expose the coven before dawn'},
    SEER:  {name:'Inquisitor', emoji:'🕵️', hint:'Senses the unholy taint lurking in a soul'},
    HEALER:   {name:'Priest',     emoji:'✝️', hint:'Holy blessing shields one from the vampire\'s bite'},
  },
  LION:    {
    VILLAIN:   {name:'Wild Lion',  emoji:'🦁', hint:'Stalks from the jungle — one prey claimed each night'},
    VILLAGER:{name:'Tribesman',  emoji:'🪃', hint:'Tribal villager — root out the apex predator'},
    SEER:  {name:'Hunter',     emoji:'🏹', hint:'Big-game hunter who can identify the lion in hiding'},
    HEALER:   {name:'Doctor',       emoji:'🌺',hint:'Jungle medicine can ward off the lion\'s kill'},
  },
  ZOMBIE:  {
    VILLAIN:   {name:'Zombie',     emoji:'🧟', hint:'Bites and infects one survivor each night'},
    VILLAGER:{name:'Survivor',   emoji:'🧢', hint:'Clinging to life — root out the infected'},
    SEER:  {name:'Scout',      emoji:'🔭', hint:'Scans ahead to identify the undead among you'},
    HEALER:   {name:'Medic',      emoji:'🩺', hint:'Field medicine saves one from infection each night'},
  },
  FREDDY:  {
    VILLAIN:   {name:'Freddy',     emoji:'🪚', hint:'Enters dreams and kills one sleeper each night'},
    VILLAGER:{name:'Dreamer',    emoji:'😴', hint:'Cannot escape sleep — stay on guard'},
    SEER:  {name:'Psychic',    emoji:'🧠', hint:'Senses minds that have been touched by Freddy'},
    HEALER:   {name:'Nurse',      emoji:'🏥', hint:'Sedatives protect one person\'s dreams each night'},
  },
  JASON:   {
    VILLAIN:   {name:'Jason',      emoji:'🔪', hint:'Silent and relentless — one kill each night'},
    VILLAGER:{name:'Camper',     emoji:'⛺', hint:'Stranded at camp — find Jason before he finds you'},
    SEER:  {name:'Detective',  emoji:'🔦', hint:'Investigates and reveals Jason\'s trail'},
    HEALER:   {name:'First Aid',  emoji:'🩹', hint:'Emergency kit saves one camper from death each night'},
  },
  WITCH:   {
    VILLAIN:   {name:'Witch',      emoji:'🧙', hint:'Casts a death hex on one villager each night'},
    VILLAGER:{name:'Peasant',    emoji:'🧑‍🌾', hint:'Ordinary folk — expose the witch before dawn'},
    SEER:  {name:'Witch Finder',emoji:'🕵️',hint:'Detects the magical mark branded on a witch'},
    HEALER:   {name:'Herbalist',  emoji:'🌿', hint:'Protective herbs block the witch\'s dark curse'},
  },
  HINDI:   {
    VILLAIN:   {name:'Shaitan',    emoji:'😈', hint:'Strikes down one innocent villager each night'},
    VILLAGER:{name:'Gaon Wasi',  emoji:'🧑‍🌾', hint:'Village dweller — use faith and courage'},
    SEER:  {name:'Tantrik',    emoji:'🔮', hint:'Ancient rituals reveal the Shaitan\'s true form'},
    HEALER:   {name:'Vaidya',     emoji:'🌿', hint:'Sacred healing herbs protect one soul each night'},
  },
  TAMIL:   {
    VILLAIN:   {name:'Poochandi',  emoji:'👻', hint:'Claims one soul lurking in the night shadows'},
    VILLAGER:{name:'Naattaar',   emoji:'🧑‍🌾', hint:'Village elder — unmask the village boogeyman'},
    SEER:  {name:'Jothidar',   emoji:'⭐', hint:'The stars reveal who walks with the darkness'},
    HEALER:   {name:'Vaidhyar',   emoji:'🌿', hint:'Ancient herbs guard one from Poochandi\'s touch'},
  },
  TELUGU:  {
    VILLAIN:   {name:'Pisachi',    emoji:'🧟', hint:'Prowls the ruins and consumes one each night'},
    VILLAGER:{name:'Gramasthudu',emoji:'🧑‍🌾', hint:'Living in fear of the wandering demoness'},
    SEER:  {name:'Jyotishkudu',emoji:'🔮', hint:'Reads the aura of those tainted by the Pisachi'},
    HEALER:   {name:'Vaidyudu',   emoji:'🌿', hint:'Sacred medicine shields one from the demoness'},
  },
  CHINESE: {
    VILLAIN:   {name:'Jiangshi',   emoji:'🧟', hint:'Drains the life force of one victim each night'},
    VILLAGER:{name:'Cunmin',     emoji:'🧑‍🌾', hint:'Village folk — expose the hopping dead'},
    SEER:  {name:'Daoshi',     emoji:'☯️', hint:'Taoist rites reveal the undead among the living'},
    HEALER:   {name:'Yaoshi',     emoji:'💊', hint:'Ancient cures shield one from the Jiangshi\'s drain'},
  },
  KOREAN:  {
    VILLAIN:   {name:'Gumiho',     emoji:'🦊', hint:'Bewitches and eliminates one villager each night'},
    VILLAGER:{name:'Minjung',    emoji:'🧑‍🌾', hint:'Common folk — see through the fox\'s disguise'},
    SEER:  {name:'Mudang',     emoji:'🔮', hint:'Shamanic vision pierces the Gumiho\'s illusion'},
    HEALER:   {name:'Hanuisa',    emoji:'🌿', hint:'Traditional medicine guards one from the fox spirit'},
  },
  BANSHEE: {
    VILLAIN:   {name:'Banshee',    emoji:'👻', hint:'Her wail condemns one clansman to death each night'},
    VILLAGER:{name:'Clansman',   emoji:'🧑', hint:'Clan member — identify the Banshee before the wail'},
    SEER:  {name:'Druid',      emoji:'🌙', hint:'Ancient lore reveals who has been marked by the wail'},
    HEALER:   {name:'Bean Feasa', emoji:'🌿', hint:'Wise woman\'s charm silences the wail for one'},
  },
  MEXICAN: {
    VILLAIN:   {name:'La Llorona', emoji:'😭', hint:'Drags one unsuspecting soul to the river each night'},
    VILLAGER:{name:'Aldeano',    emoji:'🧑‍🌾', hint:'Village folk — find La Llorona before dawn'},
    SEER:  {name:'Bruja',      emoji:'🧙', hint:'Can sense who the weeping woman has chosen'},
    HEALER:   {name:'Curandero',  emoji:'🌺', hint:'Folk magic shields one from La Llorona\'s reach'},
  },
  MAFIA:   {
    VILLAIN:   {name:'Mafia',      emoji:'🤵', hint:'The family silences one threat each night'},
    VILLAGER:{name:'Citizen',    emoji:'👨‍💼', hint:'Law-abiding — expose the family before it\'s too late'},
    SEER:  {name:'Detective',  emoji:'🕵️', hint:'Investigates and exposes criminal connections'},
    HEALER:   {name:'Doctor',     emoji:'⚕️', hint:'Medical skills save one targeted by the family'},
  },
  YAKSHI:  {
    VILLAIN:   {name:'Yakshi',     emoji:'🌺', hint:'Lures one soul under the pala tree each night'},
    VILLAGER:{name:'Nattukkaaran',emoji:'🧑‍🌾', hint:'Country folk — beware the pala tree\'s shadow'},
    SEER:  {name:'Manthravadi',emoji:'🔯', hint:'Sacred mantras expose the Yakshi\'s true form'},
    HEALER:   {name:'Vaidyan',    emoji:'🌿', hint:'Ayurvedic remedies shield one from the Yakshi\'s lure'},
  },
  VETALA:  {
    VILLAIN:   {name:'Vetala',     emoji:'💀', hint:'Inhabits a corpse and claims one each night'},
    VILLAGER:{name:'Ooru Jana',  emoji:'🧑‍🌾', hint:'Village folk — the Vetala walks among you'},
    SEER:  {name:'Tantrika',   emoji:'🔯', hint:'Tantric power reveals which body the Vetala inhabits'},
    HEALER:   {name:'Vaidyaru',   emoji:'🌿', hint:'Healing arts protect one from the Vetala\'s possession'},
  },
  ONI:     {
    VILLAIN:   {name:'Oni',        emoji:'👹', hint:'Crushes one villager with iron club each night'},
    VILLAGER:{name:'Chomin',     emoji:'🧑‍🌾', hint:'Common folk — the fearsome Oni hides in plain sight'},
    SEER:  {name:'Onmyoji',    emoji:'🌟', hint:'Mystic arts reveal the Oni\'s demonic aura'},
    HEALER:   {name:'Miko',       emoji:'⛩️', hint:'Shrine maiden\'s blessing shields one from the Oni'},
  },
  IFRIT:   {
    VILLAIN:   {name:'Ifrit',      emoji:'🔥', hint:'Burns away one soul with smokeless fire each night'},
    VILLAGER:{name:'Muwatin',    emoji:'🧑‍🌾', hint:'Desert dweller — root out the fire spirit'},
    SEER:  {name:'Kaahin',     emoji:'🔮', hint:'Prophetic vision sees through the Ifrit\'s disguise'},
    HEALER:   {name:'Hakim',      emoji:'💊', hint:'Ancient medicine shields one from the Ifrit\'s flames'},
  },
};

export const VILLAIN_THEMES = {
  MAFIA:   { id:'MAFIA',   paletteKey:'MAFIA',   roleSetKey:'MAFIA',   label:'Mafia',       sublabel:'Crime Syndicate',  emoji:'🤵', color:'#C9A84C', bgColor:'#100808', gradientBg:['#040404','#080808','#0E0C08'], tagline:'Vote wrong. Sleep wrong. 🤵',                           description:"You are the Mafia! Each night the family silences one threat. By day you're just another concerned citizen. Omertà — nobody squeals in this family!",              nightWake:'Mafia, wake up! 🤵',      nightInstruction:'Mafia, open your eyes.\nLook around — your family is awake.\n\nChoose your target for tonight! 🎯',           winText:'The Mafia Wins! 🤵',           loseText:'The Mafia has been brought to justice!', homeMoon:'🌃', atmosphere:'The family makes offers you cannot refuse...', knowsAlliesDefault:true },
  SHER:    { id:'SHER',    paletteKey:'LION',   roleSetKey:'LION',   label:'Wild Lion',  sublabel:'Jungle Predator', emoji:'🦁', color:'#D4921A', bgColor:'#1A0E00', gradientBg:['#0A0600','#151000','#1E1500'],  tagline:'King of the jungle is hungry. Is it you? 🦁',          description:'You are the Wild Lion! Crept out of the jungle and straight into the village. Claim one victim each night — then look innocent at breakfast!',                   nightWake:'Wild Lions, wake up! 🦁', nightInstruction:'Wild Lions, open your eyes.\nLook around — your pride is awake.\n\nChoose your prey for tonight! 🎯',               winText:'The Wild Lions Win! 🦁',        loseText:'The Wild Lions have been captured!',  homeMoon:'🌕', atmosphere:'A terrifying roar echoes from the jungle...', knowsAlliesDefault:true },
  DAYAN:   { id:'DAYAN',   paletteKey:'WITCH',  roleSetKey:'WITCH',  label:'Witch',      sublabel:'Dark Magic',      emoji:'🧙', color:'#8B2ABE', bgColor:'#0D0018', gradientBg:['#06000E','#0D0018','#120020'],  tagline:'She hexed you already. You just don\'t know it yet. 🧙', description:"You are the Witch! With dark magic you eliminate one villager each night. You've been in this village forever — no one suspects sweet old you!",               nightWake:'Witches, wake up! 🧙',    nightInstruction:'Witches, open your eyes.\nLook around — your coven is awake.\n\nChoose who to cast your dark spell on tonight! 🔮', winText:'The Witches Win! 🧙',           loseText:'The Witches have been caught!',        homeMoon:'🌑', atmosphere:'Dark magic fills the air tonight...', knowsAlliesDefault:true },
  BHEDIYA: { id:'BHEDIYA', paletteKey:'WOLF',   roleSetKey:'WOLF',   label:'Werewolf',   sublabel:'Classic Wolf',    emoji:'🐺', color:'#C9820A', bgColor:'#1A0D00', gradientBg:['#060400','#0E0900','#141000'],  tagline:'Someone howled at the moon last night. Suspicious. 🐺',description:'You are a Werewolf! Under the full moon you secretly eliminate a villager. By day you look completely normal — no one suspects a thing!',                        nightWake:'Werewolves, wake up! 🐺', nightInstruction:'Werewolves, open your eyes.\nLook around — your pack is awake.\n\nChoose who you will hunt tonight! 🎯',          winText:'The Werewolves Win! 🐺',        loseText:'All Werewolves have been defeated!',  homeMoon:'🌕', atmosphere:'The full moon rises over the haunted forest...', knowsAlliesDefault:true },
  VAMPIR:  { id:'VAMPIR',  paletteKey:'VAMP',   roleSetKey:'VAMP',   label:'Vampire',    sublabel:'Blood Drinker',   emoji:'🧛', color:'#C42080', bgColor:'#1A0010', gradientBg:['#0A0008','#130010','#1A0015'],  tagline:'Someone skipped lunch. You\'re dessert. 🧛',           description:'You are a Vampire! Each night you drain the life from one villager. You fear the sunlight — but the night belongs entirely to you!',                             nightWake:'Vampires, wake up! 🧛',   nightInstruction:'Vampires, open your eyes.\nLook around — your coven is awake.\n\nChoose whose blood you will drink tonight! 🩸',   winText:'The Vampires Win! 🧛',          loseText:'All Vampires have been destroyed!',   homeMoon:'🌑', atmosphere:'The graveyard stirs as midnight approaches...', knowsAlliesDefault:true },
  ZOMBIE:  { id:'ZOMBIE',  paletteKey:'ZOMBIE', roleSetKey:'ZOMBIE', label:'Zombie',     sublabel:'Undead Horde',    emoji:'🧟', color:'#5A9E2F', bgColor:'#061200', gradientBg:['#020800','#060E00','#091200'],  tagline:'The dead outnumbered you last night. Sleep tight. 🧟', description:'You are a Zombie! Once dead, now undead — and spreading the curse. Each night you bite one survivor. The horde grows. The village shrinks. Simple math!',      nightWake:'Zombies, wake up! 🧟',    nightInstruction:'Zombies, open your eyes.\nLook around — your horde is awake.\n\nChoose who you will bite tonight! 🧠',               winText:'The Zombies Win! 🧟',           loseText:'All Zombies have been stopped!',       homeMoon:'🌑', atmosphere:'Shuffling sounds echo from the cemetery...', knowsAlliesDefault:true },
  FREDDY:  { id:'FREDDY',  paletteKey:'FREDDY', roleSetKey:'FREDDY', label:'Freddy',     sublabel:'Dream Killer',    emoji:'🪚', color:'#B22222', bgColor:'#1A0000', gradientBg:['#0A0000','#150000','#1A0505'],  tagline:'Sweet dreams! Just kidding, please don\'t sleep. 🪚',  description:"You are Freddy! You invade people's dreams and eliminate them in their sleep. Pro tip: stay awake long enough to point fingers at someone else!",               nightWake:'Freddy, wake up! 🪚',     nightInstruction:'Freddy, open your eyes.\nChoose whose dream you will enter tonight! 😴',                                         winText:'Freddy Wins! 🪚',               loseText:'Freddy has been defeated!',           homeMoon:'🌑', atmosphere:'No one dares to fall asleep tonight...', knowsAlliesDefault:false },
  JASON:   { id:'JASON',   paletteKey:'JASON',  roleSetKey:'JASON',  label:'Jason',      sublabel:'The Slasher',     emoji:'🔪', color:'#3A6EA5', bgColor:'#000A1A', gradientBg:['#000308','#000810','#000D1A'],  tagline:'He doesn\'t run. He doesn\'t need to. 🔪',             description:"You are Jason! Masked and utterly silent, you creep through the night. One target. No witnesses. No footprints. Just a hockey mask and a very bad reputation!", nightWake:'Jason, wake up! 🔪',      nightInstruction:'Jason, open your eyes.\nChoose your target for tonight! 🎯',                                                     winText:'Jason Wins! 🔪',                loseText:'Jason has been stopped!',             homeMoon:'🌑', atmosphere:'Someone is hiding at the camp...', knowsAlliesDefault:false },
  VILLAIN:  { id:'VILLAIN',  paletteKey:'DEMON',  roleSetKey:'DEMON',  label:'Demon',      sublabel:'Classic',         emoji:'👿', color:'#C0392B', bgColor:'#1A0000', gradientBg:['#050510','#0B0B1E','#12082A'], tagline:'One soul sold. Yours is next. 👿',                      description:'You are the Demon! Each night you secretly eliminate a villager. By day you gasp loudly, suggest innocent suspects, and nod along at prayers. Diabolical!',     nightWake:'Demons, wake up! 👿',     nightInstruction:'Demons, open your eyes.\nLook around — your fellow Demons are awake.\n\nNow choose your target for tonight! 🎯', winText:'The Demons Win! 👿',            loseText:'All Demons have been defeated!',      homeMoon:'🌕', atmosphere:'Something evil is hiding in the village...', knowsAlliesDefault:true },
  GUMIHO:  { id:'GUMIHO',  paletteKey:'KOREAN',  roleSetKey:'KOREAN',  label:'Gumiho',      sublabel:'Nine-Tailed Fox', international:true,  emoji:'🦊', color:'#FF6B35', bgColor:'#130800', gradientBg:['#04000A','#060008','#0C0010'], tagline:'Nine tails. One face. Zero mercy. 🦊',                description:"You are the Gumiho! A nine-tailed fox in human form. Each night you bewitch and eliminate a villager. Your beauty is your cover — and it never cracks!",        nightWake:'Gumiho, wake up! 🦊',    nightInstruction:'Gumiho, open your eyes.\nLook around — your pack is awake.\n\nChoose who you will bewitch tonight! 🎯',           winText:'The Gumiho Win! 🦊',           loseText:'The Gumiho have been defeated!',      homeMoon:'🌕', atmosphere:'The nine-tailed fox walks among us, wearing a human face...', knowsAlliesDefault:true },
  IFRIT:   { id:'IFRIT',   paletteKey:'IFRIT',   roleSetKey:'IFRIT',   label:'Ifrit',      sublabel:'Arabian Fire Spirit',   international:true, emoji:'🔥', color:'#FF6D00', bgColor:'#160800', gradientBg:['#050300','#0A0500','#160800'], tagline:'Smokeless fire. Endless grudge. Terrible neighbour. 🔥', description:"You are the Ifrit! A fire spirit of Arabian legend with a personal grudge and no chill. Each night you burn away one soul — no charm can protect them!",    nightWake:'Ifrit, wake up! 🔥', nightInstruction:'Ifrit, open your eyes.\nLook around — your kind are awake.\n\nChoose who the fire will claim tonight! 🔥', winText:'The Ifrit Win! 🔥', loseText:'The Ifrit have been sealed!', homeMoon:'🌙', atmosphere:'The scent of smokeless fire drifts through the night...', knowsAlliesDefault:true },
  LLORONA: { id:'LLORONA', paletteKey:'MEXICAN', roleSetKey:'MEXICAN', label:'La Llorona',   sublabel:'Mexican Legend',   emoji:'😭', color:'#E8A020', bgColor:'#08001A', gradientBg:['#040008','#060010','#080018'], tagline:'She\'ll cry about it. Then take you with her. 😭',     description:"You are La Llorona! The weeping woman who lurks by the river. Each night you drag one soul into the water. Weep with the village by day, strike by night!",   nightWake:'La Llorona, wake up! 😭', nightInstruction:'La Llorona, open your eyes.\nYou weep alone tonight.\n\nChoose who you will take! 😭',                        winText:'La Llorona Wins! 😭',          loseText:'La Llorona has been laid to rest!',   homeMoon:'🌊', atmosphere:'She weeps by the river — and takes the unwary...', knowsAlliesDefault:false, international:true },
  JIANGSHI:{ id:'JIANGSHI',paletteKey:'CHINESE', roleSetKey:'CHINESE', label:'Jiangshi',    sublabel:'Chinese Vampire', international:true,  emoji:'🧟', color:'#CC3333', bgColor:'#1A0000', gradientBg:['#060000','#0A0000','#140000'], tagline:'Hops. Bounces. Drains. Deadly. Don\'t let it breathe on you. 🧟', description:"You are the Jiangshi! A hopping vampire risen from the grave. Each night you drain one villager. By day you stand perfectly still, looking normal-ish.", nightWake:'Jiangshi, wake up! 🧟',   nightInstruction:'Jiangshi, open your eyes.\nLook around — your clan is awake.\n\nChoose who to drain tonight! 🎯',                winText:'The Jiangshi Win! 🧟',          loseText:'All Jiangshi have been destroyed!',   homeMoon:'🏮', atmosphere:'The Jiangshi rise when the moon turns red...', knowsAlliesDefault:true },
  ONI:     { id:'ONI',     paletteKey:'ONI',     roleSetKey:'ONI',     label:'Oni',        sublabel:'Japanese Demon',        international:true, emoji:'👹', color:'#E53935', bgColor:'#160400', gradientBg:['#060000','#0D0200','#160400'], tagline:'Big. Blue. Carrying a club. Also your friend? Probably. 👹', description:"You are the Oni! A fearsome demon of Japanese legend — iron club, burning eyes. Each night you crush one villager. The clan can't stop you unless they find you!", nightWake:'Oni, wake up! 👹', nightInstruction:'Oni, open your eyes.\nLook around — your kin are awake.\n\nChoose who you will crush tonight! 🎯', winText:'The Oni Win! 👹', loseText:'All Oni have been sealed away!', homeMoon:'🏮', atmosphere:'A fearsome red shadow moves through the village...', knowsAlliesDefault:true },
  BANSHEE: { id:'BANSHEE', paletteKey:'BANSHEE', roleSetKey:'BANSHEE', label:'Banshee',      sublabel:'Celtic Spirit',   international:true,    emoji:'👻', color:'#7FB3D3', bgColor:'#060A10', gradientBg:['#04060A','#060810','#080C14'], tagline:'She screamed your name. That\'s... bad. 👻',           description:"You are the Banshee! A wailing spirit of Celtic legend — each night your ghostly shriek condemns one villager to death. Blame the wind. They always do.",      nightWake:'Banshee, wake up! 👻',    nightInstruction:'Banshee, open your eyes.\nYou wail alone tonight — none can escape your call.\n\nChoose who you will wail for! 🎯', winText:'The Banshee Wins! 👻',         loseText:'The Banshee has been silenced!',      homeMoon:'🌫️', atmosphere:'A wailing cry echoes through the mist...', knowsAlliesDefault:false },
  HINDI:   { id:'HINDI',   paletteKey:'HINDI',   roleSetKey:'HINDI',   label:'Shaitan',     sublabel:'Hindi Horror',    international:true,     emoji:'😈', color:'#FF9933', bgColor:'#1A0D00', gradientBg:['#050300','#0A0600','#120A00'], tagline:'Fasts by day, haunts by night. Classic Shaitan. 😈',  description:"You are the Shaitan! By night you strike, by day you join the temple prayers and look deeply concerned. No one suspects the most devout villager!",            nightWake:'Shaitan, wake up! 😈',    nightInstruction:'Shaitan, open your eyes.\nLook around — your allies are awake.\n\nChoose tonight\'s target! 🎯',                 winText:'Shaitan Wins! 😈',              loseText:'All Shaitans have been defeated!',    homeMoon:'🌕', atmosphere:'Shaitan roams the village after dark...', knowsAlliesDefault:true },
  TAMIL:   { id:'TAMIL',   paletteKey:'TAMIL',   roleSetKey:'TAMIL',   label:'Poochandi',   sublabel:'Tamil Boogeyman', international:true,  emoji:'👻', color:'#CC0000', bgColor:'#1A0010', gradientBg:['#070005','#0A0010','#120018'], tagline:'The elders warned you about Poochandi. You didn\'t listen. 👻', description:"You are Poochandi! The village boogeyman who haunts the unwary at night. Your name alone makes children hide. Time to live up to the legend!",              nightWake:'Poochandi, wake up! 👻',  nightInstruction:'Poochandi, open your eyes.\nYou walk alone tonight.\n\nChoose who you will haunt! 🎯',                          winText:'Poochandi Wins! 👻',            loseText:'Poochandi has been banished!',        homeMoon:'🌑', atmosphere:'Poochandi is coming... watch the shadows!', knowsAlliesDefault:false },
  TELUGU:  { id:'TELUGU',  paletteKey:'TELUGU',  roleSetKey:'TELUGU',  label:'Pisachi',     sublabel:'Telugu Demoness', international:true,  emoji:'🧟', color:'#00A896', bgColor:'#001A14', gradientBg:['#000806','#000A08','#001510'], tagline:'She prowls the ruins. And your living room. 🧟',       description:"You are the Pisachi! A demoness who haunts the darkness. Each night you claim a victim before dawn. By day you blend in perfectly — demonesses do that!",    nightWake:'Pisachi, wake up! 🧟',    nightInstruction:'Pisachi, open your eyes.\nLook around — your sisters are awake.\n\nChoose your victim for tonight! 🎯',            winText:'The Pisachi Win! 🧟',           loseText:'The Pisachi have been exorcised!',    homeMoon:'🌑', atmosphere:'The Pisachi haunts the village ruins...', knowsAlliesDefault:true },
  YAKSHI:  { id:'YAKSHI',  paletteKey:'YAKSHI',  roleSetKey:'YAKSHI',  label:'Yakshi',     sublabel:'Kerala Spirit',        international:true, emoji:'🌺', color:'#8BC34A', bgColor:'#001A0E', gradientBg:['#030A06','#060F08','#0A1A0C'], tagline:'Beautiful. Deadly. DO NOT look up at the tree. 🌺',   description:"You are the Yakshi! Kerala's most beautiful and most dangerous spirit. Each night you lure the unwary under the pala tree. They never come back smiling.", nightWake:'Yakshi, wake up! 🌺', nightInstruction:'Yakshi, open your eyes.\nYou walk alone tonight.\n\nChoose who you will lure! 🌺', winText:'The Yakshi Wins! 🌺', loseText:'The Yakshi has been banished!', homeMoon:'🌿', atmosphere:'The pala tree sways in the moonlight... do not look up...', knowsAlliesDefault:false },
  VETALA:  { id:'VETALA',  paletteKey:'VETALA',  roleSetKey:'VETALA',  label:'Vetala',     sublabel:'Kannada Corpse Spirit', international:true, emoji:'💀', color:'#7E57C2', bgColor:'#0F0818', gradientBg:['#050308','#0A0510','#0F0818'], tagline:'Your dead neighbour just blinked. That\'s new. 💀',    description:"You are the Vetala! A spirit that inhabits corpses and walks among the living. Each night you claim a new body. The village won't know until someone counts.", nightWake:'Vetala, wake up! 💀', nightInstruction:'Vetala, open your eyes.\nLook around — your kindred are awake.\n\nChoose who you will possess tonight! 🎯', winText:'The Vetala Win! 💀', loseText:'All Vetala have been exorcised!', homeMoon:'🌑', atmosphere:'Something stirs in the graveyard tonight...', knowsAlliesDefault:true }
};

// ─── Per-theme kill / quiet flavor text ──────────────────────────────────────
const THEME_FLAVOR = {
  MAFIA:    { killAction:'silenced by the Family 🤵',              killFlavor:'A note was left on the doorstep. Nobody heard a thing.',                              quietFlavor:'The Family held back tonight... but the offer still stands.' },
  VILLAIN:   { killAction:'possessed and destroyed by the Demon 👿', killFlavor:'Strange markings covered the walls. The victim never saw it coming.',                 quietFlavor:'The Demon waited in the shadows... biding its time.' },
  BHEDIYA:  { killAction:'hunted by the pack 🐺',                  killFlavor:'Claw marks on the door. Moonlit paw prints led into the dark forest.',                 quietFlavor:'The wolves howled in the distance... but did not strike tonight.' },
  VAMPIR:   { killAction:'drained by the Vampire 🧛',              killFlavor:'Not a drop of blood remained. Two pale marks on the neck.',                            quietFlavor:'The Vampire circled in the night... but no one was bitten.' },
  SHER:     { killAction:'taken by the Wild Lion 🦁',              killFlavor:'A terrifying roar echoed at dawn. The tracks led deep into the jungle.',              quietFlavor:'The lion prowled the perimeter... but no prey was taken tonight.' },
  ZOMBIE:   { killAction:'bitten and turned by the horde 🧟',      killFlavor:'Teeth marks and torn clothing. Another has joined the undead.',                        quietFlavor:'The horde shuffled through the night... but no one was bitten.' },
  FREDDY:   { killAction:'taken in their sleep by Freddy 🪚',      killFlavor:'They never woke up. Fingernail scratches were found on the bedframe...',              quietFlavor:'Freddy stalked through dreams... but chose to wait tonight.' },
  JASON:    { killAction:'slashed by Jason 🔪',                    killFlavor:'Silence at the campsite. A hockey mask glimpsed at the treeline.',                     quietFlavor:'Footsteps in the dark... but Jason did not strike tonight.' },
  DAYAN:    { killAction:'hexed by the Witch 🧙',                  killFlavor:'A hex mark was scratched on the door. The curse was cast at midnight.',               quietFlavor:'The cauldron bubbled deep in the forest... but no spell was cast tonight.' },
  HINDI:    { killAction:'struck down by the Shaitan 😈',          killFlavor:'The oil lamp was found shattered. No one heard the Shaitan leave.',                    quietFlavor:'The Shaitan lurked in the darkness... but held its hand tonight.' },
  TAMIL:    { killAction:'taken by Poochandi 👻',                  killFlavor:'A shadow passed through the village at midnight. Poochandi claimed a soul.',            quietFlavor:'Poochandi watched from the darkness... but did not strike tonight.' },
  TELUGU:   { killAction:'claimed by the Pisachi 🧟',              killFlavor:'The ruins echoed with a wail at dawn. Another soul consumed by the demoness.',          quietFlavor:'The Pisachi prowled the ruins... but chose to wait in the dark.' },
  JIANGSHI: { killAction:'drained by the Jiangshi 🧟',             killFlavor:'The victim stood frozen at dawn. Every last breath of life had been absorbed.',         quietFlavor:'The Jiangshi stood perfectly still through the night... and waited.' },
  GUMIHO:   { killAction:'bewitched by the Gumiho 🦊',             killFlavor:'A trail of fox fire led from the house. The Gumiho had fed well.',                   quietFlavor:'The nine-tailed fox watched with golden eyes... but did not hunt tonight.' },
  BANSHEE:  { killAction:"condemned by the Banshee's wail 👻",     killFlavor:'A shriek was heard in the mist before dawn. The whole clan mourns.',                   quietFlavor:"The mist rolled in silently... the Banshee's wail did not come tonight." },
  LLORONA:  { killAction:'taken to the river by La Llorona 😭',    killFlavor:"Wet footprints led to the water's edge. The weeping was heard at midnight.",          quietFlavor:'She wept by the river... but no one was taken tonight.' },
  YAKSHI:   { killAction:'lured away by the Yakshi 🌺',            killFlavor:'A trail of pala flowers led to the edge of the forest. The victim never returned.',    quietFlavor:'The pala tree was still tonight... but the Yakshi still walks.' },
  VETALA:   { killAction:'claimed by the Vetala 💀',               killFlavor:'The body was found at dawn — cold and lifeless. The Vetala had found a new host.',     quietFlavor:'Shadows moved in the graveyard... but no one was claimed tonight.' },
  ONI:      { killAction:'crushed by the Oni 👹',                  killFlavor:"The sound of an iron club echoed before dawn. The clan found the victim at sunrise.",   quietFlavor:"The Oni's lantern burned in the distance... but no one was struck tonight." },
  IFRIT:    { killAction:'consumed by the Ifrit 🔥',               killFlavor:'Nothing but ash remained. The Ifrit left no trace — only the smell of fire.',           quietFlavor:'The desert wind carried whispers... but no flames rose tonight.' },
};

const THEME_WIN_SUBTEXT = {
  MAFIA: 'The Family now controls the town.',
  VILLAIN: 'Darkness has claimed the village.',
  BHEDIYA: 'The pack now rules the forest edge.',
  VAMPIR: 'The night belongs to the coven.',
  SHER: 'The jungle predator sits atop the food chain.',
  ZOMBIE: 'The horde grows. The living are outnumbered.',
  FREDDY: 'No one can sleep safely anymore.',
  JASON: 'Camp is silent. The slasher remains.',
  DAYAN: 'The coven\'s curse has swallowed the village.',
  HINDI: 'Shaitan now stalks every dark lane.',
  TAMIL: 'Poochandi owns the shadows tonight.',
  TELUGU: 'The Pisachi now haunts every doorway.',
  JIANGSHI: 'The hopping dead rule after dusk.',
  GUMIHO: 'The fox spirit walks unchallenged among humans.',
  BANSHEE: 'The wail is answered by silence.',
  LLORONA: 'The river takes one more village.',
  YAKSHI: 'The pala tree has claimed the night.',
  VETALA: 'The corpse spirit now wears many faces.',
  ONI: 'The iron club has broken the clan\'s will.',
  IFRIT: 'Smokeless fire now owns the night.',
};

const THEME_AFTERLIFE = {
  MAFIA: { term: 'Informants', emoji: '🕶️' },
  VILLAIN: { term: 'Shades', emoji: '👻' },
  BHEDIYA: { term: 'Moon Spirits', emoji: '🌕' },
  VAMPIR: { term: 'Restless Souls', emoji: '🦇' },
  SHER: { term: 'Jungle Spirits', emoji: '🌿' },
  ZOMBIE: { term: 'The Undead', emoji: '🧟' },
  FREDDY: { term: 'Dream Echoes', emoji: '💤' },
  JASON: { term: 'Camp Whispers', emoji: '🏕️' },
  DAYAN: { term: 'Hexed Spirits', emoji: '🔮' },
  HINDI: { term: 'Night Watchers', emoji: '🌙' },
  TAMIL: { term: 'Shadow Watchers', emoji: '🕯️' },
  TELUGU: { term: 'Ruin Echoes', emoji: '🏚️' },
  JIANGSHI: { term: 'Lantern Souls', emoji: '🏮' },
  GUMIHO: { term: 'Fox Echoes', emoji: '🦊' },
  BANSHEE: { term: 'Mist Echoes', emoji: '🌫️' },
  LLORONA: { term: 'River Echoes', emoji: '🌊' },
  YAKSHI: { term: 'Pala Spirits', emoji: '🌺' },
  VETALA: { term: 'Grave Echoes', emoji: '💀' },
  ONI: { term: 'Clan Ancestors', emoji: '👹' },
  IFRIT: { term: 'Ash Spirits', emoji: '🔥' },
};

// Theme-specific descriptions, taglines shown at role reveal (VILLAIN desc comes from VILLAIN_THEMES.description)
const ROLE_DESCRIPTIONS = {
  DEMON:   {
    VILLAGER:{ description:"You are a Mortal! No divine powers — just faith and suspicion. Unmask the Demon walking among you before it claims every soul!", tagline:"Ordinary flesh... but truth fights back!" },
    SEER: { description:"You are the Cleric! Each night your holy rites reveal whether one soul is damned or pure. Guard your gift — the Demon hunts the wise first!", tagline:"Sacred rites light the darkest corners!" },
    HEALER:  { description:"You are the Monk! Each night your sacred prayers shield one soul from the Demon's possession. You may protect yourself — but only once!", tagline:"Prayer is your shield against the night!" },
  },
  WOLF:    {
    VILLAGER:{ description:"You are a Shepherd! No special powers — but you know every face in your flock. Root out the wolf hiding among you before the whole village falls!", tagline:"You know your flock — the wolf cannot hide forever!" },
    SEER: { description:"You are the Wolf Hunter! Each night you investigate one player — is it the beast in disguise? Guard your knowledge or the pack will silence you!", tagline:"The hunter always knows where the beast hides!" },
    HEALER:  { description:"You are the Apothecary! Your herbal remedies shield one player from the wolf's fangs each night. You may protect yourself — but only once!", tagline:"Herbs and cures against the bite of night!" },
  },
  VAMP:    {
    VILLAGER:{ description:"You are a Mortal! Unbitten and unturned — for now. Expose the coven before dawn takes every last soul in the village!", tagline:"Still breathing — but for how long?" },
    SEER: { description:"You are the Inquisitor! Each night you sense whether one player carries the unholy taint of the coven. Conceal yourself — the coven silences inquisitors first!", tagline:"The holy eye sees through every disguise!" },
    HEALER:  { description:"You are the Priest! Each night your holy blessing shields one soul from the vampire's bite. You may protect yourself — but only once!", tagline:"Faith is the only shield against the night!" },
  },
  LION:    {
    VILLAGER:{ description:"You are a Tribesman! Armed with instinct and tribal courage. Track down the apex predator hiding among you before the jungle reclaims you all!", tagline:"Courage is your only weapon against the beast!" },
    SEER: { description:"You are the Hunter! You have tracked lions before. Each night you examine one player — is it the beast in human skin? Your knowledge is your greatest weapon!", tagline:"The hunter always knows where the beast hides!" },
    HEALER:  { description:"You are the Doctor! Jungle charms and ancient medicine shield one player from the lion's claws each night. You may protect yourself — but only once!", tagline:"Ancient remedies stand between life and the jungle!" },
  },
  ZOMBIE:  {
    VILLAGER:{ description:"You are a Survivor! Clinging to life while the horde grows. Watch every face for signs of infection — root out the undead before they outnumber the living!", tagline:"Keep moving. Keep surviving. Trust no one." },
    SEER: { description:"You are the Scout! Each night you recon one player — have they been turned? Stay hidden; the horde silences scouts without mercy!", tagline:"Eyes on the horizon — the infected are among us!" },
    HEALER:  { description:"You are the Medic! Field medicine blocks the zombie infection for one player each night. You may protect yourself — but supplies are limited!", tagline:"The cure is running out — use it wisely!" },
  },
  FREDDY:  {
    VILLAGER:{ description:"You are a Dreamer! Every time you fall asleep, you risk never waking up. Stay alert long enough to expose Freddy before it is too late!", tagline:"Whatever you do — don't fall asleep!" },
    SEER: { description:"You are the Psychic! Your mind has touched the dream world — each night you sense if one player has been marked by Freddy. Guard your secret at all costs!", tagline:"The dream world speaks only to you!" },
    HEALER:  { description:"You are the Nurse! Sedatives and sleep wards protect one person's dreams from Freddy each night. You may protect yourself — but only once!", tagline:"Medicine keeps the nightmares at bay — for one more night!" },
  },
  JASON:   {
    VILLAGER:{ description:"You are a Camper! Stranded at the camp with a killer nearby. Every noise could be Jason — find him before he finds you!", tagline:"There is nowhere to run in the dark woods!" },
    SEER: { description:"You are the Detective! Sharp instincts are your tools. Each night you investigate one player — is that blood on their hands? Keep your findings secret!", tagline:"The mask cannot hide the truth forever!" },
    HEALER:  { description:"You are First Aid! Your emergency kit saves one camper from death each night. You may protect yourself — but only once!", tagline:"One kit. One save. Choose wisely!" },
  },
  WITCH:   {
    VILLAGER:{ description:"You are a Peasant! Ordinary folk living in fear of dark magic. Expose the witch before her hexes silence you all — one by one!", tagline:"Common folk against uncommon evil!" },
    SEER: { description:"You are the Witch Finder! Each night you test one player for the witch's brand. Never let the coven discover you!", tagline:"The mark of the witch cannot stay hidden forever!" },
    HEALER:  { description:"You are the Herbalist! Protective herbs ward off the witch's curse for one player each night. You may protect yourself — but only once!", tagline:"Nature's remedy against the darkest of spells!" },
  },
  HINDI:   {
    VILLAGER:{ description:"You are a Gaon Wasi! An ordinary villager armed with faith and sharp eyes. Expose the Shaitan before it silences the whole village!", tagline:"Simple faith is stronger than hidden evil!" },
    SEER: { description:"You are the Tantrik! Ancient rituals and mystic sight reveal the Shaitan's true form each night. Guard your identity — the Shaitan targets the wise first!", tagline:"Ancient wisdom sees what mortal eyes cannot!" },
    HEALER:  { description:"You are the Vaidya! Sacred healing herbs shield one soul from the Shaitan's wrath each night. You may protect yourself — but only once!", tagline:"The healer stands between life and darkness!" },
  },
  TAMIL:   {
    VILLAGER:{ description:"You are a Naattaar! A village elder armed with tradition and suspicion. Expose Poochandi before the whole village is haunted into silence!", tagline:"The elders remember what evil looks like!" },
    SEER: { description:"You are the Jothidar! The stars speak to you — each night you read one player's fate in the constellations. Guard your knowledge from Poochandi!", tagline:"The stars never lie — but can you?" },
    HEALER:  { description:"You are the Vaidhyar! Ancient folk remedies shield one player from Poochandi's touch each night. You may protect yourself — but only once!", tagline:"Old medicine — new hope against ancient evil!" },
  },
  TELUGU:  {
    VILLAGER:{ description:"You are a Gramasthudu! Living in fear of the Pisachi prowling the ruins. Unmask the demoness hiding among you before she claims another victim!", tagline:"The village lives — the demoness hunts!" },
    SEER: { description:"You are the Jyotishkudu! Cosmic sight reads the aura of those tainted by the Pisachi each night. Never let the demoness learn who you are!", tagline:"Cosmic sight pierces even a demoness's veil!" },
    HEALER:  { description:"You are the Vaidyudu! Sacred medicine shields one player from the demoness each night. You may protect yourself — but only once!", tagline:"Sacred remedy against a demon's curse!" },
  },
  CHINESE: {
    VILLAGER:{ description:"You are a Cunmin! Village folk living under the shadow of the hopping dead. Root out the Jiangshi before it drains every last soul!", tagline:"Stand still and the dead will find you!" },
    SEER: { description:"You are the Daoshi! Taoist rites and sacred seals reveal the undead among the living each night. The Jiangshi fears your scrolls — stay hidden!", tagline:"The sacred seal holds back the hopping dead!" },
    HEALER:  { description:"You are the Yaoshi! Ancient cures and talismans shield one player from the Jiangshi's drain each night. You may protect yourself — but only once!", tagline:"Ancient medicine is the last line of defence!" },
  },
  KOREAN:  {
    VILLAGER:{ description:"You are Minjung! Common folk living in fear of the nine-tailed fox. See through the Gumiho's beautiful disguise before it bewitches you all!", tagline:"Not everything beautiful is safe!" },
    SEER: { description:"You are the Mudang! Shamanic trances pierce the Gumiho's illusion and reveal its true form each night. Hide your gift — the fox hunts shamans first!", tagline:"The shaman sees what the fox tries to hide!" },
    HEALER:  { description:"You are the Hanuisa! Traditional medicine and talismans guard one player from the fox spirit each night. You may protect yourself — but only once!", tagline:"Old remedies stand against old spirits!" },
  },
  BANSHEE: {
    VILLAGER:{ description:"You are a Clansman! Bound by blood and living in terror. Identify the Banshee before her wail condemns every last one of you to the grave!", tagline:"Clan blood runs cold when the wail begins!" },
    SEER: { description:"You are the Druid! Ancient Celtic lore reveals who the Banshee has marked each night. Guard your secret — the mist hides more than her!", tagline:"Moonlit wisdom uncovers the keening spirit!" },
    HEALER:  { description:"You are the Bean Feasa! A wise woman whose charm silences the Banshee's wail for one person each night. You may protect yourself — but only once!", tagline:"Wisdom and herbs against the wailing dark!" },
  },
  MEXICAN: {
    VILLAGER:{ description:"You are an Aldeano! Village folk living by the haunted river. Find La Llorona before she drags every last soul to the water's edge!", tagline:"Stay away from the river after dark!" },
    SEER: { description:"You are the Bruja! Your folk magic and spiritual sight reveal who La Llorona has chosen each night. Never let her find you by the river!", tagline:"The witch's eye sees through the weeping mask!" },
    HEALER:  { description:"You are the Curandero! Sacred folk healing shields one person from La Llorona's reach each night. You may protect yourself — but only once!", tagline:"Folk remedies are the only shield against the river!" },
  },
  MAFIA:   {
    VILLAGER:{ description:"You are a Citizen! Law-abiding and suspicious. Expose the family before they silence the whole town — one witness at a time!", tagline:"Ordinary citizens against extraordinary crime!" },
    SEER: { description:"You are the Detective! Each night you investigate one player for criminal ties. You are the family's worst nightmare — stay undercover and stay alive!", tagline:"The badge sees through every disguise!" },
    HEALER:  { description:"You are the Doctor! Medical skills save one player from the family's hit each night. You may protect yourself — but only once!", tagline:"The only doctor the family cannot bribe!" },
  },
  YAKSHI:  {
    VILLAGER:{ description:"You are a Nattukkaaran! Country folk warned never to look up at the pala tree at night. Find the Yakshi hiding among you before she lures you all away!", tagline:"The old warnings exist for a reason!" },
    SEER: { description:"You are the Manthravadi! Sacred mantras expose the Yakshi's true form each night. Never reveal your power — the Yakshi hunts the spiritually gifted first!", tagline:"Sacred verses are the only chain on the spirit!" },
    HEALER:  { description:"You are the Vaidyan! Ayurvedic remedies shield one player from the Yakshi's lure each night. You may protect yourself — but only once!", tagline:"Ancient medicine against an ancient spirit!" },
  },
  VETALA:  {
    VILLAGER:{ description:"You are Ooru Jana! Village folk — but the Vetala walks among you wearing familiar faces. Unmask the spirit before it claims you all!", tagline:"Can you trust the face you see?" },
    SEER: { description:"You are the Tantrika! Tantric power and astral sight reveal which body the Vetala inhabits each night. Guard your secret — the spirit fears the one who can see through it!", tagline:"Tantric sight cuts through even death's disguise!" },
    HEALER:  { description:"You are the Vaidyaru! Healing arts and sacred rites protect one player from the Vetala's possession each night. You may protect yourself — but only once!", tagline:"Sacred healing seals the door against possession!" },
  },
  ONI:     {
    VILLAGER:{ description:"You are Chomin! Common folk living in terror of the fearsome Oni. Find the demon hiding in your midst before it crushes you all with its iron club!", tagline:"The Oni hides among the innocent — find it!" },
    SEER: { description:"You are the Onmyoji! Mystic arts and celestial sight reveal the Oni's demonic aura each night. Guard your knowledge — the Oni's iron club does not spare the wise!", tagline:"Celestial order reveals the demon's true face!" },
    HEALER:  { description:"You are the Miko! A shrine maiden whose sacred blessing shields one player from the Oni's wrath each night. You may protect yourself — but only once!", tagline:"The shrine maiden stands between the village and the demon!" },
  },
  IFRIT:   {
    VILLAGER:{ description:"You are a Muwatin! A desert dweller living under the shadow of the Ifrit. Find the fire spirit hiding among you before it burns you all to ash!", tagline:"The desert sun is nothing compared to the Ifrit's flame!" },
    SEER: { description:"You are the Kaahin! Prophetic vision and divine sight pierce the Ifrit's disguise each night. Beware — fire spirits silence prophets before any others!", tagline:"The prophet's eye sees through smoke and flame!" },
    HEALER:  { description:"You are the Hakim! Ancient medicine and protective charms shield one player from the Ifrit's flames each night. You may protect yourself — but only once!", tagline:"Ancient remedies douse even the hottest fire!" },
  },
};

export const VILLAIN_THEME_LIST = Object.values(VILLAIN_THEMES);

export function getTheme(id) {
  const theme = VILLAIN_THEMES[id] || VILLAIN_THEMES.BHEDIYA;
  const flavor = THEME_FLAVOR[id] || {};
  const winSubText = THEME_WIN_SUBTEXT[id];
  const afterlife = THEME_AFTERLIFE[id] || { term: 'Ghosts', emoji: '👻' };
  const baseRoles = ROLE_SETS[theme.roleSetKey];
  const descs = ROLE_DESCRIPTIONS[theme.roleSetKey] || {};
  // Merge per-role descriptions into the role set
  const roles = Object.fromEntries(
    Object.entries(baseRoles).map(([k, v]) => [k, { ...v, ...(descs[k] || {}) }])
  );
  return { ...theme, ...flavor, winSubText, afterlifeTerm: afterlife.term, afterlifeEmoji: afterlife.emoji, palette: PALETTES[theme.paletteKey], roles };
}

/**
 * Build a pseudo-theme representing several villain factions active in the same game
 * (mixed-villain mode — when multiple themes are selected, different VILLAIN players
 * can each carry their own theme). If only one distinct theme is present, that theme's
 * full flavor is returned unchanged. Non-villain flavor (SEER/HEALER/VILLAGER) comes
 * from the first theme, since good roles aren't faction-specific.
 */
export function getCombinedTheme(themeIds) {
  const unique = [...new Set(themeIds)];
  const themes = unique.map(getTheme);
  if (themes.length <= 1) return themes[0] || getTheme(null);
  const primary = themes[0];
  const label = themes.map(t => t.label).join(' & ');
  return {
    ...primary,
    label,
    tagline: `${themes.length} dark forces walk among you tonight.`,
    nightWake: `${label}, wake up!`,
    nightInstruction: `${label}, open your eyes.\n\nChoose your target for tonight! 🎯`,
    killAction: 'struck down in the night',
    killFlavor: 'More than one shadow moved tonight — no one can say which.',
    quietFlavor: `${label} held back tonight... for now.`,
    winText: `${label} Win!`,
    loseText: `${label} have been defeated!`,
    winSubText: `${themes.length} dark forces have claimed the village.`,
  };
}

/**
 * Resolve the theme (or combined theme, if mixed) that should drive flavor text for a
 * group of villain players — e.g. alive villains during Night/Day, or all villains for
 * the Game Over recap. Falls back to fallbackThemeId if none of the players carry an
 * individual theme override (e.g. games started before this feature, or single-theme games).
 */
export function getActiveVillainTheme(villainPlayers, fallbackThemeId) {
  const themeIds = (villainPlayers || []).map(p => p.villainThemeOverride).filter(Boolean);
  if (themeIds.length === 0) return getTheme(fallbackThemeId);
  return getCombinedTheme(themeIds);
}
