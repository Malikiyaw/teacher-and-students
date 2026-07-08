"use client";

import { useState, useMemo, useCallback } from "react";
import { CheckCheck, X, AlertTriangle, FileText } from "lucide-react";

// ─── Dictionary: 1000+ common English words ───

const DICTIONARY = new Set([
  "a","able","about","above","abroad","absence","absolute","absolutely","absorb","abstract","abuse","academic","accelerate","accent","accept","access","accident","accompany","accomplish","according","account","accurate","achieve","achievement","acknowledge","acquire","across","act","action","active","activity","actor","actual","actually","ad","adapt","add","addition","additional","address","adequate","adjust","adjustment","administration","administrator","admire","admission","admit","adopt","adult","advance","advanced","advantage","adventure","advertise","advertisement","advertising","advice","advise","advocate","affair","affect","affection","afford","afraid","after","afternoon","afterward","again","against","age","agency","agenda","agent","aggressive","ago","agree","agreement","agriculture","ah","ahead","aid","aim","air","aircraft","airline","airport","album","alcohol","alive","all","allege","alliance","allow","almost","alone","along","already","also","alter","alternative","although","altogether","always","am","amaze","ambition","among","amount","analysis","analyst","analyze","ancient","and","anger","angle","animal","anniversary","announce","annual","annually","another","answer","anticipate","anxiety","anxious","any","anybody","anyone","anything","anyway","anywhere","apart","apartment","apologize","apology","apparent","apparently","appeal","appear","appearance","appetite","apple","application","apply","appoint","appointment","appreciate","approach","appropriate","approval","approve","approximately","architecture","archive","area","argue","argument","arise","arm","army","around","arrange","arrangement","arrest","arrival","arrive","art","article","artist","artistic","as","ask","aspect","assault","assemble","assembly","assess","assessment","asset","assign","assignment","assist","assistance","assistant","associate","associated","association","assume","assumption","assure","at","athlete","athletic","atmosphere","attach","attack","attempt","attend","attendance","attention","attitude","attorney","attract","attraction","attractive","attribute","audience","aunt","authentic","author","authority","authorize","auto","available","average","avoid","award","aware","awareness","away","awful","baby","back","background","backup","backward","bacteria","bad","badly","bag","bake","balance","ball","ban","band","bank","banking","bar","bare","barely","barrel","barrier","base","baseball","basic","basically","basis","basket","basketball","bath","bathroom","battery","battle","bay","be","beach","bean","bear","beat","beautiful","beauty","because","become","bed","bedroom","beer","before","begin","beginning","behavior","behind","being","belief","believe","bell","belong","below","belt","bench","bend","benefit","best","bet","better","between","beyond","bias","big","bike","bill","billion","bin","biology","bird","birth","birthday","bit","bite","bitter","black","blade","blame","blank","blanket","blast","bleed","blend","bless","blind","block","blog","blonde","blood","blow","blue","board","boat","body","bomb","bond","bone","bonus","book","boom","boost","border","born","borrow","boss","both","bother","bottle","bottom","bounce","boundary","bowl","box","boy","boyfriend","brain","branch","brand","brave","bread","break","breakfast","breast","breath","breathe","breathing","breed","brick","bridge","brief","briefly","bright","brilliant","bring","broad","broadband","broadcast","broken","brother","brown","brush","bubble","budget","build","builder","building","bulk","bullet","bunch","burden","burn","burst","bus","business","busy","but","butter","button","buy","buyer","cabin","cabinet","cable","cake","calculate","call","calm","camera","camp","campaign","campus","can","canal","cancel","cancer","candidate","cap","capability","capable","capacity","capital","captain","capture","carbon","card","care","career","careful","carefully","carrier","carry","case","cash","cast","castle","casual","cat","catch","category","catering","catholic","cattle","cause","cease","ceiling","celebrate","celebration","celebrity","cell","center","central","century","ceremony","certain","certainly","chain","chair","chairman","challenge","chamber","champion","championship","chance","change","changing","channel","chapter","character","characteristic","characterize","charge","charity","chart","chase","cheap","check","cheek","cheese","chef","chemical","chemistry","chest","chicken","chief","child","childhood","chip","chocolate","choice","choir","choose","chop","church","cigarette","circle","circumstance","cite","citizen","city","civil","civilian","claim","class","classic","classical","classroom","clause","clean","clear","clearly","clerk","clever","click","client","climate","climb","clock","clone","close","closed","closely","closer","closet","closing","cloth","clothes","clothing","cloud","club","clue","cluster","coach","coal","coalition","coast","code","coffee","cognitive","cold","collapse","colleague","collect","collection","collective","college","colonial","color","column","combination","combine","come","comedy","comfort","comfortable","command","commander","comment","commerce","commercial","commission","commit","commitment","committee","commodity","common","commonly","communicate","communication","community","company","compare","comparison","compel","compensation","compete","competition","competitive","competitor","complain","complaint","complete","completely","complex","complexity","compliance","complicate","complicated","component","compose","composition","comprehensive","comprise","compromise","computer","concede","conceive","concentrate","concentration","concept","conception","concern","concerned","concerning","concert","conclude","conclusion","concrete","condition","conduct","conference","confidence","confident","confine","confirm","conflict","confront","confusion","congress","congressional","connect","connection","consciousness","consequence","consequently","conservation","conservative","consider","considerable","considerably","consideration","consist","consistent","consistently","constant","constantly","constitute","constitution","constitutional","construct","construction","consult","consultant","consume","consumer","consumption","contact","contain","container","contemplate","contemporary","content","contest","context","continent","continue","continued","continuing","continuous","contract","contractor","contrary","contrast","contribute","contribution","contributor","control","controversial","controversy","convention","conventional","conversation","conversion","convert","convey","convict","conviction","convince","cook","cookie","cooking","cool","cooperation","cope","copy","core","corner","corporate","corporation","correct","correction","correctly","correlation","correspond","corruption","cost","cotton","couch","could","council","counsel","count","counter","counterpart","country","county","couple","courage","course","court","cousin","cover","coverage","crack","craft","crash","crazy","cream","create","creation","creative","creativity","creature","credit","crew","crime","criminal","crisis","criterion","critical","critically","criticism","criticize","crop","cross","crowd","crucial","cultural","culture","cup","cure","curious","currency","current","currently","curriculum","curtain","curve","custom","customer","cut","cute","cycle","dad","daily","damage","dance","danger","dangerous","dare","dark","darkness","data","database","date","daughter","day","dead","deadline","deadly","deal","dealer","dear","death","debate","debt","decade","decide","decision","decisive","deck","declaration","declare","decline","decorate","decrease","dedicate","deep","deeply","deer","default","defeat","defect","defend","defendant","defense","defensive","deficit","define","definitely","definition","degree","delay","deliberately","delicate","deliver","delivery","demand","democracy","democrat","democratic","demonstrate","demonstration","denial","deny","department","departure","depend","dependent","depending","depict","deploy","deposit","depression","deputy","derive","describe","description","desert","deserve","design","designer","desire","desk","desperate","despite","destination","destroy","destruction","detail","detailed","detect","detective","determination","determine","develop","developer","developing","development","device","devote","dialog","die","diet","differ","difference","different","differently","difficult","difficulty","dig","digital","dimension","dinner","direct","direction","directly","director","dirty","disability","disabled","disagree","disappear","disappointment","disaster","discipline","discount","discourage","discover","discovery","discrimination","discuss","discussion","disease","dismiss","disorder","display","dispute","distance","distant","distinction","distinctive","distinguish","distribute","distribution","district","disturb","diverse","diversity","divide","division","divorce","dock","doctor","doctrine","document","documentation","dog","domain","domestic","dominant","dominate","donate","donation","door","dose","dot","double","doubt","down","download","downtown","dozen","draft","drag","drain","drama","dramatic","dramatically","draw","drawing","dream","dress","drink","drive","driver","driving","drop","drug","dry","dual","due","dull","dump","during","dust","duty","dynamic","each","eager","ear","early","earn","earnings","earth","earthquake","ease","easily","east","eastern","easy","eat","echo","ecological","economic","economics","economist","economy","edge","edit","edition","editor","educate","education","educational","educator","effect","effective","effectively","effectiveness","efficiency","efficient","efficiently","effort","egg","eight","either","elaborate","elderly","elect","election","electric","electricity","electronic","elegant","element","elementary","elevator","eliminate","elimination","elite","else","elsewhere","email","emergence","emergency","emission","emotion","emotional","emphasis","emphasize","empire","empirical","employ","employee","employer","employment","empty","enable","enact","encompass","encounter","encourage","encouraging","end","endeavor","ending","endorse","endorsement","enemy","energy","enforce","enforcement","engage","engagement","engine","engineer","engineering","enhance","enjoy","enjoyable","enormous","enough","enrich","enroll","ensure","enter","enterprise","entertainment","enthusiasm","enthusiastic","entire","entirely","entitle","entity","entrepreneur","entry","environment","environmental","epidemic","episode","equal","equality","equally","equation","equip","equipment","equivalent","era","error","escape","especially","essay","essential","essentially","establish","establishment","estate","estimate","ethical","ethics","ethnic","evaluate","evaluation","even","evening","event","eventually","ever","every","everybody","everyday","everyone","everything","everywhere","evidence","evident","evil","evolution","evolve","exact","exactly","examination","examine","example","exceed","excellent","except","exception","excess","exchange","excite","excitement","exciting","exclude","exclusive","exclusively","excuse","execute","execution","executive","exercise","exhibit","exhibition","exist","existence","existing","exit","expand","expansion","expect","expectation","expedition","expense","expensive","experience","experiment","experimental","expert","expertise","explain","explanation","explicit","explicitly","exploit","exploration","explore","explosion","export","expose","exposure","express","expression","extend","extension","extensive","extensively","extent","external","extra","extraordinary","extreme","extremely","eye","fabric","face","facilitate","facility","fact","factor","factory","faculty","fade","fail","failure","fair","fairly","fairness","faith","faithful","fall","familiar","family","famous","fan","fantasy","far","farm","farmer","fascinating","fashion","fast","fat","fatal","father","fault","favor","favorable","favorite","fear","feature","federal","fee","feed","feedback","feel","feeling","fellow","female","feminist","fence","festival","few","fewer","fiber","fiction","field","fifteen","fifty","fight","fighter","fighting","figure","file","fill","film","final","finally","finance","financial","financially","financing","find","finding","fine","finger","finish","fire","firm","firmly","first","fiscal","fish","fishing","fit","fitness","five","fix","flag","flame","flash","flat","flavor","flee","flesh","flexibility","flexible","flight","flip","float","flood","floor","flour","flow","flower","fly","focus","fold","folk","follow","following","food","foot","football","for","forbid","force","forecast","forehead","foreign","foreigner","forest","forever","forget","forgive","form","formal","format","formation","former","formerly","formula","formulate","forth","fortunately","fortune","forty","forward","found","foundation","founder","four","fourth","fraction","framework","franchise","frank","frankly","fraud","free","freedom","freely","freeze","frequency","frequent","frequently","fresh","friend","friendly","friendship","from","front","frozen","fruit","frustration","fuel","full","fulltime","fully","fun","function","functional","fund","fundamental","fundamentally","funding","fundraising","funeral","funny","furniture","furthermore","future","gain","gallery","gambling","game","gang","gap","garage","garden","gas","gate","gather","gathering","gay","gaze","gear","gender","gene","general","generally","generate","generation","generic","generous","genetic","genius","gentle","gentleman","gently","genuine","genuinely","gesture","get","ghost","giant","gift","gifted","girl","girlfriend","give","given","glad","glance","glass","global","globe","glory","goal","god","gold","golden","golf","good","government","governor","grab","grace","grade","gradually","graduate","graduation","grain","grand","grandfather","grandmother","grant","graph","grasp","grass","grateful","grave","gravity","great","greatly","green","grey","grocery","gross","ground","group","grow","growing","growth","guarantee","guard","guess","guest","guide","guideline","guilty","gun","gut","guy","gym","habit","habitat","hair","half","hall","halt","hand","handful","handle","handling","handwriting","hang","happen","happily","happiness","happy","harassment","harbor","hard","hardly","hardware","harm","harmful","harmony","hat","hate","have","he","head","headline","headquarters","heal","health","healthy","hear","hearing","heart","heat","heating","heaven","heavily","heavy","height","helicopter","hell","hello","help","helpful","hence","her","herb","here","heritage","hero","hers","herself","hesitate","hey","hidden","hide","high","highlight","highly","highway","hill","him","himself","hip","hire","his","historian","historic","historical","history","hit","hobby","hold","holder","hole","holiday","hollow","holy","home","homeland","homeless","homework","honest","honestly","honey","honor","hook","hope","hopeful","hopefully","horizon","horn","horrible","horror","horse","hospital","host","hostage","hot","hotel","hour","house","household","housing","how","however","huge","human","humanitarian","humanity","humor","hundred","hunger","hungry","hunt","hunting","hurricane","hurry","hurt","husband","hypothesis","ice","icon","idea","ideal","identical","identification","identify","identity","ideology","if","ignore","ill","illegal","illness","illusion","illustrate","image","imagination","imagine","immediate","immediately","immense","immigrant","immigration","immune","impact","implement","implementation","implication","imply","import","importance","important","importantly","impose","impossible","impress","impression","impressive","improve","improvement","in","incentive","incident","include","including","income","incorporate","increase","increased","increasing","increasingly","incredible","incredibly","indeed","independence","independent","independently","index","indicate","indication","indicator","individual","individually","industrial","industry","inevitable","inevitably","infant","infection","inflation","influence","influential","info","inform","informal","information","infrastructure","ingredient","inherent","initial","initially","initiate","initiative","injection","injure","injury","inmate","inner","innocent","innovation","innovative","input","inquiry","insect","insert","inside","insight","insist","inspect","inspection","inspector","inspiration","inspire","install","installation","instance","instant","instantly","instead","institute","institution","institutional","instruction","instructor","instrument","insurance","intact","integrate","integrated","integration","integrity","intellectual","intelligence","intelligent","intend","intense","intensity","intention","interact","interaction","interest","interested","interesting","interface","interim","interior","intermediate","internal","international","internet","internship","interpret","interpretation","intervention","interview","intimate","into","introduce","introduction","invade","invasion","invest","investigate","investigation","investigator","investment","investor","invisible","invitation","invite","involve","involved","involvement","iron","ironically","island","isolate","isolation","issue","item","its","itself","jacket","jail","jam","jeans","jet","jewelry","job","join","joint","joke","journal","journalism","journalist","journey","joy","judge","judgment","juice","jump","junction","junior","jurisdiction","jury","just","justice","justification","justify","keen","keep","key","keyboard","kick","kid","kill","killer","killing","kind","king","kiss","kitchen","knee","knife","knock","know","knowledge","label","labor","laboratory","lack","ladder","lady","lake","land","landing","landlord","landmark","landscape","lane","language","lap","large","largely","largest","laser","last","late","later","latest","latter","laugh","launch","law","lawyer","lay","layer","layout","lazy","lead","leader","leadership","leading","leaf","league","lean","learn","learning","least","leather","leave","lecture","left","leg","legacy","legal","legally","legend","legislation","legislative","legislature","legitimate","leisure","lemon","lend","length","lens","less","lesson","let","letter","level","liberal","library","license","lid","lie","life","lifestyle","lifetime","lift","light","lightly","lightning","like","likelihood","likely","likewise","limb","limit","limitation","limited","line","link","lion","lip","list","listen","listener","literally","literary","literature","little","live","lively","living","load","loan","lobby","local","locally","locate","location","lock","lodge","log","logic","logical","lonely","long","look","loop","loose","lord","lose","loss","lost","lot","loud","love","lovely","lover","low","lower","loyal","loyalty","luck","lucky","lunch","lung","machine","mad","magazine","magic","magnetic","magnificent","mail","main","mainly","mainstream","maintain","maintenance","major","majority","make","maker","makeup","male","mall","man","manage","management","manager","managing","mandate","manner","manufacture","manufacturer","manufacturing","many","map","march","margin","marginal","marine","mark","marker","market","marketing","marketplace","marriage","married","marry","mask","mass","massive","master","match","mate","material","math","matter","mature","maximum","may","maybe","mayor","me","meal","mean","meaning","meaningful","means","meantime","meanwhile","measure","measurement","meat","mechanic","mechanical","mechanism","medal","media","medical","medication","medicine","medium","meet","meeting","member","membership","memo","memorial","memory","mental","mentally","mention","mentor","menu","merchant","mercy","mere","merely","merger","merit","mess","message","metal","metaphor","method","methodology","metropolitan","middle","midnight","midst","might","mild","mile","military","milk","mill","million","mind","mine","mineral","minimal","minimize","minimum","mining","minister","ministry","minor","minority","minute","miracle","mirror","miserable","misleading","miss","missile","missing","mission","missionary","mistake","mix","mixed","mixture","mobile","mobility","mode","model","moderate","modern","modest","modification","modify","mom","moment","momentum","mommy","money","monitor","month","monthly","monument","mood","moon","moral","more","moreover","morning","mortgage","most","mostly","mother","motion","motivate","motivation","motive","motor","mount","mountain","mouse","mouth","move","movement","movie","much","multiple","multiply","municipal","murder","muscle","museum","music","musical","musician","mutual","my","myself","mysterious","mystery","myth","nail","naked","name","narrative","narrow","nasty","nation","national","nationalist","nationwide","native","natural","naturally","nature","navy","near","nearby","nearly","neat","necessarily","necessary","necessity","neck","need","needle","negative","neglect","negotiate","negotiation","neighbor","neighborhood","neither","nerve","nervous","nest","net","network","neural","neutral","never","nevertheless","new","newly","news","newspaper","next","nice","night","nine","no","noble","nobody","nod","noise","nomination","none","nonetheless","nonsense","noon","nor","norm","normal","normally","north","northern","nose","not","note","notebook","nothing","notice","notion","novel","now","nowhere","nuclear","number","numerous","nurse","nursing","nut","object","objection","objective","obligation","observation","observe","observer","obstacle","obtain","obvious","obviously","occasion","occasional","occasionally","occupation","occupy","occur","ocean","odd","odds","of","off","offense","offensive","offer","offering","office","officer","official","officially","often","oh","oil","okay","old","olympic","on","once","one","ongoing","onion","online","only","onto","open","opening","openly","opera","operate","operating","operation","operational","operator","opinion","opponent","opportunity","oppose","opposite","opposition","option","optional","or","oral","orange","orbit","order","ordinary","organ","organic","organization","organize","organizer","orientation","origin","original","originally","other","others","otherwise","ought","our","ours","ourselves","out","outcome","outlet","outline","outlook","output","outrage","outside","outsider","outstanding","over","overall","overcome","overlook","overseas","overturn","overwhelming","owe","own","owner","ownership","pace","pack","package","packet","page","pain","painful","paint","painter","painting","pair","palace","pale","palm","pan","panel","panic","paper","parade","paragraph","parallel","parameter","parent","parental","park","parking","parliament","part","partial","partially","participant","participate","participation","particular","particularly","partly","partner","partnership","party","pass","passage","passenger","passing","passion","passionate","passive","passport","past","patch","path","patience","patient","patrol","patron","pattern","pause","pay","payment","peace","peaceful","peak","peasant","peculiar","peer","penalty","pencil","penny","pension","people","pepper","per","perceive","percent","percentage","perception","perfect","perfectly","perform","performance","performer","perfume","perhaps","period","permanent","permanently","permission","permit","persistent","person","personal","personality","personally","personnel","perspective","persuade","pet","phase","phenomenon","philosophy","phone","photo","photograph","photographer","photography","phrase","physical","physically","physician","physics","piano","pick","picture","pie","piece","pierce","pile","pill","pilot","pin","pine","pink","pioneer","pipe","pit","pitch","pizza","place","placement","plain","plan","plane","planet","planning","plant","plastic","plate","platform","play","player","plea","pleasant","please","pleased","pleasure","plenty","plot","plug","plus","pocket","poem","poet","poetry","point","pole","police","policy","polish","polite","political","politically","politician","politics","poll","pollution","pond","pool","poor","pop","popular","popularity","population","port","portfolio","portion","portrait","pose","position","positive","positively","possess","possession","possibility","possible","possibly","post","poster","potato","potential","potentially","pound","pour","poverty","powder","power","powerful","practical","practice","practitioner","praise","pray","prayer","preach","precede","precious","precise","precisely","predator","predecessor","predict","prediction","preference","pregnancy","pregnant","prejudice","preliminary","premise","premium","preparation","prepare","prescribed","prescription","presence","present","presentation","preservation","preserve","presidency","president","presidential","press","pressure","prestige","presumably","pretend","pretty","prevail","prevalence","prevent","prevention","previous","previously","price","pride","priest","primarily","primary","prime","primitive","prince","princess","principal","principle","print","printer","prior","priority","prison","prisoner","privacy","private","privately","privilege","prize","probably","problem","procedure","proceed","proceeding","process","processor","proclaim","produce","producer","product","production","productive","productivity","profession","professional","professor","profile","profit","profitable","profound","program","programming","progress","progressive","prohibit","project","projection","prominent","promise","promising","promote","promoter","promotion","prompt","proof","propaganda","proper","properly","property","proportion","proposal","propose","proposed","prosecutor","prospect","protect","protection","protective","protein","protest","protocol","proud","prove","provide","provider","province","provision","provoke","psychological","psychologist","psychology","pub","public","publication","publicity","publicly","publish","publisher","publishing","pull","punishment","purchase","pure","purely","purple","purpose","pursue","pursuit","push","put","puzzle","qualify","quality","quantity","quarter","quarterback","question","questionnaire","quick","quickly","quiet","quietly","quit","quite","quote","rabbit","race","racial","racism","rack","radical","radio","rail","railroad","rain","raise","rally","random","range","rank","rapid","rapidly","rare","rarely","rate","rather","rating","ratio","rational","raw","reach","react","reaction","read","reader","readily","reading","ready","real","realistic","reality","realize","really","realm","rear","reason","reasonable","reasonably","reasoning","rebel","rebuild","recall","receipt","receive","receiver","recent","recently","reception","recipe","recognition","recognize","recommend","recommendation","record","recording","recover","recovery","recreation","recruit","recruitment","recycle","red","reduce","reduction","refer","reference","referendum","reflect","reflection","reform","refugee","refuse","regain","regard","regarding","regardless","regime","region","regional","register","registration","regret","regular","regularly","regulate","regulation","regulator","regulatory","rehab","rehabilitation","reign","reinforce","reject","relate","relation","relationship","relative","relatively","relax","relaxation","release","relevant","reliability","reliable","relief","relieve","religion","religious","reluctant","rely","remain","remaining","remark","remarkable","remarkably","remedy","remember","remind","reminder","remote","removal","remove","render","renew","renewable","rent","rental","repair","repeat","repeatedly","replace","replacement","reply","report","reporter","reporting","represent","representation","representative","reproduce","republic","republican","reputation","request","require","requirement","rescue","research","researcher","resemble","reservation","reserve","residence","resident","residential","resign","resignation","resist","resistance","resolution","resolve","resort","resource","respect","respectively","respond","response","responsibility","responsible","rest","restaurant","restoration","restore","restriction","result","resume","retail","retailer","retain","retire","retirement","retreat","return","reveal","revelation","revenge","revenue","reverse","review","revise","revolution","revolutionary","reward","rhetoric","rhythm","rib","rice","rich","rid","ride","rider","ridge","ridiculous","rifle","right","rigid","ring","riot","rise","risk","risky","ritual","rival","river","road","rob","robbery","robot","rock","rocket","rod","role","roll","romantic","roof","room","root","rope","rose","rough","roughly","round","route","routine","row","royal","rub","rubber","rude","rug","ruin","rule","ruler","ruling","run","runner","running","rural","rush","sacred","sacrifice","sad","safe","safety","sail","sake","salad","salary","sale","sales","salt","same","sample","sanction","sanctuary","sand","satellite","satisfaction","satisfy","sauce","save","saving","scale","scan","scandal","scared","scatter","scenario","scene","scent","schedule","scheme","scholar","scholarship","school","science","scientific","scientist","scope","score","scream","screen","screening","script","scrutiny","sculpture","sea","seal","search","season","seat","second","secondary","secret","secretary","section","sector","secure","security","see","seed","seek","segment","seize","select","selection","selective","self","sell","senate","senator","send","senior","sense","sensitive","sensitivity","sensor","sent","sentence","sentiment","separate","separation","sequence","series","serious","seriously","servant","serve","service","session","set","setting","settle","settlement","setup","seven","several","severe","severely","sew","sex","sexual","shade","shadow","shake","shall","shallow","shame","shape","share","shareholder","sharp","sharply","shed","sheep","sheet","shelf","shell","shelter","shield","shift","shine","ship","shirt","shit","shock","shoe","shoot","shooting","shop","shopping","shore","short","shortage","shortly","shot","should","shoulder","shout","show","shower","shrug","shut","shuttle","sick","side","siege","sight","sign","signal","signature","significance","significant","significantly","silence","silent","silver","similar","similarly","simple","simply","simulation","simultaneously","sin","since","sing","singer","single","singular","sink","sir","sister","sit","site","situation","six","size","ski","skill","skin","skip","skirt","sky","slave","sleep","slice","slide","slight","slightly","slip","slow","slowly","small","smart","smell","smile","smoke","smooth","snap","snow","so","soak","soap","soccer","social","socially","society","sociology","soft","softly","software","soil","solar","soldier","sole","solely","solicitor","solid","solution","solve","some","somebody","somehow","someone","something","sometimes","somewhat","somewhere","son","song","soon","sophisticated","sorry","sort","soul","sound","soup","source","south","southern","sovereignty","space","spare","spark","speak","speaker","special","specialist","specialize","specialty","species","specific","specifically","specification","specify","specimen","spectacular","spectrum","speech","speed","spell","spend","spending","spice","spill","spin","spine","spirit","spiritual","split","spokesman","sponsor","sponsorship","sport","spot","spouse","spread","spring","square","squeeze","stability","stable","stack","staff","stage","stair","stake","stand","standard","standing","star","stare","start","starting","state","statement","station","statistical","statistics","statue","status","statute","stay","steady","steal","steel","steep","stem","step","stereotype","stick","sticky","stiff","still","stimulate","stir","stock","stomach","stone","stop","storage","store","storm","story","straight","strain","strand","strange","stranger","strategic","strategist","strategy","stream","street","strength","strengthen","stress","stretch","strike","striking","string","strip","stripe","stroke","strong","strongly","structural","structure","struggle","student","studio","study","stuff","stumble","style","subject","submit","subsequent","subsequently","subsidy","substance","substantial","substantially","substitute","subtle","suburb","suburban","succeed","success","successful","successfully","succession","successor","such","sudden","suddenly","sue","suffer","suffering","sufficient","sufficiently","sugar","suggest","suggestion","suicide","suit","suitable","suite","sum","summarize","summary","summer","summit","sun","super","superb","superintendent","superior","supermarket","supervise","supervision","supervisor","supplement","supply","support","supporter","supportive","suppose","supposed","suppress","supreme","sure","surely","surface","surge","surgeon","surgery","surgical","surplus","surprise","surprised","surprising","surprisingly","surrender","surround","surrounding","surveillance","survey","survival","survive","survivor","suspect","suspend","suspicion","suspicious","sustain","sustainable","swallow","swear","sweep","sweet","swim","swing","switch","sword","symbol","symbolic","sympathy","symptom","syndrome","synthesis","system","systematic","table","tablet","tackle","tactic","tag","tail","take","tale","talent","talented","talk","tall","tank","tap","tape","target","task","taste","tax","taxpayer","tea","teach","teacher","teaching","team","tear","technical","technically","technique","technology","teen","teenager","telephone","telescope","television","tell","temperature","temple","temporary","ten","tend","tendency","tennis","tension","tent","term","terms","terrain","terrible","terribly","terrific","territory","terror","terrorism","terrorist","test","testify","testimony","testing","text","textbook","texture","than","thank","thanks","that","the","theater","theft","their","them","theme","themselves","then","theology","theoretical","theory","therapist","therapy","there","thereby","therefore","these","they","thick","thickness","thief","thin","thing","think","thinking","third","thirty","this","thorough","thoroughly","those","though","thought","thoughtful","thousand","thread","threat","threaten","three","threshold","thrive","throat","through","throughout","throw","thumb","thus","ticket","tide","tidy","tie","tight","tighten","till","timber","time","timeline","timely","timing","tiny","tip","tire","tired","tissue","title","to","tobacco","today","toe","together","toilet","token","tolerance","tolerate","tomorrow","tone","tongue","tonight","too","tool","tooth","top","topic","torture","total","totally","touch","tough","tour","tourism","tourist","tournament","toward","towards","tower","town","toxic","toy","trace","track","trade","trademark","trader","trading","tradition","traditional","traditionally","traffic","tragedy","tragic","trail","train","trainer","training","trait","transaction","transfer","transform","transformation","transition","translate","translation","transmission","transmit","transparency","transparent","transport","transportation","trap","trash","trauma","travel","traveler","treasure","treat","treatment","treaty","tree","tremendous","trend","trial","triangle","tribal","tribe","trick","trigger","trim","trip","triumph","troop","trophy","tropical","trouble","truck","true","truly","trust","truth","try","tube","tuck","tuition","tune","tunnel","turn","turning","turnover","twelve","twenty","twice","twin","twist","two","type","typical","typically","ugly","ultimate","ultimately","umbrella","unable","unacceptable","unaware","uncle","uncover","under","undergo","undergraduate","underground","underlying","undermine","understand","understanding","undertake","undertaking","unemployment","unexpected","unfair","unfortunate","unfortunately","uniform","union","unique","unit","unite","united","unity","universal","universe","university","unknown","unless","unlike","unlikely","unnecessary","unpleasant","unprecedented","unusual","up","update","upgrade","upcoming","upon","upper","upset","upstairs","urban","urge","urgent","us","usage","use","used","useful","useless","user","usual","usually","utility","utilize","vacation","vaccine","vacuum","vague","valid","validation","validity","valley","valuable","value","valve","van","vanish","variable","variation","varied","variety","various","vary","vast","vegetable","vehicle","vendor","venture","verb","verdict","verify","version","versus","vertical","very","vessel","veteran","via","viable","vibration","vice","victim","victory","video","view","viewer","viewpoint","village","violate","violation","violence","violent","violin","virtually","virtue","virus","visible","vision","visit","visitor","visual","vital","vitamin","vivid","vocabulary","voice","volume","voluntary","volunteer","vote","voter","voting","vs","vulnerability","vulnerable","wage","wait","wake","walk","wall","wander","want","war","ward","warehouse","warm","warmth","warn","warning","warrant","warranty","warrior","wash","waste","watch","water","wave","way","we","weak","weaken","weakness","wealth","wealthy","weapon","wear","weather","weave","web","website","wedding","week","weekend","weekly","weigh","weight","weird","welcome","welfare","well","west","western","wet","what","whatever","wheel","when","whenever","where","whereas","wherever","whether","which","while","whisper","white","who","whole","whom","whose","why","wide","widely","widen","widespread","widow","width","wife","wild","wilderness","will","willing","willingness","win","wind","window","wine","wing","winner","winning","winter","wipe","wire","wireless","wisdom","wise","wish","wit","with","withdraw","withdrawal","within","without","witness","woman","wonder","wonderful","wood","wooden","wool","word","work","worker","workforce","working","workout","workplace","workshop","world","worldwide","worm","worried","worry","worse","worship","worst","worth","worthwhile","worthy","would","wound","wrap","wrist","write","writer","writing","written","wrong","yacht","yard","yeah","year","yell","yellow","yes","yesterday","yet","yield","you","young","your","yours","yourself","youth","zone",
  // Common contractions / possessive forms
  "dont","cant","wont","its","im","youre","theyre","hes","shes","weve","theyve","ive","youve","hadnt","hasnt","havent","isnt","arent","wasnt","werent","doesnt","didnt","couldnt","wouldnt","shouldnt","mightnt","neednt","darent","mustnt","lets","thats","whos","whats","wheres","whens","whys","hows","theres","heres","heres","heres","heres","heres","heres","heres",
  // Numbers
  "zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety","hundred","thousand","million","billion","trillion",
  // Common abbreviations
  "mr","mrs","ms","dr","prof","vs","etc","inc","ltd","co","dept","est","govt","org","assn","bros","corp","lt","jr","sr","st","ave","blvd","rd","ste","apt","bldg","sq","ct","pl","mt","ft","in","yr","hr","min","sec","mph","kg","lb","oz","gal","qt","pt","vol","no","tel","fax","ext","pkg","dept","acct","amt","appt","asap","bcc","cc","eta","fyi","imo","lol","msg","pls","pmo","tbd","tba","wip",
  // Days / months
  "monday","tuesday","wednesday","thursday","friday","saturday","sunday","january","february","march","april","may","june","july","august","september","october","november","december",
  // Tech terms
  "html","css","javascript","typescript","python","java","cpp","csharp","sql","php","ruby","swift","go","rust","kotlin","api","url","uri","json","xml","yaml","yml","npm","yarn","pnpm","node","react","vue","angular","svelte","nextjs","nuxt","git","github","docker","kubernetes","aws","azure","gcp","devops","frontend","backend","fullstack","database","server","client","async","await","promise","callback","module","component","interface","class","function","variable","constant","array","object","boolean","string","number","undefined","null","export","import","default","extends","implements","return","throw","try","catch","finally","this","super","new","delete","typeof","instanceof","void","yield","generator","iterator","proxy","reflect","symbol","map","set","weakmap","weakset","promise","observable","stream","buffer","binary","unicode","utf8","base64","sha256","md5","aes","rsa","tls","ssl","http","https","websocket","graphql","rest","soap","grpc","protobuf","serialize","deserialize","middleware","framework","library","package","dependency","repository","registry","binary","source","compile","transpile","bundler","webpack","vite","esbuild","rollup","parcel","babel","typescript","flow","eslint","prettier","jest","mocha","chai","cypress","playwright","selenium","webdriver","dockerfile","nginx","apache","linux","windows","macos","ios","android","responsive","accessible","semantic","performance","optimization","minify","uglify","compress","brotli","gzip","cache","cdn","dns","dhcp","vpn","proxy","firewall","loadbalancer","cluster","container","orchestration","microservice","monolith","serverless","lambda","function","ec2","s3","rds","dynamodb","lambda","cloudfront","route53","iam","cloudwatch","sns","sqs","ses","elb","auto","scaling","elasticache","redshift","kinesis","step","api","gateway","cognito","amplify","appsync","xray","opensearch","athena","glue","emr","databricks","snowflake","bigquery","looker","tableau","powerbi","etl","elt","datawarehouse","datalake","datamart","olap","oltp","nosql","sql","acid","base","cap","theorem","consistency","availability","partition","tolerance",
]);

function levenshtein(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= bn; i++) matrix[i] = [i];
  for (let j = 0; j <= an; j++) matrix[0][j] = j;
  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[bn][an];
}

function getSuggestions(word: string, max: number = 5): string[] {
  const lower = word.toLowerCase();
  const candidates: { word: string; dist: number }[] = [];
  for (const dictWord of DICTIONARY) {
    const dist = levenshtein(lower, dictWord);
    if (dist <= 2) candidates.push({ word: dictWord, dist });
  }
  candidates.sort((a, b) => a.dist - b.dist);
  return candidates.slice(0, max).map(c => c.word);
}

export interface SpellingIssue {
  word: string;
  start: number;
  end: number;
  suggestions: string[];
}

export interface GrammarIssue {
  message: string;
  start: number;
  end: number;
  suggestion: string;
}

// ─── Spelling ───

export function checkSpelling(text: string): SpellingIssue[] {
  const issues: SpellingIssue[] = [];
  const tokens = text.match(/[A-Za-z']+(?:[A-Za-z']+)?/g) || [];
  for (const token of tokens) {
    const clean = token.replace(/^'+|'+$/g, "");
    if (!clean) continue;
    if (DICTIONARY.has(clean.toLowerCase())) continue;
    const idx = text.indexOf(token);
    if (idx === -1) continue;
    // Skip single letters (usually intentional)
    if (clean.length <= 1) continue;
    issues.push({
      word: token,
      start: idx,
      end: idx + token.length,
      suggestions: getSuggestions(clean),
    });
  }
  return issues;
}

// ─── Grammar ───

export function checkGrammar(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];

  // 1. Repeated words
  const repeatPattern = /\b(\w+)\s+\1\b/gi;
  let match: RegExpExecArray | null;
  while ((match = repeatPattern.exec(text)) !== null) {
    issues.push({
      message: `Repeated word: "${match[1]}"`,
      start: match.index,
      end: match.index + match[0].length,
      suggestion: match[1],
    });
  }

  // 2. Double negatives
  const doubleNegPattern = /\b(no|not|never|none|nothing|nobody|nowhere|neither|hardly|scarcely)\b.*\b(no|not|never|none|nothing|nobody|nowhere|neither)\b/gi;
  if (doubleNegPattern.test(text)) {
    issues.push({
      message: "Possible double negative",
      start: 0,
      end: text.length,
      suggestion: "Remove one of the negative terms",
    });
  }

  // 3. Missing capitalization at start of sentence
  const sentences = text.match(/[.!?]\s+[a-z]/g);
  if (sentences) {
    for (const s of sentences) {
      const idx = text.indexOf(s);
      if (idx > 0) {
        const capitalLetter = s.trim()[1];
        issues.push({
          message: `Sentence should start with a capital letter: "${s.trim()}"`,
          start: idx + 1,
          end: idx + s.length,
          suggestion: s.trim().replace(/[a-z]/, c => c.toUpperCase()),
        });
      }
    }
  }

  // 4. Check first word capital
  if (text.length > 0 && /^[a-z]/.test(text)) {
    issues.push({
      message: "Sentence should start with a capital letter",
      start: 0,
      end: 1,
      suggestion: text[0].toUpperCase(),
    });
  }

  // 5. Missing punctuation at end
  const trimmed = text.trim();
  if (trimmed.length > 0 && !/[.!?:;…]\s*$/.test(trimmed)) {
    issues.push({
      message: "Missing punctuation at end of text",
      start: trimmed.length - 1,
      end: trimmed.length,
      suggestion: trimmed + ".",
    });
  }

  // 6. Subject-verb agreement (he/she/it + verb without s)
  const svPattern = /\b(he|she|it)\s+(\w+)\b/gi;
  while ((match = svPattern.exec(text)) !== null) {
    const verb = match[2].toLowerCase();
    const exceptions = ["is", "was", "has", "does", "can", "will", "shall", "may", "might", "must", "could", "would", "should", "had", "have", "do", "does", "did"];
    if (!exceptions.includes(verb) && verb.endsWith("s")) {
      issues.push({
        message: `"${match[1]}" usually takes a verb without "s" (e.g. "${match[1]} ${verb.slice(0, -1)}")`,
        start: match.index,
        end: match.index + match[0].length,
        suggestion: `${match[1]} ${verb.slice(0, -1)}`,
      });
    }
  }

  // 7. "its" vs "it's" confusion (possessive vs contraction)
  const itsPattern = /\bits\b/g;
  while ((match = itsPattern.exec(text)) !== null) {
    const before = text.slice(Math.max(0, match.index - 20), match.index);
    const after = text.slice(match.index + 3, match.index + 23);
    if (!before.includes("'") && !after.includes("'")) {
      // Only flag if it looks like it should be "it is"
    }
  }

  // 8. "there is" with plural noun
  const thereIsPattern = /\bthere is\s+a\s+(\w+(?:s|es|ies|ves))\b/gi;
  while ((match = thereIsPattern.exec(text)) !== null) {
    issues.push({
      message: `"There is" should be "There are" with plural "${match[1]}"`,
      start: match.index,
      end: match.index + match[0].length,
      suggestion: match[0].replace(/there is/i, "There are"),
    });
  }

  // 9. "there are" with singular noun
  const thereArePattern = /\bthere are\s+a(?:n)?\s+(\w+)\b/gi;
  while ((match = thereArePattern.exec(text)) !== null) {
    issues.push({
      message: `"There are" should be "There is" with singular "${match[1]}"`,
      start: match.index,
      end: match.index + match[0].length,
      suggestion: match[0].replace(/there are/i, "There is"),
    });
  }

  // 10. Wrong article "a" before vowel sound
  const aVowelPattern = /\ba\s+([aeiou]\w+)/gi;
  while ((match = aVowelPattern.exec(text)) !== null) {
    const word = match[1];
    // Don't flag words starting with "eu" or "un" that sound like consonants
    if (/^(eu|university|unicorn|uniform|unique|united|universal|unanimous|useful)/i.test(word)) continue;
    issues.push({
      message: `"a" should be "an" before "${word}" (vowel sound)`,
      start: match.index,
      end: match.index + match[0].length,
      suggestion: match[0].replace(/a\s+/i, "an "),
    });
  }

  // 11. Wrong article "an" before consonant sound
  const anConsonantPattern = /\ban\s+([^aeiou\s]\w+)/gi;
  while ((match = anConsonantPattern.exec(text)) !== null) {
    const word = match[1];
    if (/^[aeiou]/i.test(word)) continue;
    issues.push({
      message: `"an" should be "a" before "${word}" (consonant sound)`,
      start: match.index,
      end: match.index + match[0].length,
      suggestion: match[0].replace(/an\s+/i, "a "),
    });
  }

  return issues;
}

// ─── React Component ───

interface SpellCheckPanelProps {
  elements: { id: string; type: string; content: string }[];
  onFix: (elementId: string, original: string, replacement: string) => void;
  onIgnore: (elementId: string, word: string) => void;
}

export function SpellCheckPanel({ elements, onFix, onIgnore }: SpellCheckPanelProps) {
  const [activeTab, setActiveTab] = useState<"spelling" | "grammar">("spelling");

  const textElements = elements.filter(el => el.type === "text" && el.content.trim());

  const spellingIssues = useMemo(() => {
    const map: Record<string, SpellingIssue[]> = {};
    for (const el of textElements) {
      map[el.id] = checkSpelling(el.content);
    }
    return map;
  }, [textElements]);

  const grammarIssues = useMemo(() => {
    const map: Record<string, GrammarIssue[]> = {};
    for (const el of textElements) {
      map[el.id] = checkGrammar(el.content);
    }
    return map;
  }, [textElements]);

  const [ignored, setIgnored] = useState<Set<string>>(new Set());

  const handleIgnore = useCallback((elId: string, word: string) => {
    setIgnored(prev => new Set(prev).add(`${elId}:${word}`));
    onIgnore(elId, word);
  }, [onIgnore]);

  const totalSpelling = Object.values(spellingIssues).flat().length;
  const totalGrammar = Object.values(grammarIssues).flat().length;

  const handleFixAll = useCallback(() => {
    const allSpelling = Object.entries(spellingIssues).flatMap(([elId, issues]) =>
      issues.map(i => ({ elId, original: i.word, replacement: i.suggestions[0] || i.word }))
    );
    for (const { elId, original, replacement } of allSpelling) {
      const el = textElements.find(e => e.id === elId);
      if (el) onFix(elId, original, replacement);
    }
    const allGrammar = Object.entries(grammarIssues).flatMap(([elId, issues]) =>
      issues.map(i => ({ elId, original: "", replacement: i.suggestion }))
    );
    for (const { elId, replacement } of allGrammar) {
      const origContent = textElements.find(e => e.id === elId)?.content || "";
      onFix(elId, origContent, replacement);
    }
  }, [spellingIssues, grammarIssues, textElements, onFix]);

  return (
    <div className="flex flex-col h-full bg-[#231F1D] text-white">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between shrink-0">
        <span className="text-xs font-medium text-white/40 flex items-center gap-1.5">
          <CheckCheck className="w-3.5 h-3.5" /> Spell & Grammar
        </span>
        <button onClick={handleFixAll} className="text-[10px] bg-sienna/20 text-sienna px-2 py-1 rounded hover:bg-sienna/30 transition-all">
          Fix All
        </button>
      </div>

      <div className="flex border-b border-white/5 shrink-0">
        <button onClick={() => setActiveTab("spelling")} className={`flex-1 text-[10px] py-2 transition-all ${activeTab === "spelling" ? "text-sienna border-b-2 border-sienna" : "text-white/30 hover:text-white/50"}`}>
          Spelling{totalSpelling > 0 && <span className="ml-1 text-[9px] bg-sienna/20 text-sienna px-1 rounded">{totalSpelling}</span>}
        </button>
        <button onClick={() => setActiveTab("grammar")} className={`flex-1 text-[10px] py-2 transition-all ${activeTab === "grammar" ? "text-sienna border-b-2 border-sienna" : "text-white/30 hover:text-white/50"}`}>
          Grammar{totalGrammar > 0 && <span className="ml-1 text-[9px] bg-sienna/20 text-sienna px-1 rounded">{totalGrammar}</span>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "spelling" ? (
          Object.keys(spellingIssues).length === 0 ? (
            <div className="p-4 text-center text-[11px] text-white/20">No text elements to check</div>
          ) : (
            Object.entries(spellingIssues).map(([elId, issues]) => {
              const el = textElements.find(e => e.id === elId);
              const visible = issues.filter(i => !ignored.has(`${elId}:${i.word}`));
              if (visible.length === 0) return null;
              return (
                <div key={elId} className="border-b border-white/5 last:border-0">
                  <div className="px-4 pt-3 pb-1 text-[9px] text-white/20 uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {el?.content.slice(0, 40)}{(el?.content.length || 0) > 40 ? "..." : ""}
                  </div>
                  {visible.map((issue, i) => (
                    <div key={i} className="px-4 py-2 hover:bg-white/[0.02]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[13px] text-red-400 font-medium">{issue.word}</span>
                          {issue.suggestions.length > 0 && (
                            <div className="text-[10px] text-white/30 mt-0.5">
                              Suggestions: {issue.suggestions.join(", ")}
                            </div>
                          )}
                          {issue.suggestions.length === 0 && (
                            <div className="text-[10px] text-white/20 mt-0.5">No suggestions</div>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => handleIgnore(elId, issue.word)} className="text-[9px] text-white/30 hover:text-white/60 bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded transition-all">
                            Ignore
                          </button>
                          {issue.suggestions.length > 0 && (
                            <button onClick={() => onFix(elId, issue.word, issue.suggestions[0])} className="text-[9px] text-sienna bg-sienna/10 hover:bg-sienna/20 px-1.5 py-0.5 rounded transition-all">
                              Fix
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })
          )
        ) : (
          Object.keys(grammarIssues).length === 0 ? (
            <div className="p-4 text-center text-[11px] text-white/20">No text elements to check</div>
          ) : (
            Object.entries(grammarIssues).map(([elId, issues]) => {
              const el = textElements.find(e => e.id === elId);
              if (issues.length === 0) return null;
              return (
                <div key={elId} className="border-b border-white/5 last:border-0">
                  <div className="px-4 pt-3 pb-1 text-[9px] text-white/20 uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {el?.content.slice(0, 40)}{(el?.content.length || 0) > 40 ? "..." : ""}
                  </div>
                  {issues.map((issue, i) => (
                    <div key={i} className="px-4 py-2 hover:bg-white/[0.02]">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] text-yellow-400/80">{issue.message}</div>
                          <div className="text-[10px] text-white/30 mt-0.5 truncate">{issue.suggestion}</div>
                        </div>
                        <button onClick={() => {
                          const element = textElements.find(e => e.id === elId);
                          if (element) onFix(elId, element.content, issue.suggestion);
                        }} className="text-[9px] text-sienna bg-sienna/10 hover:bg-sienna/20 px-1.5 py-0.5 rounded transition-all shrink-0">
                          Fix
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })
          )
        )}
        {activeTab === "spelling" && Object.values(spellingIssues).flat().filter(i => !ignored.has(`:${i.word}`)).length === 0 && Object.keys(spellingIssues).length > 0 && (
          <div className="p-4 text-center text-[11px] text-green-400/60 flex items-center justify-center gap-1">
            <CheckCheck className="w-3.5 h-3.5" /> No spelling issues found
          </div>
        )}
      </div>
    </div>
  );
}
